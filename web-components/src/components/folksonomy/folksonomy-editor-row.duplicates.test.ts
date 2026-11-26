import { afterEach, describe, expect, it, vi } from "vitest"
import folksonomyApi from "../../api/folksonomy"
import { FolksonomyEditorRow } from "./folksonomy-editor-row"

describe("FolksonomyEditorRow duplicate properties", () => {
  let element: FolksonomyEditorRow | undefined

  afterEach(() => {
    element?.remove()
    element = undefined
  })

  const renderRow = async () => {
    vi.spyOn(folksonomyApi, "fetchKeys").mockResolvedValue([])
    element = document.createElement("folksonomy-editor-row") as FolksonomyEditorRow
    element.empty = true
    document.body.append(element)
    await element.updateComplete
    return element
  }

  const submit = async (row: FolksonomyEditorRow, key: string, value: string) => {
    Reflect.set(row, "keyInput", key)
    Reflect.set(row, "valueInput", value)
    const addCustomKeyAndValue = Reflect.get(row, "addCustomKeyAndValue") as () => Promise<void>
    await addCustomKeyAndValue.call(row)
    await row.updateComplete
  }

  it("shows an actionable error without calling the API for an existing property", async () => {
    const addProductProperty = vi.spyOn(folksonomyApi, "addProductProperty")
    const row = await renderRow()
    row.existingKeys = ["producer"]

    await submit(row, "producer", "Example Foods")

    expect(addProductProperty).not.toHaveBeenCalled()
    expect(row.shadowRoot?.querySelector("[role=alert]")?.textContent).toContain(
      "This property already exists"
    )
  })

  it("shows an actionable error when the server rejects a concurrent duplicate", async () => {
    vi.spyOn(folksonomyApi, "addProductProperty").mockRejectedValue(
      new Error("HTTP error! status: 422")
    )
    const row = await renderRow()

    await submit(row, "producer", "Example Foods")

    expect(row.shadowRoot?.querySelector("[role=alert]")?.textContent).toContain(
      "This property already exists"
    )
  })
})
