import dayjs from "dayjs/esm"
import type { Funding, NewsData, NewsItem } from "../types/news-feed"

/**
 * A campaign that publishes only some of the three fields renders no meter at
 * all, so a half-written feed never becomes a wrong number on the page.
 */
export const parseFunding = (raised: unknown, goal: unknown, currency: unknown): Funding | null => {
  if (typeof raised !== "number" || typeof goal !== "number" || typeof currency !== "string") {
    return null
  }
  if (!isFinite(raised) || !isFinite(goal) || raised < 0 || goal < 1) {
    return null
  }
  // Intl throws unless the code is three ASCII letters.
  if (!/^[A-Za-z]{3}$/.test(currency)) {
    return null
  }
  return { raised, goal, currency }
}

const isLive = (start?: string, end?: string) => {
  const now = dayjs()
  const startDate = start && dayjs(start).isValid() ? dayjs(start) : null
  const endDate = end && dayjs(end).isValid() ? dayjs(end) : null
  return !((startDate && now.isBefore(startDate)) || (endDate && now.isAfter(endDate)))
}

/** The first campaign the tagline feed lists that is running and publishes figures. */
export const findFunding = (data: NewsData): Funding | null => {
  const items = data?.tagline_feed?.default?.news
  if (!Array.isArray(items)) {
    return null
  }

  for (const item of items) {
    const details = item?.id ? data.news?.[item.id] : undefined
    if (!details || details.enabled === false || !isLive(details.start_date, details.end_date)) {
      continue
    }
    const funding = parseFunding(details.raised, details.goal, details.currency)
    if (funding) {
      return funding
    }
  }
  return null
}

/**
 * The item a page names explicitly by `news-id`. The page chose it, so
 * `enabled`/`start_date`/`end_date` are its business, not a filter here
 * (C2 PO decision 7) - only a `translations` object makes it usable at all.
 */
export const findNewsItem = (data: NewsData | null | undefined, id: string): NewsItem | null => {
  const item = data?.news?.[id]
  return item && typeof item.translations === "object" ? item : null
}

/** A supporter count worth showing: a finite number of at least one. */
export const parseCount = (value: unknown): number | null =>
  typeof value === "number" && isFinite(value) && value >= 1 ? value : null

export const formatAmount = (
  amount: number,
  currency: string,
  locale?: string,
  fractionDigits = 0
): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)

/**
 * A campaign end date in the reader's language, or `null` when unparsable.
 * Formats dayjs's own parse: `new Date("2027-01-31 23:59:59")` is not ISO and
 * a date-only string would be read as UTC, shifting the day west of Greenwich.
 */
export const formatDay = (
  date?: string,
  locale?: string,
  month: "short" | "long" = "long"
): string | null => {
  const parsed = date ? dayjs(date) : null
  return parsed?.isValid()
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month }).format(parsed.toDate())
    : null
}
