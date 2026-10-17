import { beforeAll, describe, expect, it } from "vitest"
import { fixture, html } from "@open-wc/testing/pure"
import type { InfoButton } from "./info-button"

beforeAll(async () => {
  await import("./info-button")
})

describe("info-button", () => {
  it("provides a default accessible name and does not submit an enclosing form", async () => {
    const element = await fixture<InfoButton>(html`<info-button></info-button>`)
    const button = element.shadowRoot?.querySelector("button")

    expect(button?.getAttribute("type")).toBe("button")
    expect(button?.getAttribute("aria-label")).toBe("More information")
  })

  it("uses a supplied label for context-specific information actions", async () => {
    const element = await fixture<InfoButton>(
      html`<info-button label="Show spelling help"></info-button>`
    )

    expect(element.shadowRoot?.querySelector("button")?.getAttribute("aria-label")).toBe(
      "Show spelling help"
    )
  })
})
