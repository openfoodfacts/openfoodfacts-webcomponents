import { afterEach, describe, expect, it, vi } from "vitest"
import "./autocomplete-input"
import type { AutocompleteInput } from "./autocomplete-input"
import type { AutocompleteSuggestion } from "../../types"

const flushUpdates = async (element: AutocompleteInput) => {
  await element.updateComplete
  await Promise.resolve()
}

const getSuggestionLabels = (element: AutocompleteInput) =>
  Array.from(element.shadowRoot?.querySelectorAll(".autocomplete-item-label") ?? []).map((item) =>
    item.textContent?.trim()
  )

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

    expect(onSelect).not.toHaveBeenCalled()
    expect(element.value).toBe("")
    expect(getSuggestionLabels(element)).toEqual(["Apple", "Gala Apple", "Macintosh Apple"])
  })

  it("keeps the hierarchy open after clicking into a child level", async () => {
    vi.useFakeTimers()

    try {
      const suggestions: AutocompleteSuggestion[] = [
        {
          label: "Apple",
          value: "apple",
          children: [{ label: "Gala Apple", value: "gala-apple" }],
        },
      ]
      const { element, input } = await createAutocomplete(suggestions)

      input.dispatchEvent(new FocusEvent("focus"))
      await flushUpdates(element)

      const firstSuggestion = element.shadowRoot?.querySelector("li")
      if (!(firstSuggestion instanceof HTMLElement)) {
        throw new Error("Expected first suggestion")
      }
      firstSuggestion.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
      input.dispatchEvent(new FocusEvent("blur"))
      await flushUpdates(element)
      await vi.advanceTimersByTimeAsync(200)
      await flushUpdates(element)

      expect(getSuggestionLabels(element)).toEqual(["Apple", "Gala Apple"])
    } finally {
      vi.useRealTimers()
    }
  })

  it("searches the whole tree after expanding a branch", async () => {
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

    input.value = "ban"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    await flushUpdates(element)

    expect(getSuggestionLabels(element)).toEqual(["Banana"])
  })
})
