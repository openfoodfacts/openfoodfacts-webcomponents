import { beforeAll, describe, expect, it, vi } from "vitest"
import { fixture, html } from "@open-wc/testing/pure"
import { elementUpdated } from "@open-wc/testing-helpers"
import { EventType } from "../../constants"

beforeAll(async () => {
  await import("./modal")
})

describe("modal-component", () => {
  it("exposes dialog semantics and focuses its close control when opened", async () => {
    const element = await fixture<HTMLElement>(
      html`<modal-component is-open><p>Content</p></modal-component>`
    )
    await elementUpdated(element)

    const dialog = element.shadowRoot?.querySelector(".modal")
    const closeButton = element.shadowRoot?.querySelector(".close-icon")
    expect(dialog?.getAttribute("role")).toBe("dialog")
    expect(dialog?.getAttribute("aria-modal")).toBe("true")
    expect(dialog?.getAttribute("aria-label")).toBe("Contribution dialog")
    expect(closeButton?.getAttribute("type")).toBe("button")
    expect(element.shadowRoot?.activeElement).toBe(closeButton)
  })

  it("closes when Escape is pressed inside the dialog", async () => {
    const element = await fixture<HTMLElement>(html`<modal-component is-open></modal-component>`)
    const close = vi.fn()
    element.addEventListener(EventType.CLOSE, close)

    element.shadowRoot
      ?.querySelector(".modal")
      ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))

    expect(close).toHaveBeenCalledOnce()
  })

  it("returns focus to the opener when closed", async () => {
    const opener = document.createElement("button")
    document.body.appendChild(opener)
    opener.focus()
    const element = await fixture<HTMLElement>(html`<modal-component></modal-component>`)

    ;(element as HTMLElement & { isOpen: boolean }).isOpen = true
    await elementUpdated(element)
    ;(element as HTMLElement & { isOpen: boolean }).isOpen = false
    await elementUpdated(element)

    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})
