import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { EventType } from "../../constants"
import { BarcodeScannerState, type BarcodeScanner } from "./barcode-scanner"

type StateDetail = { barcode?: string; state: BarcodeScannerState }

let frames: Array<{ id: number; callback: FrameRequestCallback }>
let nextFrameId: number
let detect: ReturnType<typeof vi.fn>
let getUserMedia: ReturnType<typeof vi.fn>
let tracks: Array<{ stop: ReturnType<typeof vi.fn> }>

/** Runs the animation frames queued so far, waiting for each async callback. */
const runFrames = async () => {
  const pending = frames.splice(0)
  for (const frame of pending) {
    await frame.callback(0)
  }
}

const createScanner = async () => {
  const element = document.createElement("barcode-scanner") as BarcodeScanner
  const states: StateDetail[] = []
  element.addEventListener(EventType.BARCODE_SCANNER_STATE, (event) => {
    states.push((event as CustomEvent<StateDetail>).detail)
  })
  document.body.appendChild(element)
  await element.updateComplete
  return { element, states }
}

const overlay = (element: BarcodeScanner) =>
  element.shadowRoot!.querySelector<HTMLElement>(".cta-overlay-wrapper")!

const startScanning = async (element: BarcodeScanner, states: StateDetail[]) => {
  overlay(element).click()
  await vi.waitFor(() =>
    expect(states.map((detail) => detail.state)).toContain(BarcodeScannerState.STARTED)
  )
  await element.updateComplete
}

beforeAll(async () => {
  await import("./barcode-scanner")
})

beforeEach(() => {
  document.body.innerHTML = ""
  frames = []
  nextFrameId = 0
  tracks = []

  detect = vi.fn().mockResolvedValue([])
  vi.stubGlobal(
    "BarcodeDetector",
    class {
      detect = detect
    }
  )
  vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({}))
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = ++nextFrameId
    frames.push({ id, callback })
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frames = frames.filter((frame) => frame.id !== id)
  })

  getUserMedia = vi.fn().mockImplementation(async () => {
    const track = { stop: vi.fn() }
    tracks.push(track)
    return { getTracks: () => [track] }
  })
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  })
  Object.defineProperty(navigator, "permissions", {
    configurable: true,
    value: { query: vi.fn().mockResolvedValue({ state: "granted" }) },
  })
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockReturnValue(false)
})

describe("barcode-scanner", () => {
  it("does not open a second camera stream when the overlay is clicked while scanning", async () => {
    const { element, states } = await createScanner()
    await startScanning(element, states)

    // Both the overlay and its center button are clickable while scanning.
    overlay(element).click()
    element.shadowRoot!.querySelector<HTMLElement>(".cta-overlay-button")!.click()
    await element.updateComplete

    expect(getUserMedia).toHaveBeenCalledTimes(1)
  })

  it("ignores repeated start requests while the camera is starting", async () => {
    const { element, states } = await createScanner()

    overlay(element).click()
    overlay(element).click()
    await vi.waitFor(() =>
      expect(states.map((detail) => detail.state)).toContain(BarcodeScannerState.STARTED)
    )

    expect(getUserMedia).toHaveBeenCalledTimes(1)
  })

  it("releases the camera when Close is clicked after tapping the overlay", async () => {
    const { element, states } = await createScanner()
    await startScanning(element, states)
    overlay(element).click()
    await element.updateComplete

    element.shadowRoot!.querySelector<HTMLElement>(".cta-exit-button button")!.click()

    expect(tracks).not.toHaveLength(0)
    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalled()
    }
  })

  it("stops the detection loop after Close", async () => {
    const { element, states } = await createScanner()
    await startScanning(element, states)
    await runFrames()
    expect(detect).toHaveBeenCalledTimes(1)

    element.shadowRoot!.querySelector<HTMLElement>(".cta-exit-button button")!.click()
    await runFrames()

    expect(frames).toHaveLength(0)
    expect(detect).toHaveBeenCalledTimes(1)
  })

  it("ends the loop without reporting when Close happens while a frame is analysed", async () => {
    const { element, states } = await createScanner()
    await startScanning(element, states)

    let resolveDetection!: (barcodes: { rawValue: string }[]) => void
    detect.mockReturnValueOnce(new Promise((resolve) => (resolveDetection = resolve)))
    const pendingFrame = runFrames()
    await vi.waitFor(() => expect(detect).toHaveBeenCalledTimes(1))

    element.shadowRoot!.querySelector<HTMLElement>(".cta-exit-button button")!.click()
    resolveDetection([{ rawValue: "3017620422003" }])
    await pendingFrame

    expect(frames).toHaveLength(0)
    expect(states.map((detail) => detail.state)).not.toContain(BarcodeScannerState.DETECTED)
  })

  it("releases the camera and allows a retry when the video fails to play", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error("NotAllowedError"))
    const { element, states } = await createScanner()

    overlay(element).click()
    await vi.waitFor(() => expect(tracks).toHaveLength(1))
    await vi.waitFor(() => expect(tracks[0].stop).toHaveBeenCalled())
    await element.updateComplete

    await startScanning(element, states)
    expect(getUserMedia).toHaveBeenCalledTimes(2)
  })

  it("does not start a detection loop when a STARTED listener removes the element", async () => {
    const { element, states } = await createScanner()
    element.addEventListener(EventType.BARCODE_SCANNER_STATE, (event) => {
      if ((event as CustomEvent<StateDetail>).detail.state === BarcodeScannerState.STARTED) {
        element.remove()
      }
    })

    overlay(element).click()
    await vi.waitFor(() =>
      expect(states.map((detail) => detail.state)).toContain(BarcodeScannerState.STARTED)
    )
    await runFrames()

    expect(frames).toHaveLength(0)
    expect(detect).not.toHaveBeenCalled()
  })

  it("reports a detected barcode once, even after the overlay was tapped", async () => {
    const { element, states } = await createScanner()
    await startScanning(element, states)
    overlay(element).click()
    await element.updateComplete

    detect.mockResolvedValue([{ rawValue: "3017620422003" }])
    await runFrames()
    await runFrames()

    const detected = states.filter((detail) => detail.state === BarcodeScannerState.DETECTED)
    expect(detected).toEqual([{ barcode: "3017620422003", state: BarcodeScannerState.DETECTED }])
    expect(frames).toHaveLength(0)
  })
})
