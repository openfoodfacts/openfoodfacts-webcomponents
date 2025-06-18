import { LitElement, html, css, nothing } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import { getLocale } from "../../localization"
import { getImageUrl } from "../../signals/app"

export type Badge = {
  href: string
  src: string
  alt: string
  id: string
  hide: boolean
  errorHandler?: (event: Event) => void
}

@customElement("mobile-badges")
@localized()
export class MobileBadges extends LitElement {
  static override styles = css`
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
      color: var(--badge-text-color, #000); /* ← color controlled via CSS variable */
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
      color: var(--badge-text-color, #000); /* ← color controlled via CSS variable */
      max-width: 420px;
    }

    /* Responsive styles */
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
      gap: 0.2rem;
      grid-template-columns: repeat(2, 1fr);
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
    }

    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 720px;
      gap: 2rem;
      flex-wrap: wrap;
      flex-direction: column;
      text-align: center;
    }

    #fdroid_badge {
      transform: scale(1.1);
      height: 50px;
      margin-top: -4px;
    }

    #playstore_badge {
      height: 45px;
    }
  `

  @property({ type: Boolean, attribute: "hide-play-store" }) hidePlayStore = false
  @property({ type: Boolean, attribute: "hide-f-droid" }) hideFDroid = false
  @property({ type: Boolean, attribute: "hide-apk" }) hideApk = false
  @property({ type: Boolean, attribute: "hide-app-store" }) hideAppStore = false
  @property({ type: Boolean, attribute: "hide-image" }) hideImage = false

  // ✅ NEW: Add color property to allow passing text color from outside (like Svelte)
  @property({ type: String }) color: string = "#000"

  @state()
  fDroidAppLink = "https://f-droid.org/packages/openfoodfacts.github.scrachx.openfood"

  private getAndroidUrlSuffix(language: string, campaign: string): string {
    return `?utm_source=off&utf_medium=web&utm_campaign=${campaign}_${language}`
  }

  getAndroidAppLink(language: string): string {
    const baseURI = `https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=${language}`
    return `${baseURI}${this.getAndroidUrlSuffix(language, "install_the_app_android_footer")}`
  }

  getAndroidApkAppLink(language: string): string {
    const baseURI = "https://github.com/openfoodfacts/smooth-app/releases/latest"
    return `${baseURI}${this.getAndroidUrlSuffix(language, "install_the_app_apk_footer")}`
  }

  getAndroidAppIconPath(language: string): string {
    return `https://play.google.com/intl/en_us/badges/static/images/badges/${language}_badge_web_generic.png`
  }

  getFDroidAppIconPath(language: string): string {
    return `https://fdroid.gitlab.io/artwork/badge/get-it-on-${language}.png`
  }

  getIosAppIconPath(language: string): string {
    if (language === "en") {
      return "appstore/black/appstore_UK.svg"
    }
    return `appstore/black/appstore_${language.toLocaleUpperCase()}.svg`
  }

  getIosAppLink(language: string): string {
    const baseURI =
      "https://apps.apple.com/app/open-food-facts/id588797948?utm_source=off&utf_medium=web"
    return `${baseURI}&utm_campaign=install_the_app_ios_footer_${language}`
  }

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

  getFilteredBadges(): Badge[] {
    const language = getLocale()
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
    return badges.filter((badge) => !badge.hide)
  }

  renderImage() {
    if (this.hideImage) return nothing

    return html`
      <div class="logo-container" style="--badge-text-color: ${this.color};"> 
        <!-- ✅ Set color dynamically using CSS variable -->
        <img
          class="responsive-image"
          src="${getImageUrl("app-icon-in-the-clouds.svg")}"
          alt="The Open Food Facts logo in the cloud"
          style="height:120px"
        />
        <div id="footer_scan" style="display:block">
          <div id="footer_install_the_app">${msg("Install the app!")}</div>
          ${msg(html`Scan your <span class="everyday">everyday</span> <span class="foods">foods</span>`)}
        </div>
      </div>
    `
  }

  renderBadges() {
    const filteredBadges = this.getFilteredBadges()
    return html`
      ${filteredBadges.length > 0
        ? html`
            <div class="badge-container">
              ${filteredBadges.map((badge) =>
                this.generateBadgeLink(badge.href, badge.src, badge.alt, badge.id, badge.errorHandler)
              )}
            </div>
          `
        : ""}
    `
  }

  override render() {
    return html`
      <div id="install_the_app_block">
        ${this.renderImage()} ${this.renderBadges()}
      </div>
    `
  }
}
