import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { Question } from "../types/robotoff"
import robotoff from "../api/robotoff"
import { nextQuestion } from "../signals/questions"
import {localized, msg} from "@lit/localize";

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
  private first?: boolean = true

  private _annotateProduct = async (value: string) => {
    robotoff.annotate(this.question!.insight_id, value)
    nextQuestion()
  }

  private renderMessage() {
    if (!this.showMessage) {
      return nothing
    } else if (this.first) {
      this.first = false
      return html`<div>${msg("Open foods facts need your help for this product")}<div>`
    }

    return html`<div>${msg("Thanks for your help, can you ")}</div>`

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
          <button @click="${this._annotateProduct" data-value="1">Yes</button>
          <button @click="${this._annotateProduct}" data-value="0">No</button>
          <button
            @click="${this._annotateProduct}"
            data-value="-1"
          >
            Skip
          </button>
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
