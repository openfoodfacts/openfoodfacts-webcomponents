import { beforeAll, describe, expect, it } from "vitest"
import { elementUpdated, fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import type { AutocompleteSuggestion } from "../../types"
import type { AutocompleteInput } from "./autocomplete-input"

beforeAll(async () => {
  await import("./autocomplete-input")
})

const openSuggestions = async (suggestions: AutocompleteSuggestion[]) => {
  const element = await fixture<AutocompleteInput>(html`<autocomplete-input></autocomplete-input>`)
  element.suggestions = suggestions
  await elementUpdated(element)

  element.shadowRoot.querySelector("input").dispatchEvent(new Event("focus"))
  await elementUpdated(element)

  const items = element.shadowRoot!.querySelectorAll<HTMLElement>(".autocomplete-item")
  return Array.from<HTMLElement>(items).map((item) => item.textContent?.trim())
}

describe("autocomplete-input", () => {
  it("shows the count in parentheses when a suggestion has one", async () => {
    const items = await openSuggestions([
      { value: "is_original", count: 12 },
      { value: "is-original", count: 0 },
      { value: "origine" },
    ])

    expect(items).toEqual(["is_original (12)", "is-original (0)", "origine"])
  })
  it("uses the provided accessible name for the internal input", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )

    element.inputLabel = "Shape"
    await elementUpdated(element)

    const input = element.shadowRoot!.querySelector("input")
    expect(input?.getAttribute("aria-label")).toBe("Shape")

    element.inputLabel = "Material"
    await elementUpdated(element)
    expect(input?.getAttribute("aria-label")).toBe("Material")
  })

  it("does not add an empty accessible name by default", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )

    const input = element.shadowRoot!.querySelector("input")
    expect(input?.hasAttribute("aria-label")).toBe(false)
  })
  it("opens the list when suggestions arrive after focus if enabled", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )
    element.openOnSuggestionsUpdate = true
    await elementUpdated(element)

    const input = element.shadowRoot!.querySelector("input")!
    input.dispatchEvent(new Event("focus"))
    await elementUpdated(element)

    expect(element.shadowRoot!.querySelector(".autocomplete-list")).toBeNull()

    element.suggestions = [{ value: "Bottle" }]
    await elementUpdated(element)

    expect(element.shadowRoot!.querySelector(".autocomplete-item")?.textContent?.trim()).toBe(
      "Bottle"
    )
  })

  it("does not reopen after Escape while waiting for suggestions", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )
    element.openOnSuggestionsUpdate = true
    await elementUpdated(element)

    const input = element.shadowRoot!.querySelector("input")!
    input.dispatchEvent(new Event("focus"))
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))

    element.suggestions = [{ value: "Bottle" }]
    await elementUpdated(element)

    expect(element.shadowRoot!.querySelector(".autocomplete-list")).toBeNull()
  })

  it("does not open when suggestions arrive after blur", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )
    element.openOnSuggestionsUpdate = true
    await elementUpdated(element)

    const input = element.shadowRoot!.querySelector("input")!
    input.dispatchEvent(new Event("focus"))
    input.dispatchEvent(new Event("blur"))

    element.suggestions = [{ value: "Bottle" }]
    await elementUpdated(element)

    expect(element.shadowRoot!.querySelector(".autocomplete-list")).toBeNull()
  })

  it("keeps the previous behavior when opening on updates is not enabled", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )

    const input = element.shadowRoot!.querySelector("input")!
    input.dispatchEvent(new Event("focus"))

    element.suggestions = [{ value: "Bottle" }]
    await elementUpdated(element)

    expect(element.shadowRoot!.querySelector(".autocomplete-list")).toBeNull()
  })
  it("selects the highlighted suggestion without blocking Tab when configured", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )
    element.preventTabNavigation = false
    element.suggestions = [{ value: "Bottle" }]
    await elementUpdated(element)

    const input = element.shadowRoot!.querySelector("input")!
    input.dispatchEvent(new Event("focus"))
    await elementUpdated(element)

    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      })
    )
    await elementUpdated(element)

    let selectedValue = ""
    element.addEventListener("suggestion-select", (event: Event) => {
      selectedValue = (event as CustomEvent<AutocompleteSuggestion>).detail.value
    })

    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    })
    input.dispatchEvent(tab)

    expect(selectedValue).toBe("Bottle")
    expect(tab.defaultPrevented).toBe(false)
  })
  it("keeps suggestions open when refocused before the blur delay ends", async () => {
    const element = await fixture<AutocompleteInput>(
      html`<autocomplete-input></autocomplete-input>`
    )
    element.openOnSuggestionsUpdate = true
    element.suggestions = [{ value: "Bottle" }]
    await elementUpdated(element)

    const input = element.shadowRoot!.querySelector("input")!
    input.dispatchEvent(new Event("focus"))
    await elementUpdated(element)

    input.dispatchEvent(new Event("blur"))
    input.dispatchEvent(new Event("focus"))

    await new Promise((resolve) => setTimeout(resolve, 200))
    await elementUpdated(element)

    expect(element.shadowRoot!.querySelector(".autocomplete-list")).not.toBeNull()
  })
})
