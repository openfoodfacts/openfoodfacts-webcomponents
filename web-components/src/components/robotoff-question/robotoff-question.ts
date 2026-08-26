import { LitElement, html, css, nothing, type TemplateResult } from "lit"
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
import type { QuestionStateEventDetail } from "../../types"
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
        padding: 1rem;
      }
      .question-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .message {
        font-style: italic;
        color: var(--robotoff-question-message-color, #444);
      }
      @media (prefers-color-scheme: dark) {
        :host {
          background: var(--robotoff-question-bg-dark, #181a1b);
          color: var(--robotoff-question-color-dark, #f3f3f3);
        }
        .message {
          color: var(--robotoff-question-message-color-dark, #b3b3b3);
        }
      }
    `,
  ]

  @property({ type: Boolean, attribute: "show-message" })
  showMessage = true

  @property({ type: Boolean, attribute: "show-loading" })
  showLoading = true

  @property({ type: Boolean, attribute: "show-error" })
  showError = true

  @property({ type: Boolean, attribute: "image-expanded" })
  isImageExpanded = false

  /** Product code to fetch questions for */
  @property({ type: String, attribute: "product-code" })
  productCode: string = ""

  /** Insight types to filter questions, comma-separated */
  @property({ type: String, attribute: "insight-types" })
  insightTypes: string = ""

  /** Whether the user has answered the question */
  @state()
  private hasAnswered: boolean = false

  /** Task to fetch questions for the given product code */
  private _questionsTask = new Task(this, {
    task: async ([productCode, insightTypes]) => {
      this.hasAnswered = false
      if (!productCode) return []
      const params = insightTypes ? { insight_types: insightTypes } : {}
      this._emitQuestionStateEvent(EventState.LOADING)
      await fetchQuestionsByProductCode(productCode, params)
      const value = questions(productCode).get()
      this._emitQuestionStateEvent(value?.length > 0 ? EventState.HAS_DATA : EventState.NO_DATA)
      return value
    },
    args: () => [this.productCode, this.insightTypes],
  })

  /** Emit a custom event when the question state changes */
  private _emitQuestionStateEvent(state: EventState): void {
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

  private onQuestionAnswered = (): void => {
    this.hasAnswered = true
    nextQuestionByProductCode(this.productCode)
    this.requestUpdate()
    this._emitQuestionStateEvent(EventState.ANNOTATED)
    if (isQuestionsFinished(this.productCode).get()) {
      this._emitQuestionStateEvent(EventState.FINISHED)
    }
  }

  /** Render the message to display to the user */
  private renderMessage(): TemplateResult | typeof nothing {
    const getMessageWrapper = (message: string) => html`<div class="message">${message}</div>`
    if (isQuestionsFinished(this.productCode).get()) {
      return getMessageWrapper(msg("Thank you for your assistance!"))
    }
    if (!this.showMessage) {
      return nothing
    }
    if (!this.hasAnswered) {
      return getMessageWrapper(msg("Open Food Facts needs your help with this product."))
    }
    return html`<div>${msg("Thanks for your help! Can you assist with another question?")}</div>`
  }

  override render() {
    return this._questionsTask.render({
      pending: () => (this.showLoading ? html`<off-wc-loader></off-wc-loader>` : nothing),
      error: (error) => (this.showError ? html`<div>Error: ${error}</div>` : nothing),
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
                    .isImageExpanded=${this.isImageExpanded}
                    .question=${question}
                    @submit=${this.onQuestionAnswered}
                  ></robotoff-question-form>
                `}
          </div>
        `
      },
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-question": RobotoffQuestion
  }
}
