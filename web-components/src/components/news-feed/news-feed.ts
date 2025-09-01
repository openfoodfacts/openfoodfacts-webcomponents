import { marked } from "marked"
import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { NewsData, ProcessedNewsItem } from "../../types/news-feed"
import { Task } from "@lit/task"
import { sanitizeHtml } from "../../utils/html"
import dayjs from "dayjs/esm"

/**
 * `news-feed` - A web component that displays news items from a JSON feed.
 *
 * @customElement
 * @lit-element
 * @example
 * <news-feed
 *   url="https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/android/main.json"
 *   language-code="en"
 *   country-code="fr"
 *   app-version="3.5.0"
 * ></news-feed>
 */
@customElement("news-feed")
export class NewsFeed extends LitElement {
  @property({ attribute: "url" }) url?: string
  @property({ attribute: "lang" }) languageCode?: string
  @property({ attribute: "country" }) countryCode?: string
  @property({ attribute: "app-version" }) appVersion?: string

  static override styles = css`
    :host {
      display: block;
      font-family: "Inter", sans-serif;
      width: 100%;
      margin: 1rem auto;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.1),
        0 1px 2px 0 rgba(0, 0, 0, 0.06);
      overflow: hidden;
      background: #fff;
    }

    .loading-container {
      padding: 1rem;
      text-align: center;
      color: #6b7280;
    }

    .error-container {
      padding: 1rem;
      text-align: center;
      color: #ef4444;
      background-color: #fee2e2;
      border-radius: 0.375rem;
    }

    .news-container {
      border-top: 1px solid #e5e7eb;
    }

    .news-item-wrapper {
      transition: background-color 0.2s ease-in-out;
      display: block;
      text-decoration: none;
      color: inherit;
      border-bottom: 1px solid #e5e7eb;
    }

    .news-item-wrapper:last-child {
      border-bottom: none;
    }

    .news-item-wrapper:hover {
      background-color: #f9fafb;
    }

    .news-item {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
    }

    .icon {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: contain;
      margin-right: 0.75rem;
      border-radius: 0.375rem;
      flex-shrink: 0;
    }

    .placeholder-icon {
      width: 2.5rem;
      height: 2.5rem;
      background-color: #e5e7eb;
      border-radius: 0.375rem;
      margin-right: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 0.75rem;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
      margin-top: 0;
    }

    .message {
      font-size: 0.875rem;
      color: #4b5563;
      line-height: 1.4;
      margin: 0;
    }

    .message strong,
    .message b {
      font-weight: 600;
      color: #1f2937;
    }

    /* Message Type Styles */
    .info {
      border-left: 4px solid #3b82f6; /* Blue */
    }

    .warning {
      border-left: 4px solid #f59e0b; /* Amber */
    }

    .error {
      border-left: 4px solid #ef4444; /* Red */
    }

    .no-news {
      padding: 1rem;
      text-align: center;
      color: #6b7280;
    }

    /* --- Dark Mode --- */
    @media (prefers-color-scheme: dark) {
      :host {
        background: #18181b;
        border-color: #27272a;
        box-shadow:
          0 1px 3px 0 rgba(0, 0, 0, 0.4),
          0 1px 2px 0 rgba(0, 0, 0, 0.3);
      }
      .loading-container,
      .no-news {
        color: #a1a1aa;
      }
      .error-container {
        color: #f87171;
        background-color: #7f1d1d;
      }
      .news-container {
        border-top: 1px solid #27272a;
      }
      .news-item-wrapper {
        border-bottom: 1px solid #27272a;
      }
      .news-item-wrapper:hover {
        background-color: #27272a;
      }
      .news-item {
        background: transparent;
      }
      .icon {
        background: white;
      }
      .placeholder-icon {
        background-color: #27272a;
        color: #a1a1aa;
      }
      .title {
        color: #fafafa;
      }
      .message {
        color: #d4d4d8;
      }
      .message strong,
      .message b {
        color: #fafafa;
      }
      .info {
        border-left: 4px solid #2563eb;
      }
      .warning {
        border-left: 4px solid #fbbf24;
      }
      .error {
        border-left: 4px solid #f87171;
      }
    }
  `

  // --- Helper Methods ---

  private getLang(lang: string | undefined) {
    return lang || navigator.language?.split("-")[0] || "en"
  }

  private getFullLang(lang: string | undefined) {
    // Get the full language code if available (e.g., 'fr-FR')
    return lang || navigator.language || "en"
  }

  /**
   * Go from raw data to data that can be displayed
   */
  private processNewsData(
    rawData: NewsData,
    { lang: currentLang, fullLang: currentFullLang }: { lang: string; fullLang: string }
  ): ProcessedNewsItem[] {
    const processedItems = []
    const newsDetailsMap = rawData.news || {}
    const feedIds = rawData.tagline_feed?.default?.news || [] // Safely access nested properties

    if (!rawData.news) {
      console.warn("[NewsFeed] 'news' object missing in raw data.")
      return []
    }

    if (!rawData.tagline_feed?.default?.news) {
      console.warn("[NewsFeed] 'tagline_feed.default.news' array missing in raw data.")
      return []
    }

    for (const feedItem of feedIds) {
      const id = feedItem.id
      const details = newsDetailsMap[id]

      if (!details) {
        console.warn(`[NewsFeed] Details not found for news ID: ${id}`)
        continue // Skip if details are missing for this ID
      }

      // --- Translation Selection ---
      let translation = details.translations?.default || {} // Start with default
      // Check for exact full language match (e.g., fr_FR) - adjust key format if needed
      const fullLangKey = currentFullLang.replace("-", "_") // e.g., en-US -> en_US
      if (details.translations && details.translations[fullLangKey]) {
        translation = details.translations[fullLangKey]
      }
      // Else, check for primary language match (e.g., fr)
      else if (details.translations && details.translations[currentLang]) {
        translation = details.translations[currentLang]
      }

      // --- Create Processed Item ---
      // Ensure we have fallbacks if translation or default is incomplete
      const defaultTranslation = details.translations?.default || {}

      processedItems.push({
        id: id, // Keep the original ID
        title: translation.title || defaultTranslation.title || "", // Fallback chain
        message: translation.message || defaultTranslation.message || "", // Fallback chain
        // Use the URL from the translation first, then the main item URL
        url: translation.url || details.url || "",
        // Use the image URL from the translation's image object
        icon_url: translation.image?.url || defaultTranslation.image?.url || "",
        // Copy other relevant properties directly from details
        start_date: details.start_date,
        end_date: details.end_date,
        languages: details.languages, // Keep original filters if needed
        countries: details.countries, // Keep original filters if needed
        min_app_version: details.min_app_version,
        max_app_version: details.max_app_version,
        enabled: details.enabled !== false, // Default to true if not explicitly false
        message_type: (details.message_type || "info").toLowerCase(), // Default to 'info'
        // Add other fields from 'details' if needed for filtering later
      })
    }

    return processedItems
  }

  private versionCompare(v1: string | undefined, v2: string | undefined) {
    const parts1 = (v1 || "").split(/[.-]/)
    const parts2 = (v2 || "").split(/[.-]/)
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1Str = parts1[i] || "0"
      const p2Str = parts2[i] || "0"
      const p1Num = parseInt(p1Str, 10)
      const p2Num = parseInt(p2Str, 10)
      if (!isNaN(p1Num) && !isNaN(p2Num)) {
        if (p1Num > p2Num) return 1
        if (p1Num < p2Num) return -1
      } else {
        if (p1Str > p2Str) return 1
        if (p1Str < p2Str) return -1
      }
    }
    return 0
  }

  // --- Filtering Logic ---
  private filterNews(
    processedNewsItems: ProcessedNewsItem[],
    {
      lang: currentLang,
      country: currentCountry,
      appVersion: currentAppVersion,
    }: { lang: string; country?: string; appVersion?: string }
  ): ProcessedNewsItem[] {
    const now = dayjs()

    return processedNewsItems.filter((item) => {
      // 1. Check if explicitly disabled (already handled in processing, but double check)
      if (item.enabled === false) {
        return false
      }

      // 2. Check dates (using processed item properties)
      // Ensure date strings are valid before creating Date objects
      const startDate = dayjs(item.start_date).isValid() ? dayjs(item.start_date) : null
      const endDate = dayjs(item.end_date).isValid() ? dayjs(item.end_date) : null

      if ((startDate && now.isBefore(startDate)) || (endDate && now.isAfter(endDate))) {
        return false // Not started yet or already ended
      }

      // 3. Check language (using original 'languages' array if present on item)
      if (item.languages && item.languages.length > 0) {
        const langMatch = item.languages.some(
          (lang) =>
            currentLang.toLowerCase() === lang.toLowerCase() ||
            currentLang.startsWith(lang.toLowerCase() + "-")
        )
        if (!langMatch) {
          return false
        }
      }

      // 4. Check country (using original 'countries' array if present on item)
      if (currentCountry && item.countries && item.countries.length > 0) {
        const countryMatch = item.countries.some(
          (country) => currentCountry.toLowerCase() === country.toLowerCase()
        )

        if (!countryMatch) {
          return false
        }
      }

      // 5. Check App Version (using min/max versions from item)
      if (currentAppVersion) {
        if (
          item.min_app_version &&
          this.versionCompare(currentAppVersion, item.min_app_version) < 0
        ) {
          return false
        }
        if (
          item.max_app_version &&
          this.versionCompare(currentAppVersion, item.max_app_version) > 0
        ) {
          return false
        }
      }

      // If all checks pass
      return true
    })
  }

  private _newsTask = new Task(this, {
    args: () => [this.url, this.languageCode, this.countryCode, this.appVersion],
    task: async ([url, lang, country, appVersion]) => {
      if (!url) {
        throw new Error("No data URL provided.")
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const currentLang = this.getLang(lang)
      const currentFullLang = this.getFullLang(lang)

      const rawData = (await response.json()) as NewsData
      const items = this.processNewsData(rawData, { lang: currentLang, fullLang: currentFullLang })

      const filteredItems = this.filterNews(items, {
        lang: currentLang,
        country: country,
        appVersion: appVersion,
      })

      const parsedNews = Promise.all(
        filteredItems.map(async (item) => ({
          ...item,
          parsedMessage: item.message ? await marked.parse(item.message) : "",
        }))
      )

      return parsedNews
    },
  })

  // --- Lit Render Methods ---

  _renderNewsItem(item: ProcessedNewsItem & { parsedMessage: string }) {
    const hasUrl = item.url && item.url.trim() !== ""
    const placeholderId = `placeholder-${item.id || Math.random().toString(36).substring(7)}`

    // Create placeholder icon content
    const placeholderContent = item.id ? item.id.substring(0, 3) : "NWS"

    // Create the icon html - either image with fallback or just placeholder
    const iconTemplate = item.icon_url
      ? html`
          <img
            src=${item.icon_url}
            alt=""
            class="icon"
            @error=${(e: Event) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"

              const element = this.shadowRoot!.querySelector(`#${placeholderId}`)! as HTMLElement
              element.style.display = "flex"
            }}
          />
          <div id=${placeholderId} class="placeholder-icon" style="display: none;">
            ${placeholderContent}
          </div>
        `
      : html`<div id=${placeholderId} class="placeholder-icon">${placeholderContent}</div>`

    // Content template - always the same
    const contentTemplate = html`
      <div class="content">
        ${item.title ? html`<h3 class="title">${item.title}</h3>` : ""}
        <p class="message">
          ${sanitizeHtml(item.parsedMessage) || item.message || "No message content."}
        </p>
      </div>
    `

    if (!hasUrl) {
      return html`
        <div class="news-item-wrapper" data-news-id=${item.id}>
          <div class="news-item ${item.message_type}">${iconTemplate} ${contentTemplate}</div>
        </div>
      `
    }

    return html`
      <a
        href=${item.url ?? ""}
        target="_blank"
        rel="noopener noreferrer"
        class="news-item-wrapper"
        data-news-id=${item.id}
      >
        <div class="news-item ${item.message_type}">${iconTemplate} ${contentTemplate}</div>
      </a>
    `
  }

  override render() {
    return this._newsTask.render({
      pending: () => html`<div class="loading-container">Loading news...</div>`,
      error: (e) => html`<div class="error-container">${e}</div>`,
      complete: (news) => {
        return html`
          <div class="news-container">
            ${news.length > 0
              ? news.map((item) => this._renderNewsItem(item))
              : html`<div class="no-news">No relevant news available right now.</div>`}
          </div>
        `
      },
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "news-feed": NewsFeed
  }
}
