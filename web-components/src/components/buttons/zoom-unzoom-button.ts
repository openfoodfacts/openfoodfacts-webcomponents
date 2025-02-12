import { localized, msg } from "@lit/localize"
import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { SAFE_LIGHT_GREY } from "../../utils/colors"

/**
 * A button to zoom or unzoom a page
 * @element zoom-unzoom-button
 * @fires click - Fired when the button is clicked
 */
@customElement("zoom-unzoom-button")
@localized()
export class ZoomUnzoomButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border: none;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      cursor: pointer;
    }
    button:hover {
      background-color: ${SAFE_LIGHT_GREY};
    }
  `

  @property({ type: Boolean })
  zoomed = false

  override render() {
    return html`
      <button title=${this.zoomed ? msg("Unzoom") : msg("Zoom")}>
        ${this.zoomed ? html`<unzoom-icon></unzoom-icon>` : html`<zoom-icon></zoom-icon>`}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zoom-unzoom-button": ZoomUnzoomButton
  }
}
