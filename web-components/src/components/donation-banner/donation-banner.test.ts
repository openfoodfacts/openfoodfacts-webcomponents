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

const meterOf = (element: any) => element.shadowRoot.querySelector("donation-meter")

const meterStates = (element: any) => {
  const states: string[] = []
  element.addEventListener("donation-meter-state", (event: any) => states.push(event.detail.state))
  return states
}

/** `loading` is announced before the feed answers, so waiting on the link alone proves nothing. */
const settle = async (element: any, states: string[]) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await element.updateComplete
    if (states.length > 0 && states.at(-1) !== "loading") {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

const campaignFeed = (campaign: Record<string, unknown>) => ({
  news: { donation_campaign: campaign },
  tagline_feed: { default: { news: [{ id: "donation_campaign" }] } },
})

const mountMeteredBanner = async () => {
  const element = document.createElement("donation-banner") as any
  const states = meterStates(element)
  element.setAttribute("news-url", FEED_URL)
  document.body.appendChild(element)
  await element.updateComplete
  return { element, states }
}

const createMeteredBanner = async (body: unknown) => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  } as Response)

  const { element, states } = await mountMeteredBanner()
  await settle(element, states)
  return element
}

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
  vi.mocked(global.fetch).mockReset()
  languageCode.set(DEFAULT_LANGUAGE_CODE)
  document.body.innerHTML = ""
})

describe("donation-banner", () => {
  it("shows no meter and no extra tracking without a news feed", async () => {
    const element = await createBanner()

    expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("shows the meter and marks the donate link once the feed carries figures", async () => {
    const element = await createMeteredBanner(
      campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" })
    )

    expect(meterOf(element).getAttribute("url")).toBe(FEED_URL)
    expect(meterOf(element).shadowRoot.querySelector(".bar")).not.toBeNull()
    expect(donateLink(element)).toContain("utm_content=meter")
  })

  it("leaves the link untagged when the feed carries no figures to show", async () => {
    const element = await createMeteredBanner(campaignFeed({ raised: 44156, currency: "EUR" }))

    expect(meterOf(element)).not.toBeNull()
    expect(meterOf(element).shadowRoot.querySelector(".bar")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("leaves the link untagged when the feed request fails", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("the feed is unreachable"))

    const { element, states } = await mountMeteredBanner()
    await settle(element, states)

    expect(meterOf(element)).not.toBeNull()
    expect(meterOf(element).shadowRoot.querySelector(".bar")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("drops the tag when the feed is taken away at runtime", async () => {
    const element = await createMeteredBanner(
      campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" })
    )
    expect(donateLink(element)).toContain("utm_content=meter")

    element.removeAttribute("news-url")
    await element.updateComplete

    expect(meterOf(element)).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("does not tag the link while the feed is still in flight", async () => {
    let answer: (response: Response) => void = () => {}
    vi.mocked(global.fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        answer = resolve
      })
    )

    const { element, states } = await mountMeteredBanner()
    for (let attempt = 0; attempt < 20 && states.length === 0; attempt++) {
      await element.updateComplete
      await new Promise((resolve) => setTimeout(resolve, 5))
    }

    expect(states).toEqual(["loading"])
    expect(donateLink(element)).not.toContain("utm_content")

    answer({
      ok: true,
      status: 200,
      json: async () => campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" }),
    } as Response)
    await settle(element, states)

    expect(donateLink(element)).toContain("utm_content=meter")
  })

  it("ignores a late answer from a meter that has already left the page", async () => {
    const element = await createMeteredBanner(
      campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" })
    )
    const ghost = meterOf(element)

    element.removeAttribute("news-url")
    await element.updateComplete
    const states = meterStates(element)
    element.setAttribute("news-url", "https://example.org/other.json")
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => campaignFeed({ raised: 44156, currency: "EUR" }),
    } as Response)
    await settle(element, states)

    expect(meterOf(element)).not.toBe(ghost)
    expect(ghost.isConnected).toBe(false)
    expect(donateLink(element)).not.toContain("utm_content")

    ghost.dispatchEvent(
      new CustomEvent("donation-meter-state", {
        detail: { state: "has-data" },
        bubbles: true,
        composed: true,
      })
    )
    await element.updateComplete

    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("still tags the link when the feed answers while the banner is off the page", async () => {
    let answer: (response: Response) => void = () => {}
    vi.mocked(global.fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        answer = resolve
      })
    )

    const { element } = await mountMeteredBanner()
    element.remove()
    answer({
      ok: true,
      status: 200,
      json: async () => campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" }),
    } as Response)
    await new Promise((resolve) => setTimeout(resolve, 5))

    const states = meterStates(element)
    document.body.appendChild(element)
    await settle(element, states)

    expect(meterOf(element).shadowRoot.querySelector(".bar")).not.toBeNull()
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

    expect(
      element.shadowRoot.querySelector(".donation-banner-footer__main-title").textContent.trim()
    ).toBe("Become an Open Food Facts patron")
    expect(
      element.shadowRoot.querySelector(".donation-banner-footer__hook-section p").textContent.trim()
    ).toBe("We still need €120,000 to finish 2026!")
    expect(
      element.shadowRoot
        .querySelector(".donation-banner-footer__actions-section__financial p")
        .textContent.trim()
    ).toBe(
      "If every visitor this month clicked on Donate and gave just 1€, we'd get over 8 times our yearly budget!"
    )
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

  it("refuses a donate link that is not an http(s) URL", async () => {
    const element = await createBanner({ "donate-url": "javascript:alert(document.cookie)//" })

    const href = donateLink(element)
    expect(href.startsWith("javascript:")).toBe(false)
    expect(href).toContain("https://world.openfoodfacts.org/donate-to-open-food-facts")
  })

  it("localizes the fallback donation link and utm_term for Japanese", async () => {
    languageCode.set("ja")
    const element = await createBanner()

    const href = donateLink(element)
    expect(href).toContain("https://world-ja.openfoodfacts.org/donate-to-open-food-facts")
    expect(href).toContain("utm_term=ja-text-button")
  })
})
