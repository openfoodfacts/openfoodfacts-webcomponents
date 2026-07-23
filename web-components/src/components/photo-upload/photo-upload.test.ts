import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import "./photo-upload"
import { PhotoUpload } from "./photo-upload"
import * as openfoodfactsApi from "../../api/openfoodfacts"

describe("PhotoUpload Component", () => {
  let element: PhotoUpload

  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL for jsdom
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => "blob:mock-preview-url")
    } else {
      vi.spyOn(global.URL, "createObjectURL").mockReturnValue("blob:mock-preview-url")
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn()
    } else {
      vi.spyOn(global.URL, "revokeObjectURL").mockImplementation(() => {})
    }

    element = document.createElement("photo-upload") as PhotoUpload
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
    vi.restoreAllMocks()
  })

  it("renders with default properties", async () => {
    await element.updateComplete
    expect(element.uploadType).toBe("image")
    expect(element.language).toBe("en")
    expect(element.disabled).toBe(false)
    expect(element.loading).toBe(false)

    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")
    expect(hiddenInput).not.toBeNull()
    expect(hiddenInput?.accept).toBe("image/*")
  })

  it("reflects properties correctly", async () => {
    element.uploadType = "nutrition"
    element.language = "fr"
    element.disabled = true
    await element.updateComplete

    expect(element.getAttribute("upload-type")).toBe("nutrition")
    expect(element.getAttribute("language")).toBe("fr")
    expect(element.hasAttribute("disabled")).toBe(true)
  })

  it("handles valid image file selection and emits file-selected event", async () => {
    const fileSelectedSpy = vi.fn()
    element.addEventListener("file-selected", fileSelectedSpy)

    await element.updateComplete

    const testFile = new File(["test-image-binary"], "test.png", { type: "image/png" })
    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")

    Object.defineProperty(hiddenInput, "files", {
      value: [testFile],
      writable: false,
    })

    hiddenInput?.dispatchEvent(new Event("change"))
    await element.updateComplete

    expect(fileSelectedSpy).toHaveBeenCalledOnce()
    const eventDetail = fileSelectedSpy.mock.calls[0][0].detail
    expect(eventDetail.file).toBe(testFile)
    expect(eventDetail.uploadType).toBe("image")
    expect(eventDetail.language).toBe("en")

    const previewImg = element.shadowRoot?.querySelector<HTMLImageElement>(".preview-image")
    expect(previewImg).not.toBeNull()
    expect(previewImg?.src).toContain("blob:mock-preview-url")
  })

  it("rejects non-image files and emits upload-error event", async () => {
    const errorSpy = vi.fn()
    element.addEventListener("upload-error", errorSpy)

    await element.updateComplete

    const invalidFile = new File(["text content"], "document.pdf", { type: "application/pdf" })
    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")

    Object.defineProperty(hiddenInput, "files", {
      value: [invalidFile],
      writable: false,
    })

    hiddenInput?.dispatchEvent(new Event("change"))
    await element.updateComplete

    expect(errorSpy).toHaveBeenCalledOnce()
    const errorDiv = element.shadowRoot?.querySelector(".error")
    expect(errorDiv).not.toBeNull()
    expect(errorDiv?.textContent).toContain("valid image file")
  })

  it("rejects files exceeding maxFileSize", async () => {
    element.maxFileSize = 100 // 100 bytes
    const errorSpy = vi.fn()
    element.addEventListener("upload-error", errorSpy)

    await element.updateComplete

    const largeFile = new File([new ArrayBuffer(200)], "large.jpg", { type: "image/jpeg" })
    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")

    Object.defineProperty(hiddenInput, "files", {
      value: [largeFile],
      writable: false,
    })

    hiddenInput?.dispatchEvent(new Event("change"))
    await element.updateComplete

    expect(errorSpy).toHaveBeenCalledOnce()
    const errorDiv = element.shadowRoot?.querySelector(".error")
    expect(errorDiv?.textContent).toContain("exceeds maximum limit")
  })

  it("clears selection when clearSelection is called", async () => {
    const fileRemovedSpy = vi.fn()
    element.addEventListener("file-removed", fileRemovedSpy)

    const testFile = new File(["test-image-binary"], "test.png", { type: "image/png" })
    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")
    Object.defineProperty(hiddenInput, "files", { value: [testFile], writable: false })
    hiddenInput?.dispatchEvent(new Event("change"))
    await element.updateComplete

    expect(element.shadowRoot?.querySelector(".preview-image")).not.toBeNull()

    element.clearSelection()
    await element.updateComplete

    expect(fileRemovedSpy).toHaveBeenCalledOnce()
    expect(element.shadowRoot?.querySelector(".preview-image")).toBeNull()
  })

  it("emits upload-start and upload-success on upload without barcode", async () => {
    const startSpy = vi.fn()
    const successSpy = vi.fn()
    element.addEventListener("upload-start", startSpy)
    element.addEventListener("upload-success", successSpy)

    const testFile = new File(["image data"], "front.jpg", { type: "image/jpeg" })
    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")
    Object.defineProperty(hiddenInput, "files", { value: [testFile], writable: false })
    hiddenInput?.dispatchEvent(new Event("change"))
    await element.updateComplete

    await element.upload()
    await element.updateComplete

    expect(startSpy).toHaveBeenCalledOnce()
    expect(successSpy).toHaveBeenCalledOnce()

    const statusDiv = element.shadowRoot?.querySelector(".success")
    expect(statusDiv).not.toBeNull()
  })

  it("calls uploadProductImage API helper when barcode is present", async () => {
    const uploadApiSpy = vi.spyOn(openfoodfactsApi, "uploadProductImage").mockResolvedValue({
      status: "status ok",
      imagefield: "front",
    })

    element.barcode = "1234567890"
    element.uploadType = "front"
    element.language = "fr"

    const testFile = new File(["image data"], "front.jpg", { type: "image/jpeg" })
    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")
    Object.defineProperty(hiddenInput, "files", { value: [testFile], writable: false })
    hiddenInput?.dispatchEvent(new Event("change"))
    await element.updateComplete

    await element.upload()
    await element.updateComplete

    expect(uploadApiSpy).toHaveBeenCalledWith({
      code: "1234567890",
      imagefield: "front",
      file: testFile,
      imgupload_lang: "fr",
    })
  })

  it("handles API upload error and emits upload-error event", async () => {
    vi.spyOn(openfoodfactsApi, "uploadProductImage").mockRejectedValue(new Error("Network Error"))

    const errorSpy = vi.fn()
    element.addEventListener("upload-error", errorSpy)

    element.barcode = "1234567890"
    const testFile = new File(["image data"], "front.jpg", { type: "image/jpeg" })
    const hiddenInput = element.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")
    Object.defineProperty(hiddenInput, "files", { value: [testFile], writable: false })
    hiddenInput?.dispatchEvent(new Event("change"))
    await element.updateComplete

    await element.upload()
    await element.updateComplete

    expect(errorSpy).toHaveBeenCalledOnce()
    const errorDiv = element.shadowRoot?.querySelector(".error")
    expect(errorDiv?.textContent).toContain("Network Error")
  })
})
