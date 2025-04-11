import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

/**
 * @element cross-icon
 */
@customElement("cross-icon")
export class CrossIcon extends LitElement {
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
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cross-icon": CrossIcon
  }
}
