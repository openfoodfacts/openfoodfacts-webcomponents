import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import dayjs from "dayjs/esm"
import { languageCode } from "../../signals/app"

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })

  await import("./donation-meter")
})

const FEED_URL = "https://example.org/main.json"

const inDays = (days: number) => dayjs().add(days, "day").format("YYYY-MM-DD HH:mm:ss")

const feedWith = (campaign: Record<string, unknown>) => ({
  news: {
    donation_campaign: {
      translations: { default: { title: "Campaign", message: "Give" } },
      start_date: inDays(-30),
      end_date: inDays(150),
      ...campaign,
    },
  },
  tagline_feed: { default: { news: [{ id: "donation_campaign" }] } },
})

const meterWithFigures = async (raised: number, goal: number, currency = "EUR") => {
  const element = document.createElement("donation-meter") as any
  element.funding = { raised, goal, currency }
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

const meterFromFeed = async (body: unknown, ok = true) => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok,
    status: ok ? 200 : 404,
    json: async () => body,
  } as Response)

  const element = document.createElement("donation-meter") as any
  element.setAttribute("url", FEED_URL)
  document.body.appendChild(element)

  for (let attempt = 0; attempt < 20; attempt++) {
    await element.updateComplete
    if (element.shadowRoot.querySelector(".bar")) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  return element
}

const text = (element: any) =>
  Array.from(element.shadowRoot.childNodes)
    .filter((node: any) => node.nodeName !== "STYLE")
    .map((node: any) => node.textContent)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

const bar = (element: any) => element.shadowRoot.querySelector(".bar")

beforeEach(() => {
  document.body.innerHTML = ""
})

describe("donation-meter", () => {
  it("renders the figures, the percentage and the bar", async () => {
    const element = await meterWithFigures(44156, 170000)

    expect(text(element)).toContain("€44,156")
    expect(text(element)).toContain("of €170,000")
    expect(text(element)).toContain("26%")
    expect(text(element)).toContain("€125,844 short")
    expect(bar(element).querySelector("div").getAttribute("style")).toBe("width: 26.0%")
    expect(bar(element).getAttribute("aria-valuenow")).toBe("26")
    expect(bar(element).getAttribute("aria-valuetext")).toBe("26%")
    expect(bar(element).getAttribute("aria-label")).toBeTruthy()
    expect(bar(element).getAttribute("role")).toBe("progressbar")
    expect(bar(element).getAttribute("aria-valuemax")).toBe("100")
  })

  it("rounds the amounts to whole units", async () => {
    const element = await meterWithFigures(46869.1, 170000)

    expect(text(element)).toContain("€46,869")
    expect(text(element)).not.toContain("46,869.1")
  })

  it("shows the campaign's own currency", async () => {
    const element = await meterWithFigures(1000, 5000, "USD")
    expect(text(element)).toContain("$1,000")
  })

  it("formats the amounts for the reader's language", async () => {
    const previous = languageCode.get()
    languageCode.set("de")
    try {
      const element = await meterWithFigures(44156, 170000)
      expect(text(element)).toContain("170.000")
    } finally {
      languageCode.set(previous)
    }
  })

  it("says nothing about a shortfall smaller than one unit", async () => {
    const element = await meterWithFigures(169999.6, 170000)

    expect(text(element)).not.toContain("short")
    expect(bar(element)).not.toBeNull()
  })

  it("keeps the bar inside the goal but reports the real percentage", async () => {
    const element = await meterWithFigures(180000, 170000)

    expect(bar(element).querySelector("div").getAttribute("style")).toBe("width: 100.0%")
    expect(bar(element).getAttribute("aria-valuenow")).toBe("100")
    expect(bar(element).getAttribute("aria-valuetext")).toBe("106%")
    expect(text(element)).not.toContain("short")
  })

  it("renders nothing at all without figures", async () => {
    const element = document.createElement("donation-meter") as any
    document.body.appendChild(element)
    await element.updateComplete

    expect(bar(element)).toBeNull()
    expect(text(element)).toBe("")
  })

  it("renders nothing when a host sets figures the feed rules would refuse", async () => {
    const element = await meterWithFigures(44156, 170000, "12$")

    expect(bar(element)).toBeNull()
    expect(text(element)).toBe("")
  })

  it("ignores a feed when a host set figures the rules refuse", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => feedWith({ raised: 44156, goal: 170000, currency: "EUR" }),
    } as Response)

    const element = document.createElement("donation-meter") as any
    element.funding = { raised: 44156, goal: 170000, currency: "12$" }
    element.setAttribute("url", FEED_URL)
    document.body.appendChild(element)
    await element.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 10))
    await element.updateComplete

    expect(text(element)).toBe("")
  })

  it("reads the figures from the news feed", async () => {
    const element = await meterFromFeed(feedWith({ raised: 44156, goal: 170000, currency: "EUR" }))

    expect(global.fetch).toHaveBeenCalledWith(FEED_URL)
    expect(text(element)).toContain("€44,156")
  })

  it("renders nothing when the feed carries an incomplete campaign", async () => {
    const element = await meterFromFeed(feedWith({ raised: 44156, currency: "EUR" }))
    expect(text(element)).toBe("")
  })

  it("renders nothing when the feed cannot be read", async () => {
    // The body is a perfectly good feed: only the failed status may keep it off the page.
    const element = await meterFromFeed(
      feedWith({ raised: 44156, goal: 170000, currency: "EUR" }),
      false
    )
    expect(text(element)).toBe("")
  })

  it("renders nothing when the feed is not the feed", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("not json")
      },
    } as unknown as Response)

    const element = document.createElement("donation-meter") as any
    element.setAttribute("url", FEED_URL)
    document.body.appendChild(element)
    await element.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 10))
    await element.updateComplete

    expect(text(element)).toBe("")
  })
})
