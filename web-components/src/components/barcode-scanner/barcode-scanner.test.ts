import { render } from "lit"
import { describe, expect, it, vi } from "vitest"
import { BarcodeScanner } from "./barcode-scanner"

type ScannerState = {
  detectFn?: () => Promise<string | undefined>
  stream: MediaStream | null
  renderOverlay: () => ReturnType<BarcodeScanner["render"]>
}

const renderOverlay = (scanner: BarcodeScanner) => {
  const container = document.createElement("div")
  render((scanner as unknown as ScannerState).renderOverlay(), container)
  return container.querySelectorAll<HTMLButtonElement>("button")
}

describe("barcode-scanner", () => {
  it("labels scan actions and keeps scanner controls from submitting forms", () => {
    const scanner = new BarcodeScanner()
    const state = scanner as unknown as ScannerState
    state.detectFn = vi.fn()

    const idleButtons = renderOverlay(scanner)
    state.stream = {} as MediaStream
    const activeButtons = renderOverlay(scanner)
    const buttons = [...idleButtons, ...activeButtons]

    expect(buttons).toHaveLength(3)
    buttons.forEach((button) => {
      expect(button.type).toBe("button")
    })
    expect(buttons[0].getAttribute("aria-label")).toBe("Scan barcode")
    expect(buttons[2].getAttribute("aria-label")).toBe("Scan barcode")
  })
})
