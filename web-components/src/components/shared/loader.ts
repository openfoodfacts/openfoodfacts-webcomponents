import { localized, msg } from "@lit/localize"
import { html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("off-wc-loader")
@localized()
export class OffWcLoader extends LitElement {
  override render() {
    return html` <div>${msg("Loading...")}</div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "off-wc-loader": OffWcLoader
  }
}
