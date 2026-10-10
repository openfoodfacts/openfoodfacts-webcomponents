import { afterEach, beforeAll, describe, expect, it } from "vitest"
import { elementUpdated, fixture, fixtureCleanup } from "@open-wc/testing/pure"
import { html } from "lit"

beforeAll(async () => {
  await import("./autocomplete-input")
})

const openSuggestions = async (suggestions: unknown[]) => {
  const element = await fixture<any>(html`<autocomplete-input></autocomplete-input>`)
  element.suggestions = suggestions
  await elementUpdated(element)

  element.shadowRoot.querySelector("input").dispatchEvent(new Event("focus"))
  await elementUpdated(element)

  return Array.from(element.shadowRoot.querySelectorAll(".autocomplete-item")).map((item: any) =>
    item.textContent.trim()
  )
}

afterEach(() => {
  fixtureCleanup()
})

describe("autocomplete-input", () => {
  it("shows the count in parentheses when a suggestion has one", async () => {
    const items = await openSuggestions([
      { value: "is_original", count: 12 },
      { value: "is-original", count: 0 },
      { value: "origine" },
    ])

    expect(items).toEqual(["is_original (12)", "is-original (0)", "origine"])
  })
})
