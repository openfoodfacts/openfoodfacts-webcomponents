import { elementUpdated, fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import { beforeAll, describe, expect, it, vi } from "vitest"
import type { FolksonomyEditor } from "./folksonomy-editor"

vi.mock("../../api/folksonomy", () => ({
  default: {
    fetchProductProperties: vi.fn().mockResolvedValue([]),
  },
}))

beforeAll(async () => {
  await import("./folksonomy-editor")
})

describe("folksonomy-editor", () => {
  it("provides keyboard-operable sort buttons and communicates the active sort", async () => {
    const element = await fixture<FolksonomyEditor>(html`<folksonomy-editor></folksonomy-editor>`)
    await elementUpdated(element)

    const headers = element.shadowRoot!.querySelectorAll<HTMLTableCellElement>("th[aria-sort]")
    const buttons = element.shadowRoot!.querySelectorAll<HTMLButtonElement>(".sort-button")

    expect(headers).toHaveLength(2)
    expect(buttons).toHaveLength(2)
    expect(headers[0].getAttribute("aria-sort")).toBe("ascending")
    expect(headers[1].getAttribute("aria-sort")).toBe("none")

    buttons[1].click()
    await elementUpdated(element)

    expect(headers[0].getAttribute("aria-sort")).toBe("none")
    expect(headers[1].getAttribute("aria-sort")).toBe("ascending")
  })
})
