import { css, LitElement } from "lit"
import { html } from "lit-html"
import { customElement, property } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import { SAFE_BLUE } from "../../utils/colors"
import "../icons/info"
import { Breakpoints } from "../../utils/breakpoints"

/**
 * @element info-button
 */
@customElement("info-button")
@localized()
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

  /** Accessible name for the information action. */
  @property({ type: String })
  label = ""

  override render() {
    return html`
      <button type="button" class="info-button" aria-label=${this.label || msg("More information")}>
        <info-icon .custom-styles="${{ fill: "white" }}"></info-icon>
      </button>
    `
  }
}
