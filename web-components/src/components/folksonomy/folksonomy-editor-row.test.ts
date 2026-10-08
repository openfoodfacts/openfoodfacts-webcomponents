import { beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("../../api/folksonomy", () => ({
  default: {
    fetchKeys: vi.fn().mockResolvedValue([]),
    fetchValues: vi.fn().mockResolvedValue([]),
    updateProductProperty: vi.fn(),
    deleteProductProperty: vi.fn(),
    addProductProperty: vi.fn(),
  },
}))

beforeAll(async () => {
  await import("./folksonomy-editor-row")
})

describe("folksonomy-editor-row", () => {
  it("renders multiline value with pre-wrap", async () => {
    const element = document.createElement("folksonomy-editor-row") as any
    element.key = "test-key"
    element.value = "line 1\nline 2"
    element.pageType = "view"
    document.body.appendChild(element)
    await element.updateComplete

    const td = element.shadowRoot.querySelector(".value-cell")
    expect(td).toBeTruthy()
    expect(td.textContent.trim()).toBe("line 1\nline 2")
    expect(getComputedStyle(td).whiteSpace).toBe("pre-wrap")
  })

  it("uses a textarea for editing to support multiline values", async () => {
    const element = document.createElement("folksonomy-editor-row") as any
    element.key = "test-key"
    element.value = "line 1\nline 2"
    element.pageType = "edit"
    document.body.appendChild(element)
    await element.updateComplete

    const textarea = element.shadowRoot.querySelector("textarea.input")
    expect(textarea).toBeTruthy()
    expect(textarea.value).toBe("line 1\nline 2")
  })
})
