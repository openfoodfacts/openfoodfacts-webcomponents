import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })

  await import("./donation-banner")
})

const FEED_URL = "https://example.org/main.json"

const createBanner = async (newsUrl?: string) => {
  const element = document.createElement("donation-banner") as any
  if (newsUrl) {
    element.setAttribute("news-url", newsUrl)
  }
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

const donateLink = (element: any) => element.shadowRoot.querySelector("a").getAttribute("href")

const listItems = (element: any) =>
  Array.from(element.shadowRoot.querySelectorAll("li")).map((item: any) => item.textContent.trim())

const ASK = [
  "keeping our database open & available to all,",
  "technical infrastructure (website/mobile app) & a small permanent team",
  "remain independent of the food industry,",
  "engage a community of committed citizens,",
  "support the advancement of public health research.",
]

beforeEach(() => {
  document.body.innerHTML = ""
})

describe("donation-banner", () => {
  it("shows no meter and no extra tracking without a news feed", async () => {
    const element = await createBanner()

    expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("shows the meter and marks the donate link when a news feed is given", async () => {
    const element = await createBanner(FEED_URL)

    const meter = element.shadowRoot.querySelector("donation-meter")
    expect(meter.getAttribute("url")).toBe(FEED_URL)
    expect(donateLink(element)).toContain("utm_content=meter")
  })

  it("keeps the donation ask itself unchanged either way", async () => {
    const plain = await createBanner()
    const metered = await createBanner(FEED_URL)

    expect(listItems(plain)).toEqual(ASK)
    expect(listItems(metered)).toEqual(ASK)
    expect(plain.shadowRoot.querySelector("button").textContent.trim()).toBe("I SUPPORT")
    expect(metered.shadowRoot.querySelector("button").textContent.trim()).toBe("I SUPPORT")
  })
})
