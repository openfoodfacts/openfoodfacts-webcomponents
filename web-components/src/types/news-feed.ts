/**
 * This is the format of the JSON file where data is stored
 */
export interface NewsData {
  news: {
    [key: string]: {
      translations: {
        [key: string]: {
          title: string
          message: string
          url?: string
          image?: {
            url: string
          }
        }
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
    }
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
}
