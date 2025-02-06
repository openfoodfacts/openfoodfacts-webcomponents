import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { Question } from "../types/robotoff"

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("hunger-question-form")
export class HungerQuestionForm extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `

  /**
   * The question to display.
   */
  @property({ type: Object, reflect: true })
  question?: Question

  override render() {
    if (!this.question) {
      return html`<div>No question</div>`
    }
    return html`
      <div>
        <h2>${this.question.question}</h2>
        ${this.question.source_image_url
          ? html`<img
              .src=${this.question?.source_image_url}
              alt="Product image"
              style="width: 200px;"
            />`
          : nothing}
        <div>
          <p>${this.question.value}</p>
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
    "hunger-question-form": HungerQuestionForm
  }
}
