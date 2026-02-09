import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import { getImageUrl, languageCode } from "../../signals/app"
import { classMap } from "lit/directives/class-map.js"
import { darkModeListener } from "../../utils/dark-mode-listener"

/**
 * Donation banner
 * @element donation-banner
 * It requires one of the following fonts for each list item to be loaded:
 * - "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif
 * - "Public Sans", Helvetica, Roboto, Arial, sans-serif
 * - "Segoe UI", Tahoma, Geneva, Verdana, sans-serif
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
   * The fundraiser year (next year)
   * @type {String}
   */
  @property({ type: String, reflect: true })
  currentYear: string = this.getDefaultYear()

  /**
   * Whether to apply dark mode styling (auto-detected from prefers-color-scheme)
   */
  isDarkMode = darkModeListener.darkMode
  private _darkModeCb = (isDark: boolean) => {
    this.isDarkMode = isDark
    this.requestUpdate()
  }

  override connectedCallback() {
    super.connectedCallback()
    darkModeListener.subscribe(this._darkModeCb)
  }

  override disconnectedCallback() {
    darkModeListener.unsubscribe(this._darkModeCb)
    super.disconnectedCallback()
  }

  getDefaultYear() {
    return (new Date().getFullYear() + 1).toString()
  }

  getLinkWithQueryParams(link: string) {
    const url = new URL(link)
    const params = new URLSearchParams(url.search)
    if (!params.has("utm_source")) params.set("utm_source", "off")
    if (!params.has("utm_medium")) params.set("utm_medium", "web")
    if (!params.has("utm_campaign")) params.set("utm_campaign", `donate-${this.currentYear}-a`)
    if (!params.has("utm_term")) params.set("utm_term", "en-text-button")
    url.search = params.toString()
    return url.toString()
  }

  get donateLink() {
    const locale = languageCode.get()
    const link =
      locale in this.links ? this.links[locale as keyof typeof this.links] : this.links.default
    return this.getLinkWithQueryParams(link)
  }

  static override styles = css`
    .donation-banner,
    .donation-banner-footer {
      position: relative;
      display: flex;
      flex-wrap: wrap; /*Using Flex wrap for arrangement*/
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

    /*Put accommodations for tablet and phone together for better readability and maintenance*/

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
  `
  override render() {
    const rootClasses = { "dark-mode": this.isDarkMode }
    return html`<section class=${classMap(rootClasses)}>
      <div class="donation-banner-footer row">
        <div class="donation-banner-footer__left-aside">
          <div class="donation-banner-footer__hook-section">
            <p>
              ${msg("Help us inform millions of consumers around the world about what they eat")}
            </p>
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
                ${msg(str`Please give to our ${this.currentYear} Fundraiser`)}
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
          </div>
          <div class="donation-banner-footer__actions-section">
            <div class="donation-banner-footer__actions-section__financial">
              <p style="margin: 0px; line-height: 1.6">
                ${msg(
                  "Each donation counts! We appreciate your support in bringing further food transparency in the world."
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
}

declare global {
  interface HTMLElementTagNameMap {
    "donation-banner": DonationBanner
  }
}
