import { fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { BarcodeScanner } from "./barcode-scanner"

describe("BarcodeScanner", () => {
  let barcodeDetectorConstructor: ReturnType<
    typeof vi.fn<(options?: { formats: string[] }) => void>
  >

  beforeEach(() => {
    barcodeDetectorConstructor = vi.fn<(options?: { formats: string[] }) => void>()
    class BarcodeDetectorMock {
      detect = vi.fn()

      constructor(options?: { formats: string[] }) {
        barcodeDetectorConstructor(options)
      }
    }
    vi.stubGlobal("BarcodeDetector", BarcodeDetectorMock)
  })

  it("asks the browser to detect GS1 QR codes", () => {
    new BarcodeScanner()

    expect(barcodeDetectorConstructor).toHaveBeenCalledWith({
      formats: ["ean_13", "ean_8", "qr_code"],
    })
  })

  it("names the button that starts barcode scanning", async () => {
    const element = await fixture<BarcodeScanner>(html`<barcode-scanner></barcode-scanner>`)
    const startButton = element.shadowRoot!.querySelector<HTMLButtonElement>(".start-scanning")

    expect(startButton?.getAttribute("type")).toBe("button")
    expect(startButton?.getAttribute("aria-label")).toBe("Start barcode scanning")
  })
})
