import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("reduce-icon")
export class ReduceIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      width: 24px;
      height: 24px;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `

  override render() {
    return html`
      <svg
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.9992 21L14.9492 14.95"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6 10H14"
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "reduce-icon": ReduceIcon
  }
}
