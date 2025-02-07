import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  currentQuestionIndex,
  fetchQuestionsByProductCode,
  nextQuestion,
  numberOfQuestions,
  isQuestionsFinished,
  questions,
} from "../signals/questions"
import { Task } from "@lit/task"
import { msg } from "@lit/localize"

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
    }
  `

  @property({ attribute: "product-id" }) productId: string = ""

  @state()
  private _first: boolean = true

  @property({ type: Boolean, attribute: "show-message" })
  showMessage: boolean = false

  private _questionsTask = new Task(this, {
    task: async ([productId], {}) => {
      if (!productId) {
        return []
      }
      await fetchQuestionsByProductCode(productId)
      return questions.get()
    },
    args: () => [this.productId],
  })

  private onQuestionAnswered = () => {
    nextQuestion()
    this.requestUpdate()
  }

  private renderMessage() {
    if (isQuestionsFinished.get()) {
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
    return this._questionsTask.render({
      pending: () => html`<div>Loading...</div>`,
      complete: (questionsList) => {
        const index = currentQuestionIndex.get() ?? 0
        const question = questionsList[index]
        return html`
          <div>
            ${this.renderMessage()}
            ${isQuestionsFinished.get()
              ? nothing
              : html`<h2>Question ${index + 1} / ${numberOfQuestions.get()}</h2>

                  <hunger-question-form
                    .question=${question}
                    @click=${this.onQuestionAnswered}
                  ></hunger-question-form>`}
          </div>
        `
      },
      error: (error) => html`<div>Error: ${error}</div>`,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hunger-question": HungerQuestion
  }
}
