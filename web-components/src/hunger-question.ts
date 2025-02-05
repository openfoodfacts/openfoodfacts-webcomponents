import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { Product } from "./types"

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("hunger-question")
export class HungerQuestion extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `

  /**
   * The product to display.
   */
  @property({ type: Object, reflect: true })
  product?: Product

  @property({
    type: String,
  })
  question = "Question"

  override render() {
    return html`
      <div>
        <h2>${this.question}</h2>
        <img
          .src=${this.product?.imgUrl}
          alt=${this.product?.name}
          style="width: 200px;"
        />
        <div>
          <button>Yes</button>
          <button>No</button>
          <button>Skip</button>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hunger-question": HungerQuestion
  }
}
