import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import type { Footer } from "./footer"

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })

  await import("./footer")
})

beforeEach(() => {
  document.body.innerHTML = ""
})

const createFooter = async () => {
  const element = document.createElement("off-footer") as Footer
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

describe("off-footer", () => {
  it("renders a semantic footer element", async () => {
    const element = await createFooter()

    expect(element.shadowRoot?.querySelector("footer")).not.toBeNull()
  })

  it("renders all three footer sections", async () => {
    const element = await createFooter()
    const root = element.shadowRoot

    expect(root?.querySelector("#install_the_app_block")).not.toBeNull()

    expect(root?.querySelector("#contribute_and_discover_links_block")).not.toBeNull()

    expect(root?.querySelector("#footer_block")).not.toBeNull()
  })

  it("reuses the existing mobile-badges component", async () => {
    const element = await createFooter()

    expect(element.shadowRoot?.querySelector("mobile-badges")).not.toBeNull()
  })

  it("renders all project links", async () => {
    const element = await createFooter()

    const links = element.shadowRoot?.querySelectorAll(".project-links a")

    expect(links?.length).toBe(14)
  })

  it("renders all legal links", async () => {
    const element = await createFooter()

    const links = element.shadowRoot?.querySelectorAll(".legal-links a")

    expect(links?.length).toBe(6)
  })

  it("uses absolute URLs for navigation links", async () => {
    const element = await createFooter()

    const links = element.shadowRoot?.querySelectorAll("a") ?? []

    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^https:\/\//)
    }
  })

  it("renders images with alternative text", async () => {
    const element = await createFooter()

    const images = element.shadowRoot?.querySelectorAll("img") ?? []

    expect(images.length).toBeGreaterThan(0)

    for (const image of images) {
      expect(image.alt.trim()).not.toBe("")
    }
  })
})
