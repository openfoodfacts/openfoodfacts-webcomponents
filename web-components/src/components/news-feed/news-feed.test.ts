import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { waitUntil } from "@open-wc/testing-helpers"
import dayjs from "dayjs/esm"
import type { NewsFeed } from "./news-feed"

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
  vi.stubGlobal("fetch", vi.fn<typeof fetch>())
  vi.mocked(global.fetch).mockResolvedValue(
    new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } })
  )

  const element = document.createElement("news-feed") as NewsFeed
  element.setAttribute("url", "https://example.org/main.json")
  element.setAttribute("lang", "en")
  document.body.appendChild(element)

  await waitUntil(() => element.shadowRoot?.querySelector(".news-item"), "news item to render")
  return element
}

const shadowRoot = (element: NewsFeed): ShadowRoot => {
  if (!element.shadowRoot) throw new Error("Expected news-feed to have a shadow root")
  return element.shadowRoot
}

beforeEach(() => {
  document.body.innerHTML = ""
})

describe("news-feed", () => {
  it("shows a meter on a campaign that publishes figures", async () => {
    const element = await renderFeed(feedWith({ raised: 44156, goal: 170000, currency: "EUR" }))

    const meter = shadowRoot(element).querySelector("donation-meter")
    expect(meter).not.toBeNull()
    expect(meter?.funding).toEqual({ raised: 44156, goal: 170000, currency: "EUR" })
  })

  it("shows the news item without a meter when there are no figures", async () => {
    const element = await renderFeed(feedWith({}))

    expect(shadowRoot(element).querySelector(".news-item")).not.toBeNull()
    expect(shadowRoot(element).querySelector("donation-meter")).toBeNull()
  })

  it("shows no meter when the campaign publishes only part of the figures", async () => {
    const element = await renderFeed(feedWith({ raised: 44156, currency: "EUR" }))

    expect(shadowRoot(element).querySelector(".news-item")).not.toBeNull()
    expect(shadowRoot(element).querySelector("donation-meter")).toBeNull()
  })
})
