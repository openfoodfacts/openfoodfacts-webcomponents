import { afterEach, describe, expect, it, vi } from "vitest"
import folksonomyApi from "../../api/folksonomy"
import { FolksonomyEditorRow } from "./folksonomy-editor-row"

describe("FolksonomyEditorRow", () => {
  let element: FolksonomyEditorRow | undefined

  afterEach(() => {
    element?.remove()
    element = undefined
  })

  const renderRow = async (empty = false) => {
    vi.spyOn(folksonomyApi, "fetchKeys").mockResolvedValue([])
    element = document.createElement("folksonomy-editor-row") as FolksonomyEditorRow
    element.empty = empty
    element.pageType = "edit"
    document.body.append(element)
    await element.updateComplete
    return element
  }

  it("renders non-submit controls in the add row", async () => {
    const row = await renderRow(true)

    expect(row.shadowRoot?.querySelector("button")?.type).toBe("button")
  })

  it("renders non-submit controls in edit mode", async () => {
    const row = await renderRow()
    row.editable = true
    await row.updateComplete

    const buttons = [...(row.shadowRoot?.querySelectorAll("button") ?? [])]
    expect(buttons).not.toHaveLength(0)
    expect(buttons.every((button) => button.type === "button")).toBe(true)
  })
})
