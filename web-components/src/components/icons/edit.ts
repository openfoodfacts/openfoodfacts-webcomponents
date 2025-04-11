import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

/**
 * @element edit-icon
 */
@customElement("edit-icon")
export class EditIcon extends LitElement {
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
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edit-icon": EditIcon
  }
}
