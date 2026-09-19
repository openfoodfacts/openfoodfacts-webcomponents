import { LitElement, html, css, nothing, type PropertyValues } from "lit"
import dayjs from "dayjs/esm"
import { customElement, property, state } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import { Task, TaskStatus } from "@lit/task"
import { getImageUrl, languageCode } from "../../signals/app"
import {
  DEFAULT_LANGUAGE_CODE,
  DonationBannerAction,
  DonationBannerVariant,
  DonationInterval,
  EventState,
  EventType,
} from "../../constants"
import type { BasicStateEventDetail, DonationBannerStateEventDetail } from "../../types"
import type { FeedCopyKey, NewsData, NewsItem } from "../../types/news-feed"
import { findNewsItem, parseCount, parseFunding } from "../../utils/funding"
import { classMap } from "lit/directives/class-map.js"
import { ifDefined } from "lit/directives/if-defined.js"
import { darkModeListener } from "../../utils/dark-mode-listener"
import { DONATION_BANNER_VARIANTS } from "../../styles/donation-banner-variants"
import "../donation-meter/donation-meter"
import "../icons/cross"

// Shared by every <donation-banner> on the page. An open `sheet` locks the
// body's scroll and a shown `bar` pads the body's bottom so it never covers the
// page's own content. A page can hold several banners (one at the top and one
// in the footer), so the counters make the first sheet take the lock, the last
// sheet to close release it, and the last bar to go remove the padding.
const openOnPage = { sheets: 0, bars: 0, bodyOverflow: "" }

/**
 * Donation banner
 * @element donation-banner
 * It requires one of the following fonts for each list item to be loaded:
 * - "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif
 * - "Public Sans", Helvetica, Roboto, Arial, sans-serif
 * - "Segoe UI", Tahoma, Geneva, Verdana, sans-serif
 *
 * With `variant="campaign"|"strip"|"sheet"|"bar"` and `news-id`, it reads copy
 * and figures from the tagline feed item named by `news-id` instead of the
 * built-in 2026 campaign text. No `variant` (or an unknown one) renders
 * exactly the banner of 1.18.0, so existing markup keeps working.
 *
 * @fires {EventType.DONATION_BANNER_STATE} - dismiss / minimize / already-donated / click
 */
@customElement("donation-banner")
@localized()
export class DonationBanner extends LitElement {
  /**
   * The links to the donation page
   * @type {Object}
   */
  @property({ type: Object })
  links = {
    fr: "https://open-food-facts.assoconnect.com/collect/description/476750-c-faire-un-don-a-open-food-facts",
    default: "https://world.openfoodfacts.org/donate-to-open-food-facts",
  }

  /**
   * News feed carrying the campaign figures.
   * @type {String}
   */
  @property({ type: String, attribute: "news-url" })
  newsUrl?: string

  /** Which feed item to read copy and figures from, for the four variants. */
  @property({ type: String, attribute: "news-id" })
  newsId?: string

  /** `campaign` | `strip` | `sheet` | `bar`. Absent or unknown = today's banner. */
  @property({ type: String })
  variant?: string

  /** Comma-separated monthly tiers, e.g. `"3,5,10"`. Absent = no tiers. */
  @property({ type: String })
  amounts?: string

  /** Which tier is preselected; defaults to the middle of `amounts`. */
  @property({ type: Number })
  selected?: number

  /** ISO country code; only `"fr"` (case-insensitive) changes any copy. */
  @property({ type: String })
  country?: string

  /** Overrides the automatic `utm_content=meter` tag. */
  @property({ type: String, attribute: "utm-content" })
  utmContent?: string

  @state()
  private pickedAmount?: number

  @state()
  private barDismissed = false

  /** Whether the meter is showing figures, not merely mounted. */
  @state()
  private meterHasFigures = false

  /**
   * Custom link/url to the donation page.
   * @type {String}
   */
  @property({ type: String, attribute: "donate-url" })
  donateUrl?: string

  @property({ type: String, attribute: "donate-link" })
  donateLinkProp?: string

  /**
   * The fundraiser year (next year)
   * @type {String}
   */
  @property({ type: String, reflect: true, attribute: "current-year" })
  currentYear: string = this.getDefaultYear()

  /**
   * Whether to apply dark mode styling (auto-detected from prefers-color-scheme)
   */
  isDarkMode = darkModeListener.darkMode
  private _darkModeCb = (isDark: boolean) => {
    this.isDarkMode = isDark
    this.requestUpdate()
  }

  /** Whether this element currently holds one of the page's sheet locks. */
  private locked = false
  private previouslyFocused: HTMLElement | null = null
  /** Whether this element currently counts as one of the page's padding bars. */
  private padded = false

  override connectedCallback() {
    super.connectedCallback()
    darkModeListener.subscribe(this._darkModeCb)
    document.addEventListener("keydown", this.onSheetKeyDown)
  }

  override disconnectedCallback() {
    darkModeListener.unsubscribe(this._darkModeCb)
    document.removeEventListener("keydown", this.onSheetKeyDown)
    this.clearPageEffects()
    super.disconnectedCallback()
  }

  override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has("variant")) {
      this.barDismissed = false
    }
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties)
    this.syncPageEffects()
  }

  getDefaultYear() {
    return (new Date().getFullYear() + 1).toString()
  }

  private onMeterState = (event: CustomEvent<BasicStateEventDetail>) => {
    // A meter removed from the page keeps its in-flight request, and Lit keeps
    // the listener bound to it, so a late answer must not speak for the banner.
    if (!(event.target as HTMLElement).isConnected) {
      return
    }
    this.meterHasFigures = event.detail.state === EventState.HAS_DATA
  }

  getLinkWithQueryParams(link: string, extra: Record<string, string> = {}) {
    const locale = languageCode.get()
    let url = new URL(
      link,
      typeof window !== "undefined" && window.location?.href
        ? window.location.href
        : "https://world.openfoodfacts.org"
    )
    // The link is rendered into an href, which is a script sink, and the page
    // embedding this element chooses it. `javascript:donate()//` would run in
    // that page and comment out the parameters appended below, so anything
    // that is not one of the two web schemes falls back to the donation page.
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      url = new URL(this.links.default)
    }
    const params = new URLSearchParams(url.search)
    if (!params.has("utm_source")) params.set("utm_source", "off")
    if (!params.has("utm_medium")) params.set("utm_medium", "web")
    if (!params.has("utm_campaign")) params.set("utm_campaign", `donate-${this.currentYear}-a`)
    if (!params.has("utm_term")) params.set("utm_term", `${locale || "en"}-text-button`)
    if (this.utmContent && !params.has("utm_content")) params.set("utm_content", this.utmContent)
    // A meter showing nothing leaves the banner identical to the plain one, so
    // crediting the click to a meter that is not there would inflate the count.
    if (this.newsUrl && this.meterHasFigures && !params.has("utm_content"))
      params.set("utm_content", "meter")
    for (const [key, value] of Object.entries(extra)) {
      params.set(key, value)
    }
    url.search = params.toString()
    return url.toString()
  }

  private linkFor(extra: Record<string, string> = {}) {
    const locale = languageCode.get()
    const customLink = this.donateUrl || this.donateLinkProp
    const link = customLink
      ? customLink
      : locale in this.links
        ? this.links[locale as keyof typeof this.links]
        : locale && locale !== "en"
          ? `https://world-${locale}.openfoodfacts.org/donate-to-open-food-facts`
          : this.links.default
    return this.getLinkWithQueryParams(link, extra)
  }

  get donateLink() {
    return this.linkFor()
  }

  private get view(): DonationBannerVariant | null {
    return this.variant && (Object.values(DonationBannerVariant) as string[]).includes(this.variant)
      ? (this.variant as DonationBannerVariant)
      : null
  }

  private get tiers(): number[] {
    return (this.amounts ?? "")
      .split(",")
      .map((entry) => Number(entry.trim()))
      .filter((amount) => isFinite(amount) && amount > 0)
  }

  private get preselected(): number | undefined {
    const tiers = this.tiers
    if (tiers.length === 0) {
      return undefined
    }
    if (this.selected !== undefined && tiers.includes(this.selected)) {
      return this.selected
    }
    return tiers[Math.floor((tiers.length - 1) / 2)]
  }

  private get amount(): number | undefined {
    const tiers = this.tiers
    if (this.pickedAmount !== undefined && tiers.includes(this.pickedAmount)) {
      return this.pickedAmount
    }
    return this.preselected
  }

  private _feedTask = new Task(this, {
    args: () => [this.newsUrl, this.view ? this.newsId : undefined] as const,
    task: async ([url, id]) => {
      if (!url || !id) {
        return null
      }
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return findNewsItem((await response.json()) as NewsData, id)
    },
  })

  private get newsItem(): NewsItem | null {
    return this._feedTask.status === TaskStatus.COMPLETE ? (this._feedTask.value ?? null) : null
  }

  private get funding() {
    const item = this.newsItem
    return item ? parseFunding(item.raised, item.goal, item.currency) : null
  }

  private get count(): number | null {
    return parseCount(this.newsItem?.count)
  }

  private get locale(): string {
    return languageCode.get() || DEFAULT_LANGUAGE_CODE
  }

  private format(amount: number, currency: string, fractionDigits = 0) {
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount)
  }

  // dayjs parses the feed's `2027-01-31 23:59:59`, which is not ISO, and reads a
  // date-only string as local time, so the day does not shift west of Greenwich.
  private formatDay(date?: string) {
    const parsed = date ? dayjs(date) : null
    return parsed?.isValid()
      ? new Intl.DateTimeFormat(this.locale, { day: "numeric", month: "long" }).format(
          parsed.toDate()
        )
      : null
  }

  private get isFrance(): boolean {
    return (this.country ?? "").toLowerCase() === "fr"
  }

  private get currency(): string {
    return this.funding?.currency ?? "EUR"
  }

  private get countText(): string | null {
    return this.count !== null ? new Intl.NumberFormat(this.locale).format(this.count) : null
  }

  /**
   * Returns the feed's copy for this slot in the page language (`fr_FR`, then
   * `fr`), or `undefined` so the caller falls back to the built-in `msg()`.
   * `translations.default` is never read: it is English, and would replace a
   * string that `msg()` already translates.
   */
  private feedText(key: FeedCopyKey): string | undefined {
    const translations = this.newsItem?.translations
    if (!translations) {
      return undefined
    }
    const locale = this.locale
    const full = locale.replace("-", "_")
    const short = locale.split("-")[0]
    const pick = (lang: string) => {
      const value = translations[lang]?.[key]
      return typeof value === "string" ? value : undefined
    }
    return pick(full) ?? pick(short)
  }

  private fill(text: string, values: Record<string, string | undefined>): string {
    return text
      .replace(/\{(\w+)\}/g, (_match, key) =>
        values.hasOwnProperty(key) ? (values[key] ?? "") : ""
      )
      .replace(/ {2,}/g, " ")
      .trim()
  }

  private get baseCopyValues(): Record<string, string | undefined> {
    const funding = this.funding
    return {
      count: this.countText ?? undefined,
      raised: funding ? this.format(funding.raised, funding.currency) : undefined,
      goal: funding ? this.format(funding.goal, funding.currency) : undefined,
      year: this.currentYear,
      end_date: this.formatDay(this.newsItem?.end_date) ?? undefined,
    }
  }

  private copy(
    key: FeedCopyKey,
    builtIn: string,
    extra: Record<string, string | undefined> = {}
  ): string {
    const feed = this.feedText(key)
    if (!feed) {
      return builtIn
    }
    return this.fill(feed, { ...this.baseCopyValues, ...extra })
  }

  /** The Give button's label: feed `button_label`, or a built-in template filled with the tier amount. */
  private giveLabel(template: (amount: string) => string): string {
    const tiers = this.tiers
    if (!tiers.length) {
      return this.copy("button_label", msg("Support"))
    }
    const amountText = this.selectedAmountText()
    return this.copy("button_label", template(amountText), { amount: amountText })
  }

  /** The selected tier (or the first one) formatted as an amount, for the Give button and the hook line. */
  private selectedAmountText(): string {
    return this.format(this.amount ?? this.tiers[0], this.currency)
  }

  private emit(
    action: DonationBannerAction,
    extra: { amount?: number; interval?: DonationInterval } = {}
  ) {
    const detail: DonationBannerStateEventDetail = { action, variant: this.view, ...extra }
    this.dispatchEvent(
      new CustomEvent(EventType.DONATION_BANNER_STATE, { detail, bubbles: true, composed: true })
    )
  }

  private onDismiss = () => {
    this.emit(DonationBannerAction.DISMISS)
    if (this.view === DonationBannerVariant.BAR) {
      this.barDismissed = true
    }
  }

  private onMinimize = () => {
    this.emit(DonationBannerAction.MINIMIZE)
  }

  private onAlreadyDonated = () => {
    this.emit(DonationBannerAction.ALREADY_DONATED)
  }

  private onTier = (amount: number) => {
    this.pickedAmount = amount
  }

  private onGive = () => {
    if (this.tiers.length) {
      this.emit(DonationBannerAction.CLICK, {
        amount: this.amount,
        interval: DonationInterval.MONTHLY,
      })
    } else {
      this.emit(DonationBannerAction.CLICK)
    }
  }

  private onOther = () => {
    this.emit(DonationBannerAction.CLICK, { interval: DonationInterval.ONE_TIME })
  }

  private onSupport = () => {
    this.emit(DonationBannerAction.CLICK)
  }

  /** Escape closes the sheet; Tab/Shift-Tab wrap inside it while it is open. */
  private onSheetKeyDown = (event: KeyboardEvent) => {
    if (this.view !== DonationBannerVariant.SHEET) {
      return
    }
    if (event.key === "Escape") {
      this.onMinimize()
      return
    }
    if (event.key !== "Tab") {
      return
    }
    const root = this.shadowRoot?.querySelector<HTMLElement>(".sheet")
    if (!root) {
      return
    }
    const focusable = Array.from(root.querySelectorAll<HTMLElement>("button, a[href]"))
    if (!focusable.length) {
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = this.shadowRoot?.activeElement as HTMLElement | null
    // Right after opening, focus is on the sheet itself (`tabindex="-1"`), not
    // on a button, so Tab goes to the first button and Shift-Tab to the last.
    const inside = active !== null && focusable.includes(active)
    if (event.shiftKey && (!inside || active === first)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (!inside || active === last)) {
      event.preventDefault()
      first.focus()
    }
  }

  private syncPageEffects() {
    const isSheet = this.view === DonationBannerVariant.SHEET
    if (isSheet && !this.locked) {
      this.lock()
      this.previouslyFocused = document.activeElement as HTMLElement | null
      this.shadowRoot?.querySelector<HTMLElement>(".sheet")?.focus()
    } else if (!isSheet && this.locked) {
      this.unlock()
      this.previouslyFocused?.focus?.()
      this.previouslyFocused = null
    }

    const isBarShown = this.view === DonationBannerVariant.BAR && !this.barDismissed
    if (isBarShown) {
      // With two bars on the page the last one rendered sets the padding; they overlap anyway.
      const bar = this.shadowRoot?.querySelector<HTMLElement>(".bar")
      if (bar) {
        document.body.style.paddingBottom = `${bar.offsetHeight}px`
        if (!this.padded) {
          this.padded = true
          openOnPage.bars++
        }
      }
    } else if (this.padded) {
      this.unpad()
    }
  }

  private lock() {
    this.locked = true
    if (openOnPage.sheets++ === 0) {
      openOnPage.bodyOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
    }
  }

  private unlock() {
    this.locked = false
    if (--openOnPage.sheets === 0) {
      document.body.style.overflow = openOnPage.bodyOverflow
    }
  }

  private unpad() {
    this.padded = false
    if (--openOnPage.bars === 0) {
      document.body.style.paddingBottom = ""
    }
  }

  private clearPageEffects() {
    if (this.locked) {
      this.unlock()
    }
    if (this.padded) {
      this.unpad()
    }
  }

  static override styles = [
    DONATION_BANNER_VARIANTS,
    css`
      .donation-banner,
      .donation-banner-footer {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        padding: 30px;
        gap: 40px;
        border: 10px solid #ff6e78;
        width: 100%;
        background-color: white;
        box-sizing: border-box;
        border-radius: 20px;
      }
      .dark-mode .donation-banner,
      .dark-mode .donation-banner-footer {
        background-color: #2d2724;
        color: #f9f7f5;
        border-color: #ff6e78;
        border-radius: 20px;
      }
      .dark-mode .donation-banner__main-title,
      .dark-mode .donation-banner-footer__main-title {
        color: #ff6e78;
      }
      .dark-mode .donation-banner__main-div-wrapper {
        color: #f9f7f5;
      }
      .dark-mode .donation-banner__hook-section,
      .dark-mode .donation-banner-footer__hook-section {
        background-color: #0050a0;
        color: #fff;
      }
      .group-image {
        height: auto;
        width: 100%;
        max-width: 100%;
        display: inline-block;
        vertical-align: middle;
        border-radius: 5px;
        object-fit: contain;
      }
      .donation-banner__group-photo,
      .donation-banner-footer__group-photo {
        border-radius: 5px;
      }
      .donation-banner__close button,
      .donation-banner-footer__close button {
        position: absolute;
        top: 0.3rem;
        right: 0.3rem;
        cursor: pointer;
        background-color: transparent;
        color: inherit;
      }
      .donation-banner__hook-section,
      .donation-banner-footer__hook-section {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #008c8c;
        color: white;
        padding: 10px 15px;
        margin-bottom: 15px;
        border-radius: 10px;
        z-index: 1;
        width: 100%;
        box-sizing: border-box;
      }
      .donation-banner__hook-section p,
      .donation-banner-footer__hook-section p {
        font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
        font-size: 25px;
        font-weight: 700;
        line-height: 1.2;
        text-transform: uppercase;
        margin: 0;
      }
      .donation-banner__left-aside,
      .donation-banner-footer__left-aside {
        flex: 1 1 450px;
        min-width: 300px;
        max-width: 650px;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .donation-banner__aside,
      .donation-banner-footer__aside {
        display: flex;
        flex-direction: column;
      }
      .donation-banner__main-title,
      .donation-banner-footer__main-title {
        font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
        color: #ff6e78;
        font-weight: 800;
        font-size: 25px;
        margin: 0;
        font-weight: 500;
        line-height: 1.2;
      }
      .donation-banner__main-div-wrapper {
        flex: 1 1 450px;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: black;
      }
      .donation-banner__main-div {
        font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
      }
      .donation-banner__main-section,
      .donation-banner-footer__main-section {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
      }
      .donation-banner__actions-section,
      .donation-banner-footer__actions-section {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }
      .donation-banner__actions-section__financial,
      .donation-banner-footer__actions-section__financial {
        flex: 1 1 250px;
      }
      .donation-banner__actions-section__financial p,
      .donation-banner-footer__actions-section__financial p {
        font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
        font-size: 15px;
        color: #008c8c;
        font-weight: bolder;
        margin: 0;
      }
      .donation-banner__actions-section__donate-button,
      .donation-banner-footer__actions-section__donate-button {
        flex: 0 0 auto;
      }
      .donation-banner__actions-section__donate-button a button,
      .donation-banner-footer__actions-section__donate-button a button {
        background-color: #ff6e78;
        border-radius: 30px;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 20px;
        font-weight: 900;
        padding: 12px 30px;
        color: white;
        border: none;
        cursor: pointer;
        white-space: nowrap;
      }
      .donation-banner__actions-section__donate-button a button:hover,
      .donation-banner-footer__actions-section__donate-button a button:hover {
        background-color: rgba(255, 110, 120, 0.8);
      }
      .unordered-list {
        margin: 0 0 20px 15px;
        padding: 0;
        line-height: 1.6;
        font-size: 14px;
      }
      .unordered-list li p {
        margin: 0;
      }

      /* Mobile Optimizations for tablet */
      @media (min-width: 700px) and (max-width: 1050px) {
        .donation-banner,
        .donation-banner-footer {
          flex-wrap: nowrap;
          padding: 20px 15px;
          gap: 15px;
        }

        .donation-banner__left-aside,
        .donation-banner-footer__left-aside {
          flex: 35;
          min-width: 0;
          max-width: 300px;
          margin: 0;
        }
        .donation-banner__main-div-wrapper {
          flex: 65;
          min-width: 0;
        }
        .donation-banner__actions-section,
        .donation-banner-footer__actions-section {
          flex-wrap: nowrap;
          gap: 5px;
          padding-top: 5px;
        }
        .donation-banner__actions-section__financial p,
        .donation-banner-footer__actions-section__financial p {
          font-size: 13px;
          line-height: 1.2;
        }
        .donation-banner__actions-section__donate-button a button,
        .donation-banner-footer__actions-section__donate-button a button {
          font-size: 18px;
          padding: 8px 12px;
          white-space: nowrap;
        }
        .donation-banner__hook-section p,
        .donation-banner-footer__hook-section p {
          font-size: 20px;
          line-height: 1.2;
          flex: 1;
          width: auto;
        }
      }
      /* Mobile Optimizations for phone */
      @media (max-width: 700px) {
        .donation-banner,
        .donation-banner-footer {
          padding: 20px 10px;
          gap: 25px;
        }

        /* Allow flex items to shrink below their content size on mobile */
        .donation-banner__left-aside,
        .donation-banner-footer__left-aside,
        .donation-banner__main-div-wrapper {
          min-width: 0 !important;
          width: 100% !important;
          flex-basis: auto !important;
        }
        .donation-banner__actions-section__donate-button a button,
        .donation-banner-footer__actions-section__donate-button a button {
          font-size: 18px;
          padding: 8px 12px;
          white-space: nowrap;
        }
        .group-image {
          width: 100%;
          height: auto;
        }

        /* Reduce font size for mobile, balance the visual effect*/
        .donation-banner__main-title,
        .donation-banner-footer__main-title {
          font-size: 20px;
        }
        .donation-banner__hook-section p,
        .donation-banner-footer__hook-section p {
          font-size: 18px;
          line-height: 1.2;
          flex: 1;
          width: auto;
        }

        .donation-banner__main-section,
        .donation-banner-footer__main-section {
          flex-direction: row;
          align-items: center;
          justify-content: center;
          text-align: left;
          width: 100%;
        }

        /* Prevent long words (like URLs) from breaking layout */
        .unordered-list li,
        p {
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
        }

        .donation-banner__actions-section,
        .donation-banner-footer__actions-section {
          justify-content: center;
          text-align: center;
        }
      }
    `,
  ]

  private renderFundingMeter(line: "long" | "short") {
    const funding = this.funding
    if (!funding) {
      return nothing
    }
    return html`<donation-meter
      .funding=${funding}
      line=${line}
      .count=${this.count ?? undefined}
      end-date=${ifDefined(this.newsItem?.end_date)}
      @donation-meter-state=${this.onMeterState}
    ></donation-meter>`
  }

  private renderTiers() {
    const tiers = this.tiers
    if (!tiers.length) {
      return nothing
    }
    const currency = this.currency
    const selectedAmount = this.amount
    const preselected = this.preselected
    return html`<div class="tiers">
      ${tiers.map((tierAmount) => {
        const isSelected = tierAmount === selectedAmount
        const isPreselected = tierAmount === preselected
        const amountText = this.format(tierAmount, currency)
        const note = isPreselected ? this.copy("tier_note", "", { amount: amountText }) : ""
        return html`<button
          type="button"
          class=${classMap({ tier: true, selected: isSelected })}
          aria-pressed=${isSelected}
          @click=${() => this.onTier(tierAmount)}
        >
          ${isPreselected ? html`<span class="badge">${msg("Most popular")}</span>` : nothing}
          ${amountText}
          <small>${msg("/month")}${note ? html` ${note}` : nothing}</small>
        </button>`
      })}
      <a
        class="tier other"
        href=${this.linkFor({ interval: DonationInterval.ONE_TIME })}
        @click=${this.onOther}
      >
        ${msg("Other")}
        <small>${msg("one-time")}</small>
      </a>
    </div>`
  }

  private renderGive(label: string) {
    const href = this.tiers.length
      ? this.linkFor({ amount: String(this.amount), interval: DonationInterval.MONTHLY })
      : this.linkFor()
    return html`<a class="give" href=${href} @click=${this.onGive}>${label}</a>`
  }

  private renderClose(handler: () => void) {
    return html`<button type="button" class="close" aria-label=${msg("Close")} @click=${handler}>
      <cross-icon></cross-icon>
    </button>`
  }

  private renderAlreadyDonated() {
    return html`<button type="button" class="link" @click=${this.onAlreadyDonated}>
      ${msg("I already donated")}
    </button>`
  }

  private h2Headline(): string {
    const count = this.countText
    if (this.isFrance) {
      return count
        ? this.copy(
            "title",
            msg(
              str`To our readers in France: join the ${count} people keeping Open Food Facts free.`
            )
          )
        : this.copy(
            "title",
            msg("To our readers in France: join the people keeping Open Food Facts free.")
          )
    }
    return this.joinHeadline()
  }

  private joinHeadline(): string {
    const count = this.countText
    return count
      ? this.copy("title", msg(str`Join the ${count} people keeping Open Food Facts free.`))
      : this.copy("title", msg("Join the people keeping Open Food Facts free."))
  }

  private hook(): string {
    if (!this.tiers.length) {
      return this.copy("hook", msg("€3 a month keeps it that way."))
    }
    const amount = this.selectedAmountText()
    return this.copy("hook", msg(str`${amount} a month keeps it that way.`), { amount })
  }

  private barHeadline(): string {
    const count = this.countText
    const builtIn = count
      ? msg(str`Join ${count} people keeping this free.`)
      : msg("Join the people keeping this free.")
    return this.copy("title", builtIn)
  }

  private campaignParagraph(): string {
    const funding = this.funding
    const goal = funding ? this.format(funding.goal, funding.currency) : null
    const builtIn = goal
      ? msg(
          str`Open Food Facts is a non-profit. No ads, no industry money, 4.6 million products kept open by volunteers. We need ${goal} to run the servers and one engineer in ${this.currentYear}. If you looked something up today, €3 a month keeps it free for a year.`
        )
      : msg(
          "Open Food Facts is a non-profit. No ads, no industry money, 4.6 million products kept open by volunteers. If you looked something up today, €3 a month keeps it free for a year."
        )
    return this.copy("message", builtIn)
  }

  private renderCampaignFinePrint() {
    if (this.isFrance && this.amount !== undefined) {
      const amount = this.format(this.amount, this.currency)
      const net = this.format(this.amount * 0.34, this.currency, 2)
      const builtIn = msg(
        str`Tax deductible in France: ${amount} costs you ${net}. Cancel any time.`
      )
      return html`<p class="fine">${this.copy("fine_print", builtIn, { amount, net })}</p>`
    }
    const feed = this.feedText("fine_print")
    if (feed) {
      return html`<p class="fine">${this.fill(feed, this.baseCopyValues)}</p>`
    }
    return html`<p class="fine">${msg("Cancel any time.")}<br />${msg("Receipt by email.")}</p>`
  }

  private renderCampaign() {
    return html`<section class=${classMap({ "dark-mode": this.isDarkMode, campaign: true })}>
      <div class="text">
        <h2 id="donation-banner-title">${this.h2Headline()}</h2>
        <p>${this.campaignParagraph()}</p>
        ${this.renderFundingMeter("long")}
      </div>
      <div class="ask">
        ${this.renderTiers()}
        <div class="cta">
          ${this.renderGive(this.giveLabel((amount) => msg(str`Give ${amount} a month`)))}
          ${this.renderCampaignFinePrint()}
        </div>
      </div>
      <div class="links">${this.renderAlreadyDonated()} ${this.renderClose(this.onDismiss)}</div>
    </section>`
  }

  private renderStrip() {
    return html`<section class=${classMap({ "dark-mode": this.isDarkMode, strip: true })}>
      <span>
        <b>${this.joinHeadline()}</b>
        <span class="more">${this.hook()}</span>
      </span>
      <span>
        <a class="go" href=${this.linkFor()} @click=${this.onSupport}>
          ${this.copy("button_label", msg("Support"))}
        </a>
        ${this.renderClose(this.onDismiss)}
      </span>
    </section>`
  }

  private renderSheet() {
    return html`<section class=${classMap({ "dark-mode": this.isDarkMode, "sheet-root": true })}>
      <div class="overlay" @click=${this.onMinimize}></div>
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-banner-title"
        tabindex="-1"
      >
        <div class="grab"></div>
        ${this.renderClose(this.onMinimize)}
        <h2 id="donation-banner-title">${this.h2Headline()}</h2>
        <p>${this.campaignParagraph()}</p>
        ${this.renderFundingMeter("short")} ${this.renderTiers()}
        ${this.renderGive(this.giveLabel((amount) => msg(str`Give ${amount} a month`)))}
        <p class="fine">
          ${this.copy("fine_print", msg("Cancel any time"))} · ${this.renderAlreadyDonated()} ·
          <button type="button" class="link" @click=${this.onMinimize}>${msg("Not now")}</button>
        </p>
      </div>
    </section>`
  }

  private renderBarVariant() {
    if (this.barDismissed) {
      return html`<section
        class=${classMap({ "dark-mode": this.isDarkMode, "bar-root": true })}
      ></section>`
    }
    return html`<section class=${classMap({ "dark-mode": this.isDarkMode, "bar-root": true })}>
      <div class="bar">
        <div class="tx">
          <b>${this.barHeadline()}</b>
          ${this.hook()}
        </div>
        ${this.renderGive(this.giveLabel((amount) => msg(str`Give ${amount}/mo`)))}
        ${this.renderClose(this.onDismiss)}
      </div>
    </section>`
  }

  private renderDefault() {
    const rootClasses = { "dark-mode": this.isDarkMode }
    return html`<section class=${classMap(rootClasses)}>
      <div class="donation-banner-footer row">
        <div class="donation-banner-footer__left-aside">
          <div class="donation-banner-footer__hook-section">
            <p>${msg("We still need €120,000 to finish 2026!")}</p>
          </div>
          <img
            class="group-image"
            src="${getImageUrl("donation-banner-group-photo.png")}"
            alt="${msg(str`group photo donation ${this.currentYear}`)}"
          />
        </div>
        <div class="donation-banner__main-div-wrapper">
          <div style="padding-left: 16px;">
            <div class="donation-banner-footer__main-section">
              <img
                width="50"
                height="50"
                src="${getImageUrl("CMJN-ICON_WHITE_BG_OFF.svg")}"
                alt="open food facts logo"
              />
              <h3 class="donation-banner-footer__main-title">
                ${msg("Become an Open Food Facts patron")}
              </h3>
            </div>
            <p style="margin: 0 0 20px; font-size: 14px;">
              ${msg("Your donations fund the day-to-day operations of our non-profit association:")}
            </p>
            <ul class="unordered-list">
              <li>${msg("keeping our database open & available to all,")}</li>
              <li>
                ${msg("technical infrastructure (website/mobile app) & a small permanent team")}
              </li>
              <li>
                <p>${msg("remain independent of the food industry,")}</p>
              </li>
              <li>
                <p>${msg("engage a community of committed citizens,")}</p>
              </li>
              <li>
                <p>${msg("support the advancement of public health research.")}</p>
              </li>
            </ul>
            ${this.newsUrl
              ? html`<donation-meter
                  url=${this.newsUrl}
                  @donation-meter-state="${this.onMeterState}"
                ></donation-meter>`
              : nothing}
          </div>
          <div class="donation-banner-footer__actions-section">
            <div class="donation-banner-footer__actions-section__financial">
              <p style="margin: 0px; line-height: 1.6">
                ${msg(
                  "If every visitor this month clicked on Donate and gave just 1€, we'd get over 8 times our yearly budget!"
                )}
              </p>
            </div>
            <div class="donation-banner-footer__actions-section__donate-button">
              <a href="${this.donateLink}">
                <button>${msg("I SUPPORT")}</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  override render() {
    switch (this.view) {
      case DonationBannerVariant.CAMPAIGN:
        return this.renderCampaign()
      case DonationBannerVariant.STRIP:
        return this.renderStrip()
      case DonationBannerVariant.SHEET:
        return this.renderSheet()
      case DonationBannerVariant.BAR:
        return this.renderBarVariant()
      default:
        return this.renderDefault()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "donation-banner": DonationBanner
  }
}
