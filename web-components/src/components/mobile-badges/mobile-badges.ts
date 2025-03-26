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
  `

  @property({ type: String })
  iosAppLink = "https://apps.apple.com/app/open-beauty-facts/id1122926380"

  @property({ type: String })
  androidAppLink = "https://play.google.com/store/apps/details?id=org.openbeautyfacts.scanner&hl=en"

  @property({ type: String })
  androidApkAppLink = "https://world.openfoodfacts.org/images/apps/off.apk"

  @property({ type: String })
  iosAppIconUrl = "https://world.openfoodfacts.org/images/misc/appstore/black/appstore_US.svg"

  @property({ type: String })
  androidAppIconUrl = "/images/misc/playstore/img/en_get.svg"

  @property({ type: String })
  androidApkAppIconUrl = "/images/misc/android-apk.svg"

  override render() {
    const language = getLocale()
    return html`
      <div class="block_light bg-white" id="install_the_app_block">
        <div class="row">
          <div class="small-12 flex-grid v-space-short v-align-center direction-row h-space-tiny">
            <div class="cell small-100 medium-100 large-50 flex-grid v-align-center direction-row">
              <img
                class="cell small-50 v-align-center"
                src="${getImageUrl("app-icon-in-the-clouds.svg")}"
                alt="The Open Food Facts logo in the cloud"
                style="height:120px"
              />
              <div class="cell small-50 v-align-center" id="footer_scan" style="display:block">
                <div id="footer_install_the_app">${msg("Install the app!")}</div>
                ${msg(
                  html`Scan your <span id="everyday">everyday</span> <span id="foods">foods</span>`
                )}
              </div>
            </div>
            <div class="cell small-100 medium-100 large-50 flex-grid v-align-center direction-row">
              <!-- msgid "https://apps.apple.com/app/open-beauty-facts/id1122926380" -->
              <a
                class="cell small-50 medium-25 large-25 h-space-short v-align-center"
                href="${this.iosAppLink}&utm_campaign=install_the_app_ios_footer_${language}"
              >
                <img
                  src="${this.iosAppIconUrl}"
                  alt="${msg("Download on the App Store")}"
                  loading="lazy"
                  class="full-width"
                />
              </a>
              <!-- android_app_link - https://play.google.com/store/apps/details?id=org.openbeautyfacts.scanner&hl=en -->
              <a
                class="cell small-50 medium-25 large-25 h-space-short v-align-center"
                href="${this
                  .androidAppLink}&utm_campaign=install_the_app_android_footer_${language}"
              >
                <img
                  src="https://static.openfoodfacts.org${this.androidAppIconUrl}"
                  alt="${msg("Get It On Google Play")}"
                  loading="lazy"
                  class="full-width"
                />
              </a>
              <!-- android_apk_app_link - https://world.openfoodfacts.org/images/apps/off.apk -->
              <a
                class="cell small-50 medium-25 large-25 h-space-short v-align-center"
                href="${this
                  .androidApkAppLink}?utm_source=off&utf_medium=web&utm_campaign=install_the_app_apk_footer_${language}"
              >
                <img
                  src="https://static.openfoodfacts.org${this.androidApkAppIconUrl}"
                  alt="${msg("Android APK")}"
                  loading="lazy"
                  class="full-width"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
