import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import { Task } from "@lit/task"
import { languageCode } from "../../signals/app"
import type { Funding, NewsData } from "../../types/news-feed"
import { findFunding, parseFunding } from "../../utils/funding"

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
      background-color: #ff6e78;
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

  private format(amount: number, currency: string) {
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  private get locale() {
    return languageCode.get() || undefined
  }

  private renderMeter(funding: Funding | null) {
    if (!funding) {
      return nothing
    }

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
      ${missing >= 1 ? this.renderShortfall(this.format(missing, funding.currency)) : nothing}
    `
  }

  private renderShortfall(missing: string) {
    return html`<span class="shortfall">${msg(str`${missing} short`)}</span>`
  }

  override render() {
    if (this.funding) {
      const { raised, goal, currency } = this.funding
      return this.renderMeter(parseFunding(raised, goal, currency))
    }

    return this._fundingTask.render({
      // No figures beats wrong figures: the host keeps its static donation ask.
      pending: () => nothing,
      error: () => nothing,
      complete: (funding) => this.renderMeter(funding),
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "donation-meter": DonationMeter
  }
}
