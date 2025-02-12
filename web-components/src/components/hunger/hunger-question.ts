import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import {
  currentQuestionIndex,
  fetchQuestionsByProductCode,
  nextQuestion,
  isQuestionsFinished,
  questions,
  hasQuestions,
  numberOfQuestions,
  hasAnswered,
} from "../../signals/questions"
import { Task } from "@lit/task"
import { localized, msg } from "@lit/localize"
import { EventType } from "../../constants"
import { QuestionStateEventDetail } from "../../types"

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
    .question-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .message {
      font-style: italic;
    }
  `
  /**
   * Options for the component
   * @type {Object}
   * @property {boolean} showMessage - Whether to show the message
   * @property {boolean} showLoading - Whether to show the loading indicator
   * @property {boolean} showError - Whether to show the error message
   */
  @property({ type: Object, reflect: true })
  options: {
    showMessage?: boolean
    showLoading?: boolean
    showError?: boolean
  } = {}

  /**
   * The product id to fetch questions for
   * @type {string}
   */
  @property({ type: String, attribute: "product-id" })
  productId: string = ""

  /**
   * The insight types to filter questions separate by comma
   * @type {string}
   */
  @property({ type: String, attribute: "insight-types" })
  insightTypes: string = ""

  private _questionsTask = new Task(this, {
    task: async ([productId, insightTypes], {}) => {
      if (!productId) {
        return []
      }
      const params = insightTypes ? { insight_types: insightTypes } : {}
      await fetchQuestionsByProductCode(productId, params)
      this._emitQuestionStateEvent()
      return questions.get()
    },
    args: () => [this.productId, this.insightTypes],
  })

  private _emitQuestionStateEvent = () => {
    const detail: QuestionStateEventDetail = {
      index: currentQuestionIndex.get(),
      numberOfQuestions: numberOfQuestions.get(),
    }
    this.dispatchEvent(
      new CustomEvent(EventType.QUESTION_STATE, {
        detail,
        bubbles: true,
        composed: true,
      })
    )
  }
  private onQuestionAnswered = () => {
    nextQuestion()
    this.requestUpdate()
    this._emitQuestionStateEvent()
  }

  private renderMessage() {
    const getMessageWrapper = (message: string) =>
      html`<div class="message">${message}</div>`

    if (isQuestionsFinished.get()) {
      return getMessageWrapper(msg("Thank you for your assistance!"))
    } else if (!this.options?.showMessage) {
      return nothing
    } else if (!hasAnswered.get()) {
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
          <div class="question-wrapper">
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
