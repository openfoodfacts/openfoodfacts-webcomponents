import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

/**
 * @element skip-icon
 */
@customElement("skip-icon")
export class SkipIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      width: 20px;
      height: 20px;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `

  override render() {
    return html`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "skip-icon": SkipIcon
  }
}
