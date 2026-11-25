import { describe, expect, it, vi } from "vitest"
import { fixture, elementUpdated } from "@open-wc/testing/pure"
import { html } from "lit"
import { PackagingInput, type PackagingChangeEvent } from "./packaging-input"

const makeEditor = () => fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
const inputs = (editor: PackagingInput) => Array.from(editor.shadowRoot!.querySelectorAll("input"))
const buttons = (editor: PackagingInput) =>
  Array.from(editor.shadowRoot!.querySelectorAll<HTMLButtonElement>("button"))

const edit = async (editor: PackagingInput, value: string, index = 0) => {
  const input = inputs(editor)[index]
  input.value = value
  input.dispatchEvent(new Event("change", { bubbles: true }))
  await elementUpdated(editor)
}

describe("packaging-input", () => {
  it.each([[], null, undefined])("accepts empty input %j without emitting", async (value) => {
    const editor = await makeEditor()
    const listener = vi.fn()
    editor.addEventListener("packaging-change", listener)
    editor.packagings = value
    await elementUpdated(editor)
    expect(inputs(editor)).toHaveLength(0)
    expect(editor.shadowRoot!.textContent).toContain("No packaging parts.")
    expect(listener).not.toHaveBeenCalled()
  })

  it("preserves additional fields and other parts without mutating input or sharing event data", async () => {
    const editor = await makeEditor()
    const source = [
      {
        number_of_units: 1,
        material: { id: "en:glass" },
        weight_measured: 120,
        extra: { note: "keep" },
      },
      { number_of_units: 3, shape: { id: "en:bottle-cap" } },
    ]
    const original = structuredClone(source)
    Object.freeze(source[0])
    Object.freeze(source)
    editor.packagings = source
    await elementUpdated(editor)
    const listener = vi.fn<(event: PackagingChangeEvent) => void>()
    editor.addEventListener("packaging-change", listener)
    await edit(editor, "2")
    const event = listener.mock.calls[0][0]
    expect(event.bubbles).toBe(true)
    expect(event.composed).toBe(true)
    expect(event.detail.packagings).toEqual([{ ...original[0], number_of_units: 2 }, original[1]])
    expect(source).toEqual(original)
    event.detail.packagings[0].material!.id = "changed-by-host"
    expect(editor.packagings![0].material!.id).toBe("en:glass")
    await edit(editor, "4", 1)
    expect(listener.mock.calls[1][0].detail.packagings[0].number_of_units).toBe(2)
  })

  it("accepts external replacements without emitting a user change", async () => {
    const editor = await makeEditor()
    editor.packagings = [{ number_of_units: 1 }]
    await elementUpdated(editor)
    await edit(editor, "2")
    const listener = vi.fn()
    editor.addEventListener("packaging-change", listener)
    editor.packagings = [{ number_of_units: 7, shape: { lc_name: "Bottle" } }]
    await elementUpdated(editor)
    expect(inputs(editor)[0].value).toBe("7")
    expect(editor.shadowRoot!.textContent).toContain("Bottle")
    expect(listener).not.toHaveBeenCalled()
  })

  it("supports incomplete parts and removes cleared units", async () => {
    const editor = await makeEditor()
    editor.packagings = [{}, { number_of_units: 1 }]
    await elementUpdated(editor)
    expect(inputs(editor)[0].value).toBe("")
    await edit(editor, "", 1)
    expect(editor.packagings![1]).not.toHaveProperty("number_of_units")
  })

  it("rejects values below one, accepts decimals provisionally, and ignores unchanged values", async () => {
    const editor = await makeEditor()
    editor.packagings = [{ number_of_units: 1 }]
    await elementUpdated(editor)
    const listener = vi.fn()
    editor.addEventListener("packaging-change", listener)
    await edit(editor, "0")
    expect(editor.packagings![0].number_of_units).toBe(1)
    await edit(editor, "1")
    expect(listener).not.toHaveBeenCalled()
    await edit(editor, "1.5")
    expect(editor.packagings![0].number_of_units).toBe(1.5)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("adds parts and emits a complete copied list", async () => {
    const editor = await makeEditor()
    const listener = vi.fn<(event: PackagingChangeEvent) => void>()
    editor.addEventListener("packaging-change", listener)

    buttons(editor)[0].click()
    await elementUpdated(editor)
    expect(editor.packagings).toEqual([{}])
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].detail.packagings).toEqual([{}])
    expect(editor.shadowRoot!.activeElement).toBe(inputs(editor)[0])

    buttons(editor).at(-1)!.click()
    await elementUpdated(editor)
    expect(editor.packagings).toEqual([{}, {}])
    expect(listener).toHaveBeenCalledTimes(2)
    expect(editor.shadowRoot!.activeElement).toBe(inputs(editor)[1])
  })

  it("removes only the selected part and keeps additional fields", async () => {
    const editor = await makeEditor()
    editor.packagings = [
      { number_of_units: 1, weight_measured: 120 },
      { number_of_units: 2, shape: { id: "en:bottle-cap" } },
      { number_of_units: 3, material: { id: "en:glass" } },
    ]
    await elementUpdated(editor)
    const listener = vi.fn<(event: PackagingChangeEvent) => void>()
    editor.addEventListener("packaging-change", listener)

    buttons(editor)[1].click()
    await elementUpdated(editor)
    expect(editor.packagings).toEqual([
      { number_of_units: 1, weight_measured: 120 },
      { number_of_units: 3, material: { id: "en:glass" } },
    ])
    expect(listener.mock.calls[0][0].detail.packagings).toEqual(editor.packagings)
    expect(editor.shadowRoot!.activeElement).toBe(inputs(editor)[1])
  })

  it("returns to the empty state and focuses add after removing the final part", async () => {
    const editor = await makeEditor()
    editor.packagings = [{ number_of_units: 1 }]
    await elementUpdated(editor)
    const listener = vi.fn()
    editor.addEventListener("packaging-change", listener)

    buttons(editor)[0].click()
    await elementUpdated(editor)
    expect(editor.packagings).toEqual([])
    expect(inputs(editor)).toHaveLength(0)
    expect(editor.shadowRoot!.textContent).toContain("No packaging parts.")
    expect(editor.shadowRoot!.activeElement).toBe(buttons(editor)[0])
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
