import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { languageCode } from "../../signals/app"
import { DEFAULT_LANGUAGE_CODE } from "../../constants"

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

const createBanner = async (attributes: Record<string, string> = {}) => {
  const element = document.createElement("donation-banner") as any
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
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
  languageCode.set(DEFAULT_LANGUAGE_CODE)
  document.body.innerHTML = ""
})

describe("donation-banner", () => {
  it("shows no meter and no extra tracking without a news feed", async () => {
    const element = await createBanner()

    expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("shows the meter and marks the donate link when a news feed is given", async () => {
    const element = await createBanner({ "news-url": FEED_URL })

    const meter = element.shadowRoot.querySelector("donation-meter")
    expect(meter.getAttribute("url")).toBe(FEED_URL)
    expect(donateLink(element)).toContain("utm_content=meter")
  })

  it("keeps the donation ask itself unchanged either way", async () => {
    const plain = await createBanner()
    const metered = await createBanner({ "news-url": FEED_URL })

    expect(listItems(plain)).toEqual(ASK)
    expect(listItems(metered)).toEqual(ASK)
    expect(plain.shadowRoot.querySelector("button").textContent.trim()).toBe("I SUPPORT")
    expect(metered.shadowRoot.querySelector("button").textContent.trim()).toBe("I SUPPORT")
  })

  it("displays the updated title, hook, financial callout and community image", async () => {
    const element = await createBanner()

    expect(element.shadowRoot.querySelector(".donation-banner-footer__main-title").textContent.trim()).toBe(
      "Become an Open Food Facts patron"
    )
    expect(element.shadowRoot.querySelector(".donation-banner-footer__hook-section p").textContent.trim()).toBe(
      "We still need €120,000 to finish 2026!"
    )
    expect(
      element.shadowRoot.querySelector(".donation-banner-footer__actions-section__financial p").textContent.trim()
    ).toBe("If every visitor this month clicked on Donate and gave just 1€, we'd get over 8 times our yearly budget!")
    expect(element.shadowRoot.querySelector("img.group-image")).not.toBeNull()
  })

  it("supports custom donate-url attribute", async () => {
    const element = await createBanner({ "donate-url": "https://example.org/custom-donate" })

    const href = donateLink(element)
    expect(href).toContain("https://example.org/custom-donate")
    expect(href).toContain("utm_source=off")
  })

  it("supports custom donate-link attribute", async () => {
    const element = await createBanner({ "donate-link": "https://example.org/from-server-link" })

    const href = donateLink(element)
    expect(href).toContain("https://example.org/from-server-link")
    expect(href).toContain("utm_source=off")
  })

  it("localizes the fallback donation link and utm_term for Japanese", async () => {
    languageCode.set("ja")
    const element = await createBanner()

    const href = donateLink(element)
    expect(href).toContain("https://world-ja.openfoodfacts.org/donate-to-open-food-facts")
    expect(href).toContain("utm_term=ja-text-button")
  })
})
