import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import type { NewKeyModal } from "./new-key-modal"

beforeAll(async () => {
  await import("./new-key-modal")
})

const createModal = async () => {
  const element = document.createElement("new-key-modal") as NewKeyModal
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

beforeEach(() => {
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

describe("new-key-modal", () => {
  it("isolates links that open community resources in a new tab", async () => {
    const element = await createModal()
    const links = element.shadowRoot?.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')

    expect(links).toHaveLength(3)
    links?.forEach((link) => {
      expect(link.rel).toBe("noopener noreferrer")
    })
  })

  it("opens the documentation editor without exposing the opener", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null)
    const element = await createModal()
    const input = element.shadowRoot?.querySelector<HTMLInputElement>(".property-input")
    const button = element.shadowRoot?.querySelector<HTMLButtonElement>(".create-wiki-button")

    if (!input || !button) throw new Error("Expected property documentation controls")

    input.value = "origin"
    input.dispatchEvent(new Event("input"))
    await element.updateComplete
    button.click()

    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("Folksonomy/Property/origin"),
      "_blank",
      "noopener,noreferrer"
    )
  })
})
