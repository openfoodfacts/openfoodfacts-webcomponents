import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("loading-spin")
export class LoadingSpin extends LitElement {
  @property({ type: String }) size: string = "24px"
  @property({ type: String }) color: string = "currentColor"

  static override styles = css`
    :host {
      display: inline-flex;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `

  override render() {
    return html`
      <svg
        width=${this.size}
        height=${this.size}
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        class="spinner"
      >
        <g fill=${this.color} fill-rule="evenodd" clip-rule="evenodd">
          <path
            d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"
            opacity=".2"
          />

          <path
            d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z"
          />
        </g>
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "loading-spin": LoadingSpin
  }
}
