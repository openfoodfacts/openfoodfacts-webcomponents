import { html, render } from "lit"
import { afterEach, describe, expect, it } from "vitest"
import { ChangeType, type IndexedGroupedChange } from "../../types/ingredient-spellcheck"
import { TextCorrector } from "./text-corrector"

describe("TextCorrector controls", () => {
  let container: HTMLDivElement | undefined

  afterEach(() => {
    container?.remove()
    container = undefined
  })

  const renderControl = (control: unknown) => {
    container = document.createElement("div")
    document.body.append(container)
    render(html`${control}`, container)
    return container.querySelector("button")
  }

  const change: IndexedGroupedChange = {
    type: ChangeType.CHANGED,
    oldValue: "sugar",
    newValue: "suger",
    indexes: [0],
    position: 0,
  }

  it("does not submit the form when accepting or rejecting a suggestion", () => {
    const corrector = new TextCorrector()

    expect(renderControl(corrector.renderAcceptSuggestionButton(change, 0))?.type).toBe("button")
    expect(renderControl(corrector.renderRejectSuggestionButton(change))?.type).toBe("button")
  })

  it("does not submit the form when cancelling or entering edit mode", async () => {
    const corrector = document.createElement("text-corrector") as TextCorrector
    document.body.append(corrector)
    await corrector.updateComplete

    expect(corrector.shadowRoot?.querySelector("button")?.type).toBe("button")

    corrector.isEditMode = true
    await corrector.updateComplete

    expect(corrector.shadowRoot?.querySelector("button")?.type).toBe("button")
    corrector.remove()
  })
})
