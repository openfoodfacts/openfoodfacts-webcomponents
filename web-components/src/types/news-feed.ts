/**
 * Figures a funding campaign publishes in the feed.
 */
export interface Funding {
  raised: number
  goal: number
  currency: string
}

/**
 * One translation of a feed item, plus the optional copy slots the donation
 * banner variants can override (`donation-proposal/specs/C2` PO decision 1).
 */
export interface NewsTranslation {
  title: string
  message: string
  url?: string
  image?: {
    url: string
  }
  button_label?: string
  hook?: string
  fine_print?: string
  tier_note?: string
}

/** The six feed keys a donation-banner slot can read. */
export type FeedCopyKey = "title" | "message" | "hook" | "button_label" | "fine_print" | "tier_note"

export interface NewsItem {
  translations: {
    [key: string]: NewsTranslation
  }
  url?: string
  start_date?: string
  end_date?: string
  languages?: string[]
  countries?: string[]
  min_app_version?: string
  max_app_version?: string
  enabled?: boolean
  message_type?: string
  raised?: number
  goal?: number
  currency?: string
  /** Supporter count for the campaign; absent on feeds that do not publish it yet. */
  count?: number
}

/**
 * This is the format of the JSON file where data is stored
 */
export interface NewsData {
  news: {
    [key: string]: NewsItem
  }
  tagline_feed: {
    default: {
      news: {
        id: string
      }[]
    }
  }
}

/**
 * From the json data we extract all news item as objects
 * with properties we need to display and filter them.
 */
export interface ProcessedNewsItem {
  id: string
  title: string
  message: string
  url?: string
  icon_url?: string
  start_date?: string
  end_date?: string
  languages?: string[]
  countries?: string[]
  min_app_version?: string
  max_app_version?: string
  enabled: boolean
  message_type: string
  funding?: Funding
}
