import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  currentQuestionIndex,
  fetchQuestionsByProductCode,
  nextQuestionByProductCode,
  isQuestionsFinished,
  questions,
  hasQuestions,
  numberOfQuestions,
} from "../../signals/questions"
import { Task } from "@lit/task"
import { localized, msg } from "@lit/localize"
import { EventType } from "../../constants"
import { QuestionStateEventDetail } from "../../types"
import { SignalWatcher } from "@lit-labs/signals"
import "../shared/loader"

/**
 * Robotoff question component
 * @element robotoff-question
 * @fires {EventType.QUESTION_STATE} - When the state of the question changes
 */
@customElement("robotoff-question")
@localized()
export class RobotoffQuestion extends SignalWatcher(LitElement) {
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
   * The product code to fetch questions for
   * @type {string}
   */
  @property({ type: String, attribute: "product-code" })
  productCode: string = ""

  /**
   * The insight types to filter questions separate by comma
   * @type {string}
   */
  @property({ type: String, attribute: "insight-types" })
  insightTypes: string = ""

  /**
   * Whether the user has answered the question
   * @type {boolean}
   */
  @state()
  private hasAnswered = false

  private _questionsTask = new Task(this, {
    task: async ([productCode, insightTypes], {}) => {
      this.hasAnswered = false
      if (!productCode) {
        return []
      }
      const params = insightTypes ? { insight_types: insightTypes } : {}

      await fetchQuestionsByProductCode(productCode, params)
      this._emitQuestionStateEvent()
      return questions(productCode).get()
    },
    args: () => [this.productCode, this.insightTypes],
  })

  private _emitQuestionStateEvent = () => {
    const detail: QuestionStateEventDetail = {
      index: currentQuestionIndex(this.productCode).get(),
      numberOfQuestions: numberOfQuestions(this.productCode).get(),
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
    this.hasAnswered = true
    nextQuestionByProductCode(this.productCode)
    this.requestUpdate()
    this._emitQuestionStateEvent()
  }

  private renderMessage() {
    const getMessageWrapper = (message: string) => html`<div class="message">${message}</div>`

    if (isQuestionsFinished(this.productCode).get()) {
      return getMessageWrapper(msg("Thank you for your assistance!"))
    } else if (!this.options?.showMessage) {
      return nothing
    } else if (!this.hasAnswered) {
      return getMessageWrapper(msg("Open Food Facts needs your help with this product."))
    }

    return html`<div>${msg(`Thanks for your help! Can you assist with another question?`)}</div>`
  }

  override render() {
    return this._questionsTask.render({
      pending: () => {
        if (!this.options?.showLoading) {
          return nothing
        }
        return html`<off-wb-loader></off-wb-loader>`
      },
      complete: (questionsList) => {
        const index = currentQuestionIndex(this.productCode).get() ?? 0
        const question = questionsList[index]
        if (!hasQuestions(this.productCode).get()) {
          return html``
        }
        return html`
          <div class="question-wrapper">
            ${isQuestionsFinished(this.productCode).get()
              ? nothing
              : html`
                  ${this.renderMessage()}
                  <robotoff-question-form
                    .question=${question}
                    @submit=${this.onQuestionAnswered}
                  ></robotoff-question-form>
                `}
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
    "robotoff-question": RobotoffQuestion
  }
}
