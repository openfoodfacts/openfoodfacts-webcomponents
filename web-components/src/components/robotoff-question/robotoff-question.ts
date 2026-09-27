import { LitElement, html, css, nothing, type TemplateResult } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { keyed } from "lit/directives/keyed.js"
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
import { localized, msg, str } from "@lit/localize"
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
      :host([variant="inline"]),
      :host([inline]) {
        padding: 0;
        background: transparent;
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
      .question-progress {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--robotoff-question-progress-color, #555);
        margin-top: 0.25rem;
        margin-bottom: 0.5rem;
      }
      robotoff-question-form {
        width: 100%;
        animation: fadeIn 0.25s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @media (prefers-color-scheme: dark) {
        :host {
          background: var(--robotoff-question-bg-dark, #181a1b);
          color: var(--robotoff-question-color-dark, #f3f3f3);
        }
        :host([variant="inline"]),
        :host([inline]) {
          background: transparent;
        }
        .message {
          color: var(--robotoff-question-message-color-dark, #b3b3b3);
        }
        .question-progress {
          color: var(--robotoff-question-progress-color-dark, #a0a0a0);
        }
      }
    `,
  ]

  /** Variant of question display ('default' | 'inline') */
  @property({ type: String, reflect: true })
  variant: "default" | "inline" = "default"

  /** Shorthand boolean attribute for inline display */
  @property({ type: Boolean, reflect: true })
  inline = false

  /** Whether to show question progress indicator (e.g. Question 1 of 3) */
  @property({ type: Boolean, attribute: "show-progress" })
  showProgress = true

  /** Whether to reload the page when all questions have been answered */
  @property({ type: Boolean, attribute: "reload-on-finish" })
  reloadOnFinish = false

  @property({ type: Boolean, attribute: "reload-on-finished" })
  reloadOnFinished = false

  /** Delay in milliseconds before reloading the page */
  @property({ type: Number, attribute: "reload-delay" })
  reloadDelay = 1200

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

  get isInline(): boolean {
    return this.variant === "inline" || this.inline
  }

  get shouldReloadOnFinish(): boolean {
    return this.reloadOnFinish || this.reloadOnFinished
  }

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
      if (this.shouldReloadOnFinish) {
        setTimeout(() => {
          this.triggerReload()
        }, this.reloadDelay)
      }
    }
  }

  /** Reloads the page to reflect updated product information and score */
  triggerReload(): void {
    if (typeof window !== "undefined" && typeof window.location?.reload === "function") {
      try {
        window.location.reload()
      } catch {
        // Safe fallback in test environments
      }
    }
  }

  /** Render the message to display to the user */
  private renderMessage(): TemplateResult | typeof nothing {
    const getMessageWrapper = (message: string | TemplateResult) =>
      html`<div class="message">${message}</div>`
    if (isQuestionsFinished(this.productCode).get()) {
      if (this.shouldReloadOnFinish) {
        return getMessageWrapper(
          msg("Thank you for your assistance! Reloading page to update score...")
        )
      }
      return getMessageWrapper(msg("Thank you for your assistance!"))
    }
    if (!this.showMessage) {
      return nothing
    }
    if (!this.hasAnswered) {
      return getMessageWrapper(msg("Open Food Facts needs your help with this product."))
    }
    return getMessageWrapper(msg("Thanks for your help! Can you assist with another question?"))
  }

  /** Render progress indicator when multiple questions are available */
  private renderProgress(): TemplateResult | typeof nothing {
    if (!this.showProgress || isQuestionsFinished(this.productCode).get()) {
      return nothing
    }
    const total = numberOfQuestions(this.productCode).get()
    if (total <= 1) {
      return nothing
    }
    const current = Math.min((currentQuestionIndex(this.productCode).get() ?? 0) + 1, total)
    return html`<div class="question-progress">${msg(str`Question ${current} of ${total}`)}</div>`
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
            ${this.renderMessage()} ${this.renderProgress()}
            ${
              isQuestionsFinished(this.productCode).get()
                ? nothing
                : keyed(
                    question.insight_id,
                    html`
                      <robotoff-question-form
                        .isImageExpanded=${this.isImageExpanded}
                        .question=${question}
                        @submit=${this.onQuestionAnswered}
                      ></robotoff-question-form>
                    `
                  )
            }
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
