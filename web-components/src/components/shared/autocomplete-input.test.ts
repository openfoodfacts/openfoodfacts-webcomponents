import { beforeAll, describe, expect, it } from "vitest"

beforeAll(async () => {
  await import("./autocomplete-input")
})

const openSuggestions = async (suggestions: unknown[]) => {
  const element = document.createElement("autocomplete-input") as any
  element.suggestions = suggestions
  document.body.appendChild(element)
  await element.updateComplete

  element.shadowRoot.querySelector("input").dispatchEvent(new Event("focus"))
  await element.updateComplete

  return Array.from(element.shadowRoot.querySelectorAll(".autocomplete-item")).map((item: any) =>
    item.textContent.trim()
  )
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
})
