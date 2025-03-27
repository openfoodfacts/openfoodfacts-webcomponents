import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import { getLocale } from "../../localization"
import { getImageUrl } from "../../signals/app"

@customElement("mobile-badges")
@localized()
export class MobileBadges extends LitElement {
  static override styles = css`
    .block_light {
      color: #000000;
    }
    .small-12 {
      width: 100%;
    }
    .row {
      margin: 0 auto;
      max-width: 91.4285714286rem;
      width: 100%;
    }
    .flex-grid {
      display: flex;
    }
    .v-space-short {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .v-align-center {
      align-items: center;
    }
    .direction-row {
      flex-direction: row;
    }
    .h-space-tiny {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }
    .cell {
      flex: 1;
    }
    .small-100 {
      width: 100%;
    }
    .medium-100 {
      @media (min-width: 768px) {
        width: 100%;
      }
    }
    .large-50 {
      @media (min-width: 1024px) {
        width: 50%;
      }
    }
    .small-50 {
      width: 50%;
    }
    .medium-25 {
      @media (min-width: 768px) {
        width: 25%;
      }
    }
    .large-25 {
      @media (min-width: 1024px) {
        width: 25%;
      }
    }
    .h-space-short {
      margin-left: 1rem;
      margin-right: 1rem;
    }
    .full-width {
      width: 100%;
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
    #everyday {
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
    #foods {
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
    }
    @media (max-width: 767px) {
      .badge-container {
        grid-template-columns: repeat(2, 1fr);
      }
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
    .responsive-image {
      height: auto;
      max-width: 100%;
      margin: 0 auto;
    }
    .responsive-text {
      margin-top: 1rem;
    }
    @media (min-width: 768px) {
      .responsive-container {
        flex-direction: row;
        text-align: left;
      }
      .responsive-text {
        margin-top: 0;
      }
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
      transform: scale(1.3);
      margin-right: 1px;
      height: 42px;
    }
  `

  @property({ type: String })
  fDroidAppLink = "https://f-droid.org/packages/openfoodfacts.github.scrachx.openfood"

  getAndroidAppLink(language: string): string {
    const baseURI = `https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=${language}`
    return `${baseURI}&utm_source=off&utf_medium=web&utm_campaign=install_the_app_android_footer_${language}`
  }

  getAndroidAppIconPath(language: string): string {
    return `/playstore/img/${language}_get.svg`
  }

  getFDroidAppIconPath(language: string): string {
    return `/f-droid/get-it-on-${language}.png`
  }

  getAndroidApkAppLink(language: string): string {
    const baseURI = "https://github.com/openfoodfacts/smooth-app/releases/latest"
    return `${baseURI}?utm_source=off&utf_medium=web&utm_campaign=install_the_app_apk_footer_${language}`
  }

  getIosAppIconPath(language: string): string {
    console.log("language", language)
    if (language === "en") {
      return "/appstore/black/appstore_UK.svg"
    }
    return `/appstore/black/appstore_${language.toLocaleUpperCase()}.svg`
  }

  getIosAppLink(language: string): string {
    const baseURI =
      "https://apps.apple.com/app/open-food-facts/id588797948?utm_source=off&utf_medium=web"
    return `${baseURI}&utm_campaign=install_the_app_ios_footer_${language}`
  }

  override render() {
    const language = getLocale()
    return html`
      <div class="block_light bg-white" id="install_the_app_block ">
        <div class="row">
          <div class="small-12 flex-grid v-space-short v-align-center direction-row h-space-tiny">
            <div
              class="cell small-100 medium-100 large-50 flex-grid v-align-center direction-row responsive-container"
            >
              <img
                class="cell small-50 v-align-center responsive-image"
                src="${getImageUrl("app-icon-in-the-clouds.svg")}"
                alt="The Open Food Facts logo in the cloud"
                style="height:120px"
              />
              <div
                class="cell small-50 v-align-center responsive-text"
                id="footer_scan"
                style="display:block"
              >
                <div id="footer_install_the_app">${msg("Install the app!")}</div>
                ${msg(
                  html`Scan your <span id="everyday">everyday</span> <span id="foods">foods</span>`
                )}
              </div>
            </div>
            <div class="cell small-100 medium-100 large-50 flex-grid v-align-center direction-row">
              <div class="small-12 medium-12 large-12 v-space-normal badge-container">
                <!-- android_app_link - https://play.google.com/store/apps/details?id=org.openbeautyfacts.scanner&hl=en -->
                <a class="no-text-decoration" href="${this.getAndroidAppLink(language)}">
                  <img
                    id="playstore_badge"
                    src="${getImageUrl(this.getAndroidAppIconPath(language))}"
                    alt="${msg("Get It On Google Play")}"
                    loading="lazy"
                    height="40"
                    width="120"
                    @error=${(e: Event) => {
                      const target = e.target as HTMLImageElement
                      target.src = getImageUrl(this.getAndroidAppIconPath("en"))
                    }}
                  />
                </a>
                <a class="no-text-decoration" href="${this.fDroidAppLink}">
                  <img
                    id="fdroid_badge"
                    src="${getImageUrl(this.getFDroidAppIconPath(language))}"
                    alt="${msg("Available on F-Droid")}"
                    loading="lazy"
                    height="40"
                    width="120"
                    @error=${(e: Event) => {
                      const target = e.target as HTMLImageElement
                      target.src = getImageUrl(this.getFDroidAppIconPath("en"))
                    }}
                  />
                </a>
                <!-- android_apk_app_link - https://world.openfoodfacts.org/images/apps/off.apk -->
                <a class="no-text-decoration" href="${this.getAndroidApkAppLink(language)}">
                  <img
                    src="${getImageUrl("download-apk_en.svg")}"
                    alt="${msg("Android APK")}"
                    loading="lazy"
                    height="40"
                    width="120"
                  />
                </a>
                <!-- msgid "https://apps.apple.com/app/open-beauty-facts/id1122926380" -->
                <a class="no-text-decoration" href="${this.getIosAppLink(language)}">
                  <img
                    src="${getImageUrl(this.getIosAppIconPath(language))}"
                    alt="${msg("Download on the App Store")}"
                    loading="lazy"
                    height="40"
                    width="120"
                    @error=${(e: Event) => {
                      const target = e.target as HTMLImageElement
                      target.src = getImageUrl(this.getIosAppIconPath("en"))
                    }}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
