import { afterEach, describe, expect, it, vi } from "vitest"
import "./autocomplete-input"
import type { AutocompleteInput } from "./autocomplete-input"
import type { AutocompleteSuggestion } from "../../types"

const flushUpdates = async (element: AutocompleteInput) => {
  await element.updateComplete
  await Promise.resolve()
}

const createAutocomplete = async (suggestions: AutocompleteSuggestion[]) => {
  const element = document.createElement("autocomplete-input") as AutocompleteInput
  element.suggestions = suggestions
  document.body.appendChild(element)
  await flushUpdates(element)
  const input = element.shadowRoot?.querySelector("input")
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Expected autocomplete input")
  }
  return { element, input }
}

describe("autocomplete-input", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("keeps flat autocomplete selection behavior", async () => {
    const suggestions = [{ label: "Palm oil free", value: "palm-oil-free" }]
    const { element, input } = await createAutocomplete(suggestions)
    const onSelect = vi.fn()
    element.addEventListener("suggestion-select", onSelect)

    input.dispatchEvent(new FocusEvent("focus"))
    await flushUpdates(element)

    const firstSuggestion = element.shadowRoot?.querySelector("li")
    if (!(firstSuggestion instanceof HTMLElement)) {
      throw new Error("Expected first suggestion")
    }
    firstSuggestion.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await flushUpdates(element)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].detail).toEqual(suggestions[0])
    expect(element.value).toBe("palm-oil-free")
  })

  it("drills into child suggestions before selecting a leaf", async () => {
    const suggestions: AutocompleteSuggestion[] = [
      {
        label: "Apple",
        value: "apple",
        children: [
          { label: "Gala Apple", value: "gala-apple" },
          { label: "Macintosh Apple", value: "macintosh-apple" },
        ],
      },
    ]
    const { element, input } = await createAutocomplete(suggestions)
    const onSelect = vi.fn()
    element.addEventListener("suggestion-select", onSelect)

    input.dispatchEvent(new FocusEvent("focus"))
    await flushUpdates(element)

    const firstSuggestion = element.shadowRoot?.querySelector("li")
    if (!(firstSuggestion instanceof HTMLElement)) {
      throw new Error("Expected first suggestion")
    }
    firstSuggestion.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await flushUpdates(element)

    const hierarchyPath = element.shadowRoot?.querySelector(".autocomplete-hierarchy-path")
    const childSuggestions = element.shadowRoot?.querySelectorAll("li")

    expect(onSelect).not.toHaveBeenCalled()
    expect(element.value).toBe("")
    expect(hierarchyPath?.textContent).toContain("Apple")
    expect(childSuggestions).toHaveLength(2)
    expect(Array.from(childSuggestions ?? []).map((item) => item.textContent?.trim())).toEqual([
      "Gala Apple",
      "Macintosh Apple",
    ])
  })

  it("allows navigating back from a child level", async () => {
    const suggestions: AutocompleteSuggestion[] = [
      {
        label: "Apple",
        value: "apple",
        children: [{ label: "Gala Apple", value: "gala-apple" }],
      },
      { label: "Banana", value: "banana" },
    ]
    const { element, input } = await createAutocomplete(suggestions)

    input.dispatchEvent(new FocusEvent("focus"))
    await flushUpdates(element)

    const firstSuggestion = element.shadowRoot?.querySelector("li")
    if (!(firstSuggestion instanceof HTMLElement)) {
      throw new Error("Expected first suggestion")
    }
    firstSuggestion.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await flushUpdates(element)

    const backButton = element.shadowRoot?.querySelector(".autocomplete-hierarchy-back")
    if (!(backButton instanceof HTMLButtonElement)) {
      throw new Error("Expected hierarchy back button")
    }
    backButton.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await flushUpdates(element)

    expect(element.shadowRoot?.querySelector(".autocomplete-hierarchy")).toBeNull()
    expect(Array.from(element.shadowRoot?.querySelectorAll("li") ?? []).map((item) => item.textContent?.trim())).toEqual([
      "Apple",
      "Banana",
    ])
  })
})
