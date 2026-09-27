import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { Task } from "@lit/task"
import { ALERT } from "../../styles/alert.js"

import { fetchQuestionsByProductCode } from "../../signals/questions"
import { localized, msg } from "@lit/localize"
import { ButtonType, getButtonClasses } from "../../styles/buttons.js"
import { EventState, EventType, RobotoffContributionType } from "../../constants.js"
import { CONTAINER } from "../../styles/responsive.js"
import "../robotoff-modal/robotoff-modal"
import "../robotoff-question/robotoff-question"
import { SignalWatcher } from "@lit-labs/signals"
import robotoff from "../../api/robotoff.js"
import { InsightType } from "../../types/robotoff.js"
import type { QuestionStateEventDetail } from "../../types/index.js"
import { LanguageCodesMixin } from "../../mixins/language-codes-mixin.js"

/**
 * The `robotoff-contribution-message` component is a web component that displays messages prompting users to contribute to improving product information.
 * It fetches data from various signals (ingredients, nutrients, and questions) and displays relevant messages based on the fetched data.
 *
 * @fires success - Dispatched when a contribution is successfully made.
 * @fires close - Dispatched when the modal is closed.
 *
 * @example
 * ```html
 * <robotoff-contribution-message product-code="123456789"></robotoff-contribution-message>
 * <robotoff-contribution-message product-code="123456789" variant="inline" reload-on-finish></robotoff-contribution-message>
 * ```
 */
@customElement("robotoff-contribution-message")
@localized()
export class RobotoffContributionMessage extends LanguageCodesMixin(SignalWatcher(LitElement)) {
  static override styles = [
    ALERT,
    CONTAINER,
    getButtonClasses([ButtonType.White]),
    css`
      :host {
        display: block;
        width: 100%;
      }
      .robotoff-contribution-message.alert {
        padding: 1rem;
        width: 100%;
        text-align: left;
        box-sizing: border-box;
      }
      .robotoff-contribution-message.robotoff-inline {
        text-align: center;
      }
      .robotoff-contribution-message p {
        margin-top: 0;
      }
      .robotoff-contribution-message ul {
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-left: 0;
        list-style-type: none;
      }
      .robotoff-contribution-message li {
        text-align: left;
      }
      .other-contributions {
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
      .other-contributions-title {
        font-weight: 500;
        margin-bottom: 0.5rem;
        text-align: left;
      }
      @media (prefers-color-scheme: dark) {
        .other-contributions {
          border-top-color: rgba(255, 255, 255, 0.15);
        }
      }
    `,
  ]

  /**
   * The product code for which the contribution messages are displayed.
   */
  @property({ type: String, attribute: "product-code", reflect: true })
  productCode = ""

  /**
   * Whether the user is logged in.
   */
  @property({
    type: Boolean,
    attribute: "is-logged-in",
  })
  isLoggedIn = false

  /**
   * Display variant: 'modal' (default) or 'inline'.
   * In inline variant, questions are displayed directly without the pre-warning prompt.
   */
  @property({ type: String, reflect: true })
  variant: "modal" | "inline" = "modal"

  /**
   * Shorthand boolean attribute to enable inline display.
   */
  @property({ type: Boolean, reflect: true })
  inline = false

  /**
   * Whether to reload the page when all questions have been answered.
   */
  @property({ type: Boolean, attribute: "reload-on-finish" })
  reloadOnFinish = false

  @property({ type: Boolean, attribute: "reload-on-finished" })
  reloadOnFinished = false

  /**
   * Delay in milliseconds before reloading the page after questions are finished.
   */
  @property({ type: Number, attribute: "reload-delay" })
  reloadDelay = 1200

  get isInline(): boolean {
    return this.variant === "inline" || this.inline
  }

  get shouldReloadOnFinish(): boolean {
    return this.reloadOnFinish || this.reloadOnFinished
  }

  /**
   * Whether questions have been finished in inline mode.
   */
  @state()
  private questionsFinished = false

  /**
   * The type of contribution being made.
   */
  @state()
  robotoffContributionType?: RobotoffContributionType

  /**
   * A record indicating which messages should be shown.
   */
  @state()
  showMessages: Record<RobotoffContributionType, boolean> = {
    [RobotoffContributionType.INGREDIENT_SPELLCHECK]: false,
    [RobotoffContributionType.NUTRIENT_EXTRACTION]: false,
    [RobotoffContributionType.INGREDIENT_DETECTION]: false,
    [RobotoffContributionType.QUESTIONS]: false,
  }

  /**
   * Returns the messages to be displayed based on the `showMessages` state.
   *
   * This correspond to the various type of contribution.
   * Each one is materialized as a button to the user.
   */
  get messagesToShow() {
    const items: {
      type: RobotoffContributionType
      message: string
    }[] = [
      {
        type: RobotoffContributionType.QUESTIONS,
        message: msg("Answer questions about the product."),
      },
      {
        type: RobotoffContributionType.INGREDIENT_SPELLCHECK,
        message: msg("Help us correct the spelling of ingredients."),
      },
      {
        type: RobotoffContributionType.NUTRIENT_EXTRACTION,
        message: msg("Help us correct the nutritional information."),
      },
      {
        type: RobotoffContributionType.INGREDIENT_DETECTION,
        message: msg("Help us correct the ingredient detection"),
      },
    ].filter((item) => this.showMessages[item.type])

    return items
  }

  /**
   * A task that fetches data for the component.
   * It refreshes when the `productCode` property changes.
   * It computes this.showMessages and returns the fetched insights
   * It fetches from robotoff : spellcheck insights, nutrient insights, and questions for the product.
   */
  private _fetchDataTask = new Task(this, {
    task: async ([productCode]) => {
      console.log("Fetching data for product code", productCode, this._languageCodes)
      this.showMessages = {
        [RobotoffContributionType.QUESTIONS]: false,
        [RobotoffContributionType.INGREDIENT_SPELLCHECK]: false,
        [RobotoffContributionType.NUTRIENT_EXTRACTION]: false,
        [RobotoffContributionType.INGREDIENT_DETECTION]: false,
      }

      // Check if it need contributions. If not, don't show the message. If request fails, hide the message but do not crash all requests
      const [questions, insights] = await Promise.allSettled([
        fetchQuestionsByProductCode(productCode),
        ...(this.isLoggedIn
          ? [
              robotoff.fetchRobotoffContributionMessageInsights({
                barcode: productCode,
                lc: this._languageCodes.join(","),
              }),
            ]
          : []),
      ])
      const insightValues = {
        [InsightType.ingredient_spellcheck]: false,
        [InsightType.nutrient_extraction]: false,
        [InsightType.ingredient_detection]: false,
      }

      if (insights?.status === "fulfilled") {
        for (const insight of insights.value) {
          insightValues[insight.type as InsightType] = true
          // If all insights are true, break the loop
          if (Object.values(insightValues).every((value) => value)) {
            break
          }
        }
      }

      this.showMessages = {
        questions: questions?.status === "fulfilled" && questions.value.length > 0,
        ...insightValues,
      }
    },
    args: () => [this.productCode, ...this._languageCodes],
  })

  /**
   * Opens the modal for the specified contribution type.
   * @param {RobotoffContributionType} type - The type of contribution.
   */
  openModal(type: RobotoffContributionType) {
    this.robotoffContributionType = type
  }
  /**
   * Closes the modal.
   */
  closeModal() {
    this.robotoffContributionType = undefined
  }
  /**
   * Handles the save event when a contribution is made.
   * @param {CustomEvent<{ type: RobotoffContributionType }>} event - The event containing the contribution type.
   */
  onSave(event: CustomEvent<{ type: RobotoffContributionType }>) {
    this.showMessages[event.detail.type!] = false
    this.closeModal()
    this.requestUpdate()
  }

  private onInlineQuestionState = (event: CustomEvent<QuestionStateEventDetail>): void => {
    if (event.detail.state === EventState.FINISHED) {
      this.questionsFinished = true
      this.dispatchEvent(
        new CustomEvent(EventType.SUCCESS, {
          bubbles: true,
          composed: true,
          detail: { type: RobotoffContributionType.QUESTIONS },
        })
      )
      if (!this.shouldReloadOnFinish) {
        setTimeout(() => {
          this.showMessages[RobotoffContributionType.QUESTIONS] = false
          this.requestUpdate()
        }, 2000)
      }
    } else if (event.detail.state === EventState.NO_DATA) {
      this.showMessages[RobotoffContributionType.QUESTIONS] = false
      this.requestUpdate()
    }
  }

  /**
   * Renders the component.
   * @returns {TemplateResult} The rendered template.
   */
  override render() {
    return this._fetchDataTask.render({
      complete: () => {
        const messagesToShow = this.messagesToShow
        const hasQuestions = this.showMessages[RobotoffContributionType.QUESTIONS]

        if (!messagesToShow.length && !this.questionsFinished) {
          return nothing
        }

        const modal = html`<robotoff-modal
          product-code=${this.productCode}
          .robotoffContributionType=${this.robotoffContributionType}
          @close=${this.closeModal}
          @success=${this.onSave}
        ></robotoff-modal>`

        if (this.isInline && (hasQuestions || this.questionsFinished)) {
          const otherMessages = messagesToShow.filter(
            (item) => item.type !== RobotoffContributionType.QUESTIONS
          )

          return html`<div>
            ${modal}
            <div class="robotoff-contribution-message robotoff-inline alert info">
              <div class="container">
                <robotoff-question
                  product-code=${this.productCode}
                  variant="inline"
                  ?reload-on-finish=${this.shouldReloadOnFinish}
                  .reloadDelay=${this.reloadDelay}
                  @question-state=${this.onInlineQuestionState}
                ></robotoff-question>
                ${
                  otherMessages.length > 0
                    ? html`
                        <div class="other-contributions">
                          <p class="other-contributions-title">
                            ${msg("You can also help us improve other parts:")}
                          </p>
                          <ul>
                            ${otherMessages.map(
                              (item) => html`
                                <li>
                                  <button
                                    class="button white-button small"
                                    @click=${() => this.openModal(item.type)}
                                  >
                                    ${item.message}
                                  </button>
                                </li>
                              `
                            )}
                          </ul>
                        </div>
                      `
                    : nothing
                }
              </div>
            </div>
          </div>`
        }

        if (!messagesToShow.length) {
          return nothing
        }

        return html` <div>
          ${modal}
          <div class="robotoff-contribution-message alert info">
            <div class="container">
              <p>
                ${msg(
                  "Hey! You can help us improve the product information by answering the following parts:"
                )}
              </p>
              <ul>
                ${messagesToShow.map(
                  (item) =>
                    html`<li>
                      <button
                        class="button white-button small"
                        @click=${() => this.openModal(item.type)}
                      >
                        ${item.message}
                      </button>
                    </li>`
                )}
              </ul>
            </div>
          </div>
        </div>`
      },
      pending: () => nothing,
      error: () => nothing,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-contribution-message": RobotoffContributionMessage
  }
}
