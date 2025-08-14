import { css, LitElement } from "lit"
import { html } from "lit-html"
import { customElement } from "lit/decorators.js"
import { SAFE_BLUE } from "../../utils/colors"
import "../icons/info"
import { Breakpoints } from "../../utils/breakpoints"

/**
 * @element info-button
 */
@customElement("info-button")
export class InfoButton extends LitElement {
  static override styles = css`
    .info-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${SAFE_BLUE};
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      width: 30px;
      height: 30px;
      padding: 5px;

      @media (min-width: ${Breakpoints.SM}px) {
        width: 40px;
        height: 40px;
        padding: 8px;
      }
    }
    button:hover {
      opacity: 0.8;
    }
  `

  override render() {
    return html`
      <button class="info-button">
        <info-icon .custom-styles="${{ fill: "white" }}"></info-icon>
      </button>
    `
  }
}
