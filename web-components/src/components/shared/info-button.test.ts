import { fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import { beforeAll, describe, expect, it } from "vitest"
import type { InfoButton } from "./info-button"

beforeAll(async () => {
  await import("./info-button")
})

describe("info-button", () => {
  it("gives its icon-only button an accessible name", async () => {
    const element = await fixture<InfoButton>(html`<info-button></info-button>`)
    const button = element.shadowRoot!.querySelector("button")

    expect(button?.getAttribute("aria-label")).toBe("Information")
  })
})
