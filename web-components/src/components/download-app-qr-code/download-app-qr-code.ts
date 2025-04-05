import { LitElement, html } from "lit"
import { customElement, property } from "lit/decorators.js"
import { getImageUrl } from "../../signals/app"
import { localized, msg } from "@lit/localize"
import { styleMap } from "lit-html/directives/style-map.js"

@customElement("download-app-qr-code")
@localized()
export class DownloadAppQrCode extends LitElement {
  @property({ type: Object, attribute: "style-options" })
  styleOptions = {
    width: "180px",
    height: "180px",
  }

  override render() {
    return html`
      <img
        style=${styleMap(this.styleOptions)}
        src=${getImageUrl("qrcode_en.svg")}
        alt=${msg("Download the OFF app with this QR code")}
        title=${msg("Download the OFF app with this QR code")}
      />
    `
  }
}
