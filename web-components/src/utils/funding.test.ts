import { describe, expect, it } from "vitest"
import dayjs from "dayjs/esm"
import {
  findFunding,
  findNewsItem,
  formatAmount,
  formatDay,
  parseCount,
  parseFunding,
} from "./funding"
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

describe("findNewsItem", () => {
  const data = feed({ raised: 44156, goal: 170000, currency: "EUR" })

  it("returns the item a page named by id", () => {
    expect(findNewsItem(data, "donation_campaign")?.raised).toBe(44156)
  })

  it("returns null for an id the feed does not carry", () => {
    expect(findNewsItem(data, "missing")).toBeNull()
  })

  it("returns null for an item with no translations", () => {
    ;(data.news as any).bare = { raised: 1, goal: 2, currency: "EUR" }
    expect(findNewsItem(data, "bare")).toBeNull()
  })

  it("returns a disabled or ended item anyway - the page named it on purpose", () => {
    const ended = feed({
      raised: 44156,
      goal: 170000,
      currency: "EUR",
      enabled: false,
      start_date: inDays(-200),
      end_date: inDays(-100),
    })
    expect(findNewsItem(ended, "donation_campaign")).not.toBeNull()
  })

  it("survives a missing feed", () => {
    expect(findNewsItem(undefined, "x")).toBeNull()
    expect(findNewsItem(null, "x")).toBeNull()
    expect(findNewsItem({} as NewsData, "x")).toBeNull()
  })
})

describe("parseCount", () => {
  it("accepts a finite count of at least one", () => {
    expect(parseCount(760)).toBe(760)
    expect(parseCount(1)).toBe(1)
  })

  it("refuses zero, negative, non-finite or non-number values", () => {
    expect(parseCount(0)).toBeNull()
    expect(parseCount(-1)).toBeNull()
    expect(parseCount(NaN)).toBeNull()
    expect(parseCount(Infinity)).toBeNull()
    expect(parseCount("5")).toBeNull()
    expect(parseCount(undefined)).toBeNull()
  })
})

describe("formatAmount", () => {
  it("formats a whole amount with no decimals by default", () => {
    expect(formatAmount(170000, "EUR", "en")).toBe("€170,000")
  })

  it("formats with the requested number of decimals", () => {
    expect(formatAmount(1.7, "EUR", "en", 2)).toBe("€1.70")
    expect(formatAmount(3.4, "EUR", "en", 2)).toBe("€3.40")
  })
})

describe("formatDay", () => {
  it("formats a valid date in the given locale and month length", () => {
    expect(formatDay("2027-01-31 23:59:59", "en", "long")).toBe("January 31")
    expect(formatDay("2027-01-31 23:59:59", "fr", "long")).toBe("31 janvier")
  })

  it("returns null for a missing or unparsable date", () => {
    expect(formatDay(undefined, "en")).toBeNull()
    expect(formatDay("x", "en")).toBeNull()
    expect(formatDay("", "en")).toBeNull()
  })

  it("keeps the calendar day of a date-only string west of Greenwich", () => {
    const tz = process.env.TZ
    process.env.TZ = "America/Los_Angeles"
    try {
      expect(formatDay("2027-01-31", "en", "long")).toBe("January 31")
      expect(formatDay("2027-01-31 23:59:59", "en", "short")).toBe("Jan 31")
    } finally {
      if (tz === undefined) delete process.env.TZ
      else process.env.TZ = tz
    }
  })
})
