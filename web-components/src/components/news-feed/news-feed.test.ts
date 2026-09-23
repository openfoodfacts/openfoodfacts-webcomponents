import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import dayjs from "dayjs/esm"

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })

  await import("./news-feed")
})

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

const renderFeed = async (body: unknown) => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  } as Response)

  const element = document.createElement("news-feed") as any
  element.setAttribute("url", "https://example.org/main.json")
  element.setAttribute("lang", "en")
  document.body.appendChild(element)

  for (let attempt = 0; attempt < 20; attempt++) {
    await element.updateComplete
    if (element.shadowRoot.querySelector(".news-item")) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  return element
}

beforeEach(() => {
  document.body.innerHTML = ""
})

describe("news-feed", () => {
  it("shows a meter on a campaign that publishes figures", async () => {
    const element = await renderFeed(feedWith({ raised: 44156, goal: 170000, currency: "EUR" }))

    const meter = element.shadowRoot.querySelector("donation-meter")
    expect(meter).not.toBeNull()
    expect(meter.funding).toEqual({ raised: 44156, goal: 170000, currency: "EUR" })
  })

  it("shows the news item without a meter when there are no figures", async () => {
    const element = await renderFeed(feedWith({}))

    expect(element.shadowRoot.querySelector(".news-item")).not.toBeNull()
    expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
  })

  it("shows no meter when the campaign publishes only part of the figures", async () => {
    const element = await renderFeed(feedWith({ raised: 44156, currency: "EUR" }))

    expect(element.shadowRoot.querySelector(".news-item")).not.toBeNull()
    expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
  })
})
