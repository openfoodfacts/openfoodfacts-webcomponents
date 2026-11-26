import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import type { DeleteModal } from "./delete-modal"
import type { FolksonomyEditorRow } from "./folksonomy-editor-row"

const api = vi.hoisted(() => ({
  fetchKeys: vi.fn(),
  fetchValues: vi.fn(),
  deleteProductProperty: vi.fn(),
}))

vi.mock("../../api/folksonomy", () => ({ default: api }))

beforeAll(async () => {
  await import("./folksonomy-editor-row")
})

beforeEach(() => {
  document.body.innerHTML = ""
  api.fetchKeys.mockReset().mockResolvedValue([])
  api.deleteProductProperty.mockReset().mockResolvedValue({ success: true })
})

const createRow = async () => {
  const element = document.createElement("folksonomy-editor-row") as FolksonomyEditorRow
  Object.assign(element, { productCode: "3017620422003", pageType: "edit", key: "color" })
  const table = document.createElement("table")
  table.appendChild(element)
  document.body.appendChild(table)
  await element.updateComplete
  return element
}

const openDeleteModal = async (row: FolksonomyEditorRow) => {
  const deleteButton = Array.from(row.shadowRoot!.querySelectorAll("button")).find(
    (button) => button.textContent?.trim() === "Delete"
  )!
  deleteButton.click()
  await row.updateComplete
  const modal = row.shadowRoot!.querySelector<DeleteModal>("delete-modal")!
  await modal.updateComplete
  return modal
}

const modalButton = (modal: DeleteModal, label: string) =>
  Array.from(modal.shadowRoot!.querySelectorAll("button")).find(
    (button) => button.textContent?.trim() === label
  )!

describe("delete-modal in folksonomy-editor-row", () => {
  it("renders the modal inside the row so it inherits the row's theme variables", async () => {
    const row = await createRow()
    await openDeleteModal(row)

    expect(row.shadowRoot!.querySelector("delete-modal")).not.toBeNull()
    expect(document.body.querySelector("delete-modal")).toBeNull()
  })

  it("removes the modal and its keydown listener when Cancel is clicked", async () => {
    const row = await createRow()
    const modal = await openDeleteModal(row)
    const removeListener = vi.spyOn(document, "removeEventListener")

    modalButton(modal, "Cancel").click()
    await row.updateComplete

    expect(row.shadowRoot!.querySelector("delete-modal")).toBeNull()
    expect(modal.isConnected).toBe(false)
    expect(removeListener).toHaveBeenCalledWith("keydown", expect.any(Function))
    expect(api.deleteProductProperty).not.toHaveBeenCalled()
  })

  it("removes the modal when Escape is pressed or the overlay is clicked", async () => {
    const row = await createRow()

    await openDeleteModal(row)
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    await row.updateComplete
    expect(row.shadowRoot!.querySelector("delete-modal")).toBeNull()

    const modal = await openDeleteModal(row)
    modal.shadowRoot!.querySelector<HTMLElement>(".overlay")!.click()
    await row.updateComplete
    expect(row.shadowRoot!.querySelector("delete-modal")).toBeNull()
  })

  it("does not accumulate modals when the dialog is opened and cancelled repeatedly", async () => {
    const row = await createRow()

    for (let i = 0; i < 3; i++) {
      const modal = await openDeleteModal(row)
      modalButton(modal, "Cancel").click()
      await row.updateComplete
    }

    expect(document.querySelectorAll("delete-modal")).toHaveLength(0)
    expect(row.shadowRoot!.querySelectorAll("delete-modal")).toHaveLength(0)
  })

  it("deletes the property and closes the modal when deletion is confirmed", async () => {
    const row = await createRow()
    const onDelete = vi.fn()
    row.addEventListener("delete-row", onDelete)
    const modal = await openDeleteModal(row)

    modalButton(modal, "Delete").click()
    await vi.waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1))

    expect(api.deleteProductProperty).toHaveBeenCalledWith("3017620422003", "color", 1)
    expect(row.shadowRoot!.querySelector("delete-modal")).toBeNull()
  })
})
