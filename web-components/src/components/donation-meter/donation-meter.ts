import { LitElement, html, css, nothing, type PropertyValues } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import { Task, TaskStatus } from "@lit/task"
import { languageCode } from "../../signals/app"
import { EventState, EventType } from "../../constants"
import type { BasicStateEventDetail } from "../../types"
import type { Funding, NewsData } from "../../types/news-feed"
import { findFunding, formatAmount, formatDay, parseFunding } from "../../utils/funding"

/**
 * `donation-meter` - how far a funding campaign has got, from the figures the
 * news feed publishes. Point `url` at a feed the page is allowed to fetch.
 *
 * @customElement
 * @lit-element
 * @example
 * <donation-meter
 *   url="https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json"
 * ></donation-meter>
 *
 * @fires {EventType.DONATION_METER_STATE} - When the element starts or stops showing figures.
 */
@customElement("donation-meter")
@localized()
export class DonationMeter extends LitElement {
  /**
   * News feed to read the figures from. Omit it when the figures are set
   * directly on the `funding` property.
   */
  @property({ attribute: "url" }) url?: string

  @property({ type: Object }) funding?: Funding

  /** Renders the mock's meter line instead of the standalone figures; absent = today's markup. */
  @property({ attribute: "line" }) line?: "long" | "short"

  @property({ type: Number }) count?: number

  @property({ type: String, attribute: "end-date" }) endDate?: string

  private lastState?: EventState

  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .figures {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .raised {
      font-size: 1.125rem;
      font-weight: 700;
    }

    .goal,
    .shortfall {
      font-size: 0.8125rem;
      opacity: 0.85;
    }

    .shortfall {
      display: block;
      margin-top: 0.35rem;
    }

    .bar {
      position: relative;
      height: 0.5rem;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    /* The track takes the text colour, so the meter reads on any banner. The
       fill cannot inherit its opacity, hence the separate layer. */
    .bar::before {
      content: "";
      position: absolute;
      inset: 0;
      background-color: currentColor;
      opacity: 0.2;
    }

    .bar > div {
      position: relative;
      height: 100%;
      border-radius: 0.25rem;
      background-color: var(--off-donation-meter-fill, #ff6e78);
    }

    .row {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .row .raised {
      font-size: inherit;
    }
  `

  private _fundingTask = new Task(this, {
    args: () => [this.url] as const,
    task: async ([url]) => {
      if (!url) {
        return null
      }
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return findFunding((await response.json()) as NewsData)
    },
  })

  override connectedCallback() {
    super.connectedCallback()
    // An announcement made while the host was detached never reached it, so the
    // element has to say where it stands again rather than dedupe against it.
    this.lastState = undefined
    this.requestUpdate()
  }

  private get visibleFunding(): Funding | null {
    if (this.funding) {
      const { raised, goal, currency } = this.funding
      return parseFunding(raised, goal, currency)
    }
    if (this._fundingTask.status !== TaskStatus.COMPLETE) {
      return null
    }
    return this._fundingTask.value ?? null
  }

  private get state(): EventState {
    if (!this.funding && this._fundingTask.status === TaskStatus.PENDING) {
      return EventState.LOADING
    }
    return this.visibleFunding ? EventState.HAS_DATA : EventState.NO_DATA
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties)
    const state = this.state
    if (state === this.lastState) {
      return
    }
    this.lastState = state
    const detail: BasicStateEventDetail = { state }
    this.dispatchEvent(
      new CustomEvent(EventType.DONATION_METER_STATE, { detail, bubbles: true, composed: true })
    )
  }

  private format(amount: number, currency: string) {
    return formatAmount(amount, currency, this.locale)
  }

  private get locale() {
    return languageCode.get() || undefined
  }

  private renderBar(progress: number, percent: string) {
    return html`
      <div
        class="bar"
        role="progressbar"
        aria-label=${msg("Fundraiser progress")}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${Math.round(progress * 100)}
        aria-valuetext=${percent}
      >
        <div style="width: ${(progress * 100).toFixed(1)}%"></div>
      </div>
    `
  }

  private renderMeter(funding: Funding) {
    const ratio = funding.raised / funding.goal
    const progress = Math.min(Math.max(ratio, 0), 1)
    const percent = new Intl.NumberFormat(this.locale, { style: "percent" }).format(ratio)
    const raised = this.format(funding.raised, funding.currency)
    const goal = this.format(funding.goal, funding.currency)
    const missing = funding.goal - funding.raised

    return html`
      <div class="figures">
        <span class="raised">${raised}</span>
        <span class="goal">${msg(str`of ${goal}`)} · ${percent}</span>
      </div>
      ${this.renderBar(progress, percent)}
      ${missing >= 1 ? this.renderShortfall(this.format(missing, funding.currency)) : nothing}
    `
  }

  private renderShortfall(missing: string) {
    return html`<span class="shortfall">${msg(str`${missing} short`)}</span>`
  }

  /** The mocks' one-line summary: `{raised} raised of {goal} · {count} supporters · until {end_date}`. */
  private renderLine(funding: Funding) {
    const ratio = funding.raised / funding.goal
    const progress = Math.min(Math.max(ratio, 0), 1)
    const percent = new Intl.NumberFormat(this.locale, { style: "percent" }).format(ratio)
    const raised = this.format(funding.raised, funding.currency)
    const goal = this.format(funding.goal, funding.currency)
    const left = this.line === "long" ? msg(str`raised of ${goal}`) : msg(str`of ${goal}`)
    const day = formatDay(this.endDate, this.locale, this.line === "short" ? "short" : "long")
    const fmtCount = this.count ? new Intl.NumberFormat(this.locale).format(this.count) : null
    const parts = [
      fmtCount ? msg(str`${fmtCount} supporters`) : null,
      day ? msg(str`until ${day}`) : null,
    ].filter((part): part is string => Boolean(part))

    return html`
      <div class="figures row">
        <span><span class="raised">${raised}</span> ${left}</span>
        ${parts.length ? html`<span class="details">${parts.join(" · ")}</span>` : nothing}
      </div>
      ${this.renderBar(progress, percent)}
    `
  }

  // No figures beats wrong figures: the host keeps its static donation ask.
  override render() {
    const funding = this.visibleFunding
    if (!funding) {
      return nothing
    }
    return this.line ? this.renderLine(funding) : this.renderMeter(funding)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "donation-meter": DonationMeter
  }
}
