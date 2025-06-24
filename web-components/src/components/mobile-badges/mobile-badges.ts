import { LitElement, html, css, nothing } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import { getImageUrl, languageCode } from "../../signals/app"
import { classMap } from "lit/directives/class-map.js"

export type Badge = {
  href: string
  src: string
  alt: string
  id: string
  hide: boolean
  errorHandler?: (event: Event) => void
}

/**
 * Mobile Badges
 * @element mobile-badges
 * A web component that displays mobile app badges for downloading the Open Food Facts app.
 * It includes badges for Google Play, F-Droid, APK, and the Apple App Store.
 */
@customElement("mobile-badges")
@localized()
export class MobileBadges extends LitElement {
  /**
   * Styles for the component.
   */
  static override styles = [
    css`
      :host {
        display: block;
      }
      .dark-mode {
        background-color: #2d2724;
        color: #f9f7f5;
      }
      #footer_scan {
        color: #000;
      }
      .dark-mode #footer_scan {
        color: #f9f7f5;
      }
      .everyday {
        background-color: #0064c8;
        border-inline: 5px solid #0064c8;
        color: #fff;
      }
      .dark-mode .everyday {
        background-color: #0050a0;
        border-inline: 5px solid #0050a0;
        color: #fff;
      }
      .foods {
        background-color: #ff8714;
        border-inline: 5px solid #ff8714;
        color: #fff;
      }
      .dark-mode .foods {
        background-color: #cc6c10;
        border-inline: 5px solid #cc6c10;
        color: #fff;
      }
      #install_the_app_block {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 2rem;
      }
      #footer_install_the_app {
        font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
        font-weight: 550;
        font-size: 26px;
        line-height: 30px;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      #footer_scan {
        font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
        font-style: normal;
        font-weight: 550;
        font-size: 22px;
        line-height: 28px;
        display: flex;
        align-items: center;
        text-align: center;
        color: #000;
        max-width: 420px;
      }
      @media (max-width: 480px) {
        #footer_install_the_app {
          font-size: 20px;
          line-height: 24px;
        }
        #footer_scan {
          font-size: 18px;
          line-height: 22px;
        }
      }
      @media (min-width: 768px) {
        #footer_install_the_app {
          font-size: 28px;
          line-height: 32px;
        }
        #footer_scan {
          font-size: 24px;
          line-height: 30px;
        }
      }
      @media (min-width: 1024px) {
        #footer_install_the_app {
          font-size: 30px;
          line-height: 34px;
        }
        #footer_scan {
          font-size: 26px;
          line-height: 32px;
        }
      }
      .everyday {
        transform: rotate(2.5deg);
        background-color: #0064c8;
        border-inline: 5px solid #0064c8;
        line-height: 130%;
        font-weight: 550;
        color: #fff;
        border-radius: 5px;
        text-transform: uppercase;
        display: inline-block;
      }
      .foods {
        transform: rotate(-3deg);
        background-color: #ff8714;
        border-inline: 5px solid #ff8714;
        line-height: 130%;
        font-weight: 550;
        color: #fff;
        border-radius: 5px;
        text-transform: uppercase;
        display: inline-block;
      }
      .no-text-decoration {
        text-decoration: none;
      }
      .badge-container {
        display: grid;
        gap: 0.2rem; /* Reduced horizontal gap */
        grid-template-columns: repeat(2, 1fr);
      }
      @media (min-width: 768px) {
        .badge-container {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      .responsive-container {
        flex-direction: column;
        text-align: center;
      }
      @media (min-width: 768px) {
        .badge-container {
          display: flex;
          justify-content: center;
        }
      }
      @media (max-width: 480px) {
        .badge-container {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        .responsive-container {
          flex-direction: column;
          text-align: center;
        }
        .responsive-image {
          margin-bottom: 1rem;
        }
        .responsive-text {
          margin-top: 0.5rem;
        }
      }
      #fdroid_badge {
        transform: scale(1.1);
        height: 50px;
        margin-top: -4px;
      }
      #playstore_badge {
        height: 45px;
      }

      .logo-container {
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 720px;
        gap: 2rem;
        flex-wrap: wrap;
      }
    `,
  ]

  /**
   * Controls visibility of Google Play Store badge
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "hide-play-store" })
  hidePlayStore = false

  /**
   * Controls visibility of F-Droid badge
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "hide-f-droid" })
  hideFDroid = false

  /**
   * Controls visibility of APK download badge
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "hide-apk" })
  hideApk = false

  /**
   * Controls visibility of App Store badge
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "hide-app-store" })
  hideAppStore = false

  /**
   * Controls visibility of App Store badge
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "hide-image" })
  hideImage = false

  /**
   * Whether to apply dark mode styling
   */
  @property({ type: Boolean })
  darkMode = false

  /**
   * Link to the F-Droid app page.
   */
  @state()
  fDroidAppLink = "https://f-droid.org/packages/openfoodfacts.github.scrachx.openfood"

  /**
   * Generates the URL suffix for Android app links.
   * @param language - The language code.
   * @param campaign - The campaign identifier.
   * @returns The URL suffix with UTM parameters.
   */
  private getAndroidUrlSuffix(language: string, campaign: string): string {
    return `?utm_source=off&utf_medium=web&utm_campaign=${campaign}_${language}`
  }

  /**
   * Generates the Google Play Store link for the app.
   * @param language - The language code.
   * @returns The Google Play Store link.
   */
  getAndroidAppLink(language: string): string {
    const baseURI = `https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=${language}`
    return `${baseURI}${this.getAndroidUrlSuffix(language, "install_the_app_android_footer")}`
  }

  /**
   * Generates the APK download link for the app.
   * @param language - The language code.
   * @returns The APK download link.
   */
  getAndroidApkAppLink(language: string): string {
    const baseURI = "https://github.com/openfoodfacts/smooth-app/releases/latest"
    return `${baseURI}${this.getAndroidUrlSuffix(language, "install_the_app_apk_footer")}`
  }

  /**
   * Generates the path to the Google Play Store badge icon.
   * @param language - The language code.
   * @returns The path to the badge icon.
   */
  getAndroidAppIconPath(language: string): string {
    return `https://play.google.com/intl/en_us/badges/static/images/badges/${language}_badge_web_generic.png`
  }

  /**
   * Generates the path to the F-Droid badge icon.
   * @param language - The language code.
   * @returns The path to the badge icon.
   */
  getFDroidAppIconPath(language: string): string {
    return `https://fdroid.gitlab.io/artwork/badge/get-it-on-${language}.png`
  }

  /**
   * Generates the path to the Apple App Store badge icon.
   * Note: This code does not handle the US locale specifically.
   * @param language - The language code.
   * @returns The path to the badge icon.
   */
  getIosAppIconPath(language: string): string {
    if (language === "en") {
      return "appstore/black/appstore_UK.svg"
    }
    return `appstore/black/appstore_${language.toLocaleUpperCase()}.svg`
  }

  /**
   * Generates the Apple App Store link for the app.
   * @param language - The language code.
   * @returns The Apple App Store link.
   */
  getIosAppLink(language: string): string {
    const baseURI =
      "https://apps.apple.com/app/open-food-facts/id588797948?utm_source=off&utf_medium=web"
    return `${baseURI}&utm_campaign=install_the_app_ios_footer_${language}`
  }

  /**
   * Generates the HTML for a badge link.
   * @param href - The URL for the badge link.
   * @param src - The source of the badge image.
   * @param alt - The alt text for the badge image.
   * @param id - The id for the badge image.
   * @param errorHandler - The error handler for the image.
   * @returns The HTML template for the badge link.
   */
  private generateBadgeLink(
    href: string,
    src: string,
    alt: string,
    id: string,
    errorHandler?: (e: Event) => void
  ) {
    return html`
      <a class="no-text-decoration" href="${href}">
        <img
          id="${id}"
          src="${src}"
          alt="${alt}"
          loading="lazy"
          height="40"
          width="120"
          @error=${errorHandler}
        />
      </a>
    `
  }

  /**
   * Filters the badges based on the hide properties.
   * @returns The filtered list of badges.
   **/
  getFilteredBadges(): Badge[] {
    const language = languageCode.get()
    const badges: Badge[] = [
      {
        href: this.getAndroidAppLink(language),
        src: this.getAndroidAppIconPath(language),
        alt: msg("Get It On Google Play"),
        id: "playstore_badge",
        hide: this.hidePlayStore,
        errorHandler: (e: Event) => {
          const target = e.target as HTMLImageElement
          target.src = this.getAndroidAppIconPath("en")
        },
      },
      {
        href: this.fDroidAppLink,
        src: this.getFDroidAppIconPath(language),
        alt: msg("Available on F-Droid"),
        id: "fdroid_badge",
        hide: this.hideFDroid,
        errorHandler: (e: Event) => {
          const target = e.target as HTMLImageElement
          target.src = this.getFDroidAppIconPath("en")
        },
      },
      {
        href: this.getAndroidApkAppLink(language),
        src: getImageUrl("download-apk_en.svg"),
        alt: msg("Android APK"),
        id: "apk_badge",
        hide: this.hideApk,
      },
      {
        href: this.getIosAppLink(language),
        src: getImageUrl(this.getIosAppIconPath(language)),
        alt: msg("Download on the App Store"),
        id: "appstore_badge",
        hide: this.hideAppStore,
        errorHandler: (e: Event) => {
          const target = e.target as HTMLImageElement
          target.src = getImageUrl(this.getIosAppIconPath("en"))
        },
      },
    ]

    const filteredBadges = badges.filter((badge) => badge.hide == false)
    return filteredBadges
  }

  /**
   * Renders the image if hideImage is false
   * @returns The image HTML or nothing if hideImage is true.
   **/
  renderImage() {
    if (this.hideImage) {
      return nothing
    }
    return html`
      <div class="logo-container">
        <img
          class="responsive-image"
          src="${getImageUrl("app-icon-in-the-clouds.svg")}"
          alt="The Open Food Facts logo in the cloud"
          style="height:120px"
        />
        <div id="footer_scan" style="display:block">
          <div id="footer_install_the_app">${msg("Install the app!")}</div>
          <!-- TODO find fix to add text between span for translations ex for fr : "Scannez vos <span class="foods">aliments</span> de votre <span class="everyday">quotidien</span>" -->
          ${msg(
            html`Scan your <span class="everyday">everyday</span> <span class="foods">foods</span>`
          )}
        </div>
      </div>
    `
  }

  /**
   * Renders the badges if there are any filtered badges
   * @returns The badges HTML or nothing if there are no filtered badges.
   **/
  renderBadges() {
    const filteredBadges = this.getFilteredBadges()

    return html` ${filteredBadges.length > 0
      ? html`
          <div class="badge-container ">
            ${filteredBadges.map((badge) =>
              this.generateBadgeLink(badge.href, badge.src, badge.alt, badge.id, badge.errorHandler)
            )}
          </div>
        `
      : ""}`
  }

  override render() {
    const rootClasses = { "dark-mode": this.darkMode }
    return html`
      <div class=${classMap(rootClasses)} id="install_the_app_block">
        ${this.renderImage()} ${this.renderBadges()}
      </div>
    `
  }
}
