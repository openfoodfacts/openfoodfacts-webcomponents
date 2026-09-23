import { describe, expect, it } from "vitest"
import dayjs from "dayjs/esm"
import { findFunding, parseFunding } from "./funding"
import type { NewsData } from "../types/news-feed"

const inDays = (days: number) => dayjs().add(days, "day").format("YYYY-MM-DD HH:mm:ss")

const feed = (campaign: Record<string, unknown>, ids: string[] = ["donation_campaign"]): NewsData =>
  ({
    news: {
      donation_campaign: {
        translations: { default: { title: "Campaign", message: "Give" } },
        start_date: inDays(-30),
        end_date: inDays(150),
        ...campaign,
      },
      plain_news: {
        translations: { default: { title: "News", message: "Read" } },
      },
    },
    tagline_feed: { default: { news: ids.map((id) => ({ id })) } },
  }) as unknown as NewsData

describe("parseFunding", () => {
  it("accepts a complete set of figures", () => {
    expect(parseFunding(44156, 170000, "EUR")).toEqual({
      raised: 44156,
      goal: 170000,
      currency: "EUR",
    })
  })

  it("refuses a campaign that publishes only some of them", () => {
    expect(parseFunding(44156, 170000, undefined)).toBeNull()
    expect(parseFunding(44156, undefined, "EUR")).toBeNull()
    expect(parseFunding(undefined, 170000, "EUR")).toBeNull()
  })

  it("refuses figures that cannot produce a ratio", () => {
    expect(parseFunding(44156, 0, "EUR")).toBeNull()
    expect(parseFunding(-1, 170000, "EUR")).toBeNull()
    expect(parseFunding(Infinity, 170000, "EUR")).toBeNull()
  })

  it("refuses a goal below one unit, which is a misplaced decimal point", () => {
    expect(parseFunding(0, 0.17, "EUR")).toBeNull()
    expect(parseFunding(1e300, 1e-300, "EUR")).toBeNull()
  })

  it("refuses anything Intl would reject as a currency", () => {
    expect(parseFunding(44156, 170000, "€")).toBeNull()
    expect(parseFunding(44156, 170000, "EUROS")).toBeNull()
    expect(parseFunding(44156, 170000, "12$")).toBeNull()
    expect(parseFunding(44156, 170000, "E U")).toBeNull()
  })

  it("accepts a three letter code Intl can format", () => {
    for (const currency of ["EUR", "usd", "XOF"]) {
      const funding = parseFunding(1, 2, currency)!
      expect(funding).not.toBeNull()
      expect(() =>
        new Intl.NumberFormat("en", { style: "currency", currency: funding.currency }).format(1)
      ).not.toThrow()
    }
  })

  it("refuses figures published as text", () => {
    expect(parseFunding("44156", "170000", "EUR")).toBeNull()
    expect(parseFunding("44156", 170000, "EUR")).toBeNull()
    expect(parseFunding(44156, "170000", "EUR")).toBeNull()
  })

  it("accepts zero raised, which is a campaign that just opened", () => {
    expect(parseFunding(0, 170000, "EUR")).not.toBeNull()
  })
})

describe("findFunding", () => {
  it("finds the running campaign that publishes figures", () => {
    expect(findFunding(feed({ raised: 44156, goal: 170000, currency: "EUR" }))).toEqual({
      raised: 44156,
      goal: 170000,
      currency: "EUR",
    })
  })

  it("skips an item that carries no figures", () => {
    expect(findFunding(feed({}))).toBeNull()
  })

  it("skips a campaign that has ended", () => {
    const ended = feed({
      raised: 44156,
      goal: 170000,
      currency: "EUR",
      start_date: inDays(-90),
      end_date: inDays(-1),
    })
    expect(findFunding(ended)).toBeNull()
  })

  it("skips a campaign that has not started", () => {
    const future = feed({
      raised: 0,
      goal: 170000,
      currency: "EUR",
      start_date: inDays(10),
      end_date: inDays(200),
    })
    expect(findFunding(future)).toBeNull()
  })

  it("skips a campaign the feed disabled", () => {
    expect(findFunding(feed({ raised: 1, goal: 2, currency: "EUR", enabled: false }))).toBeNull()
  })

  it("keeps looking past the items that carry no figures", () => {
    const data = feed({ raised: 44156, goal: 170000, currency: "EUR" }, [
      "plain_news",
      "donation_campaign",
    ])
    expect(findFunding(data)?.raised).toBe(44156)
  })

  it("ignores an item the tagline feed does not list", () => {
    const data = feed({ raised: 44156, goal: 170000, currency: "EUR" }, ["plain_news"])
    expect(findFunding(data)).toBeNull()
  })

  it("skips an ended campaign and takes the running one behind it", () => {
    const data = feed({ raised: 44156, goal: 170000, currency: "EUR" }, [
      "old_campaign",
      "donation_campaign",
    ])
    ;(data.news as any).old_campaign = {
      translations: { default: { title: "Old", message: "Gave" } },
      raised: 1,
      goal: 2,
      currency: "EUR",
      start_date: inDays(-200),
      end_date: inDays(-100),
    }
    expect(findFunding(data)?.raised).toBe(44156)
  })

  it("survives a feed that is not the feed", () => {
    expect(findFunding({} as NewsData)).toBeNull()
    expect(findFunding({ news: {}, tagline_feed: { default: { news: [null] } } } as any)).toBeNull()
    expect(findFunding({ tagline_feed: { default: { news: {} } } } as any)).toBeNull()
    expect(findFunding({ tagline_feed: { default: { news: [{ id: "gone" }] } } } as any)).toBeNull()
  })
})
