import { afterEach, describe, expect, it, vi } from "vitest"
import { NewKeyModal } from "./new-key-modal"

describe("NewKeyModal", () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.restoreAllMocks()
  })

  it("isolates every instructional link opened in a new tab", async () => {
    const modal = document.createElement("new-key-modal") as NewKeyModal
    document.body.append(modal)
    await modal.updateComplete

    const links = Array.from(modal.shadowRoot!.querySelectorAll('a[target="_blank"]'))
    expect(links).toHaveLength(3)
    expect(links.every((link) => link.rel === "noopener noreferrer")).toBe(true)
  })

  it("opens the wiki editor without an opener reference", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null)
    const modal = document.createElement("new-key-modal") as NewKeyModal
    document.body.append(modal)
    await modal.updateComplete

    const input = modal.shadowRoot!.querySelector<HTMLInputElement>(".property-input")!
    input.value = "producer:website"
    input.dispatchEvent(new Event("input"))
    await modal.updateComplete
    modal.shadowRoot!.querySelector<HTMLButtonElement>(".create-wiki-button")!.click()

    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("Folksonomy/Property/producer%3Awebsite"),
      "_blank",
      "noopener,noreferrer"
    )
  })
})
