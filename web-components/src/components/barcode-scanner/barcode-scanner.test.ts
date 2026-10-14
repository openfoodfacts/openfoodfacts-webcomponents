import { beforeEach, describe, expect, it, vi } from "vitest"
import { BarcodeScanner } from "./barcode-scanner"

describe("BarcodeScanner", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "BarcodeDetector",
      vi.fn().mockImplementation(() => ({ detect: vi.fn() }))
    )
  })

  it("asks the browser to detect GS1 QR codes", () => {
    new BarcodeScanner()

    expect(BarcodeDetector).toHaveBeenCalledWith({
      formats: ["ean_13", "ean_8", "qr_code"],
    })
  })
})
