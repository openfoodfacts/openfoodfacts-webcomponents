import { html, render } from "lit"
import { afterEach, describe, expect, it } from "vitest"
import { ChangeType, type IndexedGroupedChange } from "../../types/ingredient-spellcheck"
import { TextCorrector } from "./text-corrector"

const container = document.createElement("div")
const suggestion: IndexedGroupedChange = {
  type: ChangeType.CHANGED,
  oldValue: "old",
  newValue: "new",
  indexes: [0],
  position: 0,
}

afterEach(() => {
  render(html``, container)
})

const button = () => container.querySelector("button") as HTMLButtonElement

describe("text-corrector", () => {
  it("keeps correction and editing controls from submitting the surrounding form", () => {
    const element = new TextCorrector()

    render(html`<form>${element.renderAcceptSuggestionButton(suggestion, 0)}</form>`, container)
    expect(button().type).toBe("button")

    render(html`<form>${element.renderRejectSuggestionButton(suggestion)}</form>`, container)
    expect(button().type).toBe("button")

    element.isEditMode = true
    render(html`<form>${element.renderButtons()}</form>`, container)
    expect(button().type).toBe("button")

    render(html`<form>${element.renderSpellCheck()}</form>`, container)
    expect(button().type).toBe("button")
  })
})
