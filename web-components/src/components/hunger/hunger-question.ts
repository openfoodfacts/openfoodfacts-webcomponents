import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  currentQuestionIndex,
  fetchQuestionsByProductCode,
  nextQuestion,
  isQuestionsFinished,
  questions,
  hasQuestions,
} from "../../signals/questions"
import { Task } from "@lit/task"
import { localized, msg } from "@lit/localize"

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("hunger-question")
@localized()
export class HungerQuestion extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .message {
      font-style: italic;
    }
  `
  @property({ type: Object, reflect: true })
  options: {
    showMessage?: boolean
    showLoading?: boolean
    showError?: boolean
  } = {}

  @property({ attribute: "product-id" })
  productId: string = ""

  @property({ type: String, attribute: "insight-types" })
  insightTypes: string = ""

  @state()
  private _first: boolean = true

  private _questionsTask = new Task(this, {
    task: async ([productId, insightTypes], {}) => {
      if (!productId) {
        return []
      }
      const params = insightTypes ? { insight_types: insightTypes } : {}
      await fetchQuestionsByProductCode(productId, params)
      return questions.get()
    },
    args: () => [this.productId, this.insightTypes],
  })

  private onQuestionAnswered = () => {
    nextQuestion()
    this.requestUpdate()
  }

  private renderMessage() {
    const getMessageWrapper = (message: string) =>
      html`<div class="message">${message}</div>`

    if (isQuestionsFinished.get()) {
      return getMessageWrapper(msg("Thank you for your assistance!"))
    } else if (!this.options?.showMessage) {
      return nothing
    } else if (this._first) {
      this._first = false
      return getMessageWrapper(
        msg("Open Food Facts needs your help with this product.")
      )
    }

    return html`<div>
      ${msg(`Thanks for your help! Can you assist with another question?`)}
    </div>`
  }

  override render() {
    return this._questionsTask.render({
      pending: () => {
        if (!this.options?.showLoading) {
          return nothing
        }
        return html`<div>Loading...</div>`
      },
      complete: (questionsList) => {
        const index = currentQuestionIndex.get() ?? 0
        const question = questionsList[index]
        if (!hasQuestions.get()) {
          return html``
        }
        return html`
          <div>
            ${this.renderMessage()}
            ${isQuestionsFinished.get()
              ? nothing
              : html`<hunger-question-form
                  .question=${question}
                  @submit=${this.onQuestionAnswered}
                ></hunger-question-form>`}
          </div>
        `
      },
      error: (error) => {
        if (!this.options.showError) {
          return nothing
        }
        return html`<div>Error: ${error}</div>`
      },
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hunger-question": HungerQuestion
  }
}
