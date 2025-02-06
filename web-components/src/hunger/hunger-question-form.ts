import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { Question, QuestionAnnotationAnswer } from "../types/robotoff"
import robotoff from "../api/robotoff"
import { nextQuestion } from "../signals/questions"
import { localized, msg } from "@lit/localize"

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@localized()
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

  @property({ type: Boolean, attribute: "show-message" })
  showMessage: boolean = false

  @state()
  private _first: boolean = true

  @state()
  private _showLastQuestionMessage: boolean = false

  private _annotateProduct = async (value: QuestionAnnotationAnswer) => {
    robotoff.annotate(this.question!.insight_id, value)
    if (!nextQuestion()) {
      this._showLastQuestionMessage = true
    }
  }

  private renderMessage() {
    if (this._showLastQuestionMessage) {
      return html`<div>${msg("Thank you for your assistance!")}</div>`
    } else if (!this.showMessage) {
      return nothing
    } else if (this._first) {
      this._first = false
      return html`<div>
        ${msg("Open Food Facts needs your help with this product.")}
      </div>`
    }

    return html`<div>
      ${msg("Thanks for your help! Can you assist with another question?")}
    </div>`
  }

  override render() {
    if (!this.question) {
      return html`<div>No question</div>`
    }

    return html`
      <div>
        ${this.renderMessage()}
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
          <button @click="${() => this._annotateProduct("1")}">Yes</button>
          <button @click="${() => this._annotateProduct("0")}">No</button>
          <button @click="${() => this._annotateProduct("-1")}">Skip</button>
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
