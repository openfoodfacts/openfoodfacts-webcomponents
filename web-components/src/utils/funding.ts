import dayjs from "dayjs/esm"
import type { Funding, NewsData } from "../types/news-feed"

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
