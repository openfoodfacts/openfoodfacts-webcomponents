import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import { getLocale } from "../../localization"
import { getImageUrl } from "../../signals/app"

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
   * The current year
   * @type {String}
   */
  @property({ type: String, reflect: true })
  currentYear: string = this.getDefaultYear()

  getDefaultYear() {
    return new Date().getFullYear().toString()
  }

  getLinkWithQueryParams(link: string) {
    const url = new URL(link)
    const params = new URLSearchParams(url.search)
    if (!params.has("utm_source")) params.set("utm_source", "off")
    if (!params.has("utm_medium")) params.set("utm_medium", "web")
    if (!params.has("utm_campaign")) params.set("utm_campaign", "donate-2024-a")
    if (!params.has("utm_term")) params.set("utm_term", "en-text-button")
    url.search = params.toString()
    return url.toString()
  }

  get donateLink() {
    const locale = getLocale()
    const link =
      locale in this.links ? this.links[locale as keyof typeof this.links] : this.links.default
    return this.getLinkWithQueryParams(link)
  }

  static override styles = css`
    .donation-banner,
    .donation-banner-footer {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 0;
      border: 10px solid #ff6e78;
      width: 100%;
      background-color: white;
      box-sizing: border-box;
    }
    @media (max-width: 732px) {
      .donation-banner,
      .donation-banner-footer {
        flex-direction: column;
        padding: 20px 10px;
      }
    }
    .group-image {
      height: auto;
      max-width: 100%;
      display: inline-block;
      vertical-align: middle;
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
      padding: 10px;
      margin: 10px;
      border-radius: 10px;
      z-index: 1;
    }
    .donation-banner__hook-section p,
    .donation-banner-footer__hook-section p {
      font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
      font-size: 25px;
      font-weight: 700;
      line-height: 35px;
      text-transform: uppercase;
      margin: 0;
    }
    @media (max-width: 732px) {
      .donation-banner__hook-section p,
      .donation-banner-footer__hook-section p {
        font-size: 15px;
        line-height: 20px;
      }
    }
    .donation-banner__left-aside,
    .donation-banner-footer__left-aside {
      width: 60%;
      margin: 0 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .donation-banner__left-aside img,
    .donation-banner-footer__left-aside img {
      transform: translatey(-15px);
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
      margin: 0.2rem 0rem 0.5rem;
      font-weight: 500;
    }
    .donation-banner__main-div-wrapper {
      color: black;
    }
    @media (max-width: 732px) {
      .donation-banner__main-div-wrapper {
        margin-top: -25px;
      }
    }
    .donation-banner__main-div {
      font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
    }
    .donation-banner__main-section,
    .donation-banner-footer__main-section {
      display: flex;
      align-items: center;
    }
    .donation-banner__actions-section,
    .donation-banner-footer__actions-section {
      display: flex;
      justify-content: space-around;
      gap: 15px;
      padding: 0 10px;
    }
    @media (max-width: 732px) {
      .donation-banner__actions-section,
      .donation-banner-footer__actions-section {
        flex-direction: column;
        align-items: center;
        padding: 20px 10px;
      }
    }
    .donation-banner__actions-section__financial,
    .donation-banner-footer__actions-section__financial {
      width: 50%;
    }
    @media (max-width: 732px) {
      .donation-banner__actions-section__financial,
      .donation-banner-footer__actions-section__financial {
        width: 90%;
      }
    }
    .donation-banner__actions-section__financial p,
    .donation-banner-footer__actions-section__financial p {
      font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
      font-size: 15px;
      color: #008c8c;
      font-weight: bolder;
    }
    .donation-banner__actions-section__donate-button,
    .donation-banner-footer__actions-section__donate-button {
      width: 40%;
    }
    .donation-banner__actions-section__donate-button a button,
    .donation-banner-footer__actions-section__donate-button a button {
      background-color: #ff6e78;
      border-radius: 30px;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      font-size: 20px;
      font-weight: 900;
      padding: 1.1428571429rem 2.2857142857rem 1.2142857143rem;
      color: white;
      border: none;
      cursor: pointer;
    }
    @media (max-width: 837px) {
      .donation-banner-footer__actions-section__donate-button a button {
        padding: 1rem 2rem 1rem;
        font-size: 16px;
      }
    }
    @media (min-width: 733px) and (max-width: 837px) {
      .donation-banner-footer__actions-section__donate-button a button {
        padding: 1rem 2rem 1rem;
        font-size: 16px;
        margin-left: -15px;
      }
    }
    .donation-banner__actions-section__donate-button a button:hover,
    .donation-banner-footer__actions-section__donate-button a button:hover {
      background-color: rgba(255, 110, 120, 0.8);
    }
    .unordered-list {
      margin-left: 15.4px;
      margin-bottom: 20px;
      margin-top: 0;
      padding: 1px;
      line-height: 1.6;
      font-size: 14px;
      padding-right: 10px;
    }
    .unordered-list li p {
      margin: 0;
    }
  `

  override render() {
    return html`<section class="donation-banner-footer row">
      <div class="donation-banner-footer__left-aside">
        <div class="donation-banner-footer__hook-section">
          <p>${msg("Help us inform millions of consumers around the world about what they eat")}</p>
        </div>
        <img
          class="group-image"
          src="${getImageUrl("donation-banner-group-photo.png")}"
          alt="${msg(str`group photo donation ${this.currentYear}`)}"
        />
      </div>
      <div style="donation-banner__main-div-wrapper">
        <div class="donation-banner__main-div-wrapper">
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
            <li>
              ${msg("keeping our database open & available to all,")}
              <ul>
                <li>
                  ${msg("technical infrastructure (website/mobile app) & a small permanent team")}
                </li>
              </ul>
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
    </section>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "donation-banner": DonationBanner
  }
}
