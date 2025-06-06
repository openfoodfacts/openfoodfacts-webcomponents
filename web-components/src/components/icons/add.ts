import { localized, msg } from "@lit/localize"
import { LitElement, html } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("add-icon")
@localized()
export class AddIcon extends LitElement {
  /**
   * Color of the icon
   */
  @property({ type: String })
  color = "#FFFFFF"

  /**
   * Size of the icon
   */
  @property({ type: String })
  size = "20px"

  override render() {
    return html`
      <svg
        width=${this.size}
        height=${this.size}
        viewBox="0 0 20 20"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <title>${msg("Add")}</title>
        <g id="Add" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <path
            d="M10,0 C4.477,0 0,4.477 0,10 C0,15.523 4.477,20 10,20 C15.523,20 20,15.523 20,10 C20,4.477 15.523,0 10,0 Z M13,11 L11,11 L11,13 C11,13.552 10.552,14 10,14 L10,14 C9.448,14 9,13.552 9,13 L9,11 L7,11 C6.448,11 6,10.552 6,10 L6,10 C6,9.448 6.448,9 7,9 L9,9 L9,7 C9,6.448 9.448,6 10,6 L10,6 C10.552,6 11,6.448 11,7 L11,9 L13,9 C13.552,9 14,9.448 14,10 L14,10 C14,10.552 13.552,11 13,11 Z"
            id="Shape"
            fill=${this.color}
            fill-rule="nonzero"
          ></path>
        </g>
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "add-icon": AddIcon
  }
}
