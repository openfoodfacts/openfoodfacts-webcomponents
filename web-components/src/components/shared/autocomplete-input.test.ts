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

  it("includes the shared dark theme for suggestion surfaces", async () => {
    const { AutocompleteInput } = await import("./autocomplete-input")
    const styles = AutocompleteInput.styles.map((style) => style.cssText).join("\n")

    expect(styles).toContain("--off-folksonomy-input-bg: #2a2a3a")
    expect(styles).toContain("background: var(--off-folksonomy-input-bg, #fff)")
    expect(styles).toContain("color: var(--off-folksonomy-text, #333)")
  })
})
