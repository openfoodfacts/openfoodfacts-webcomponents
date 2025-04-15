import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

/**
 * @element check-icon
 */
@customElement("check-icon")
export class CheckIcon extends LitElement {
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
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "check-icon": CheckIcon
  }
}
