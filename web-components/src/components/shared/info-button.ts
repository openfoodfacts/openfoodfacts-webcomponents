import { css, LitElement } from "lit"
import { html } from "lit-html"
import { customElement } from "lit/decorators.js"
import { SAFE_BLUE } from "../../utils/colors"
import "../icons/info"

/**
 * @element info-button
 */
@customElement("info-button")
export class InfoButton extends LitElement {
  static override styles = css`
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      background-color: ${SAFE_BLUE};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
    button:hover {
      opacity: 0.8;
    }
  `

  override render() {
    return html`
      <button>
        <info-icon .custom-styles="${{ fill: "white" }}"></info-icon>
      </button>
    `
  }
}
