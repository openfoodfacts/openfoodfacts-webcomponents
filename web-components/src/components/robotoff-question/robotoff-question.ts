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
import { EventState, EventType } from "../../constants"
import { QuestionStateEventDetail } from "../../types"
import { SignalWatcher } from "@lit-labs/signals"
import "../shared/loader"
import "./robotoff-question-form"
import { BASE } from "../../styles/base"

/**
 * Robotoff question component
 * @element robotoff-question
 * @fires {EventType.QUESTION_STATE} - When the state of the question changes
 */
@customElement("robotoff-question")
@localized()
export class RobotoffQuestion extends SignalWatcher(LitElement) {
  static override styles = [
    BASE,
    css`
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
    `,
  ]
  /**
   * Options for the component
   * @type {Object}
   */
  @property({ type: Object, reflect: true })
  options: {
    showMessage?: boolean
    showLoading?: boolean
    showError?: boolean
    isImageExpanded?: boolean
  } = {
    isImageExpanded: false,
  }

  /**
   * The product code to fetch questions for
   * @type {string}
   */
  @property({ type: String, attribute: "product-code" })
  productCode = ""

  /**
   * The insight types to filter questions separate by comma
   * @type {string}
   */
  @property({ type: String, attribute: "insight-types" })
  insightTypes = ""

  /**
   * Whether the user has answered the question
   * @type {boolean}
   */
  @state()
  private hasAnswered = false

  /**
   * Task to fetch questions for the given product code
   * @type {Task}
   * @private
   */
  private _questionsTask = new Task(this, {
    task: async ([productCode, insightTypes], {}) => {
      this.hasAnswered = false
      if (!productCode) {
        return []
      }
      const params = insightTypes ? { insight_types: insightTypes } : {}

      this._emitQuestionStateEvent(EventState.LOADING)
      await fetchQuestionsByProductCode(productCode, params)
      const value = questions(productCode).get()
      this._emitQuestionStateEvent(value?.length > 0 ? EventState.HAS_DATA : EventState.NO_DATA)
      return value
    },
    args: () => [this.productCode, this.insightTypes],
  })

  /**
   * Emit a custom event when the question state changes to know current state outside the component
   * @returns {void}
   */
  private _emitQuestionStateEvent = (state: EventState) => {
    const detail: QuestionStateEventDetail =
      state === EventState.LOADING
        ? { state }
        : {
            state,
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
    this._emitQuestionStateEvent(EventState.ANNOTATED)
    // Check if all questions are answered to emit the finished event
    if (isQuestionsFinished(this.productCode).get()) {
      this._emitQuestionStateEvent(EventState.FINISHED)
    }
  }

  /**
   * Render the message to display to the user
   * @returns {TemplateResult}
   * @private
   **/
  private renderMessage() {
    const getMessageWrapper = (message: string) => html`<div class="message">${message}</div>`

    if (isQuestionsFinished(this.productCode).get()) {
      return getMessageWrapper(msg("Thank you for your assistance!"))
    } else if (!this.options?.showMessage) {
      return nothing
    } else if (!this.hasAnswered) {
      return getMessageWrapper(msg("Open Food Facts needs your help with this product."))
    }

    return html`<div>${msg("Thanks for your help! Can you assist with another question?")}</div>`
  }

  override render() {
    return this._questionsTask.render({
      pending: () => {
        if (!this.options?.showLoading) {
          return nothing
        }
        return html`<off-wc-loader></off-wc-loader>`
      },
      complete: (questionsList) => {
        const index = currentQuestionIndex(this.productCode).get() ?? 0
        const question = questionsList[index]
        if (!hasQuestions(this.productCode).get()) {
          return html`<slot></slot>`
        }
        return html`
          <div class="question-wrapper">
            ${this.renderMessage()}
            ${isQuestionsFinished(this.productCode).get()
              ? nothing
              : html`
                  <robotoff-question-form
                    .is-image-expanded=${this.options.isImageExpanded}
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
