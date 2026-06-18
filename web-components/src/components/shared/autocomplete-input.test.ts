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

  it("selects a node even if it has children", async () => {
    const suggestions: AutocompleteSuggestion[] = [
      {
        label: "Apple",
        value: "apple",
        children: [{ label: "Gala Apple", value: "gala-apple" }],
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
    // Click the label to select
    const label = firstSuggestion.querySelector(".autocomplete-item-label")
    label?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await flushUpdates(element)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].detail.value).toBe("apple")
    expect(element.value).toBe("apple")
  })

  it("expands a node when clicking the expander", async () => {
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

    const expander = element.shadowRoot?.querySelector(".autocomplete-item-expander")
    if (!(expander instanceof HTMLElement)) {
      throw new Error("Expected expander")
    }
    expander.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    await flushUpdates(element)

    expect(getSuggestionLabels(element)).toEqual(["Apple", "Gala Apple"])
  })

  it("searches the whole tree with debouncing", async () => {
    vi.useFakeTimers()
    try {
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

      input.value = "ban"
      input.dispatchEvent(new Event("input", { bubbles: true }))

      await vi.advanceTimersByTimeAsync(300)
      await flushUpdates(element)

      expect(getSuggestionLabels(element)).toEqual(["Banana"])
    } finally {
      vi.useRealTimers()
    }
  })
})
