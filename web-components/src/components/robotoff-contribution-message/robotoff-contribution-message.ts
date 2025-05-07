import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { Task } from "@lit/task"
import { ALERT } from "../../styles/alert.js"

import { fetchSpellcheckInsights } from "../../signals/ingredients"
import { fetchNutrientInsightsByProductCode } from "../../signals/nutrients"
import { fetchQuestionsByProductCode } from "../../signals/questions"
import { localized, msg } from "@lit/localize"
import { ButtonType, getButtonClasses } from "../../styles/buttons.js"
import { RobotoffContributionType } from "../../constants.js"
import { CONTAINER } from "../../styles/responsive.js"
import "../robotoff-modal/robotoff-modal"
import { SignalWatcher } from "@lit-labs/signals"

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
 * ```
 */
@customElement("robotoff-contribution-message")
@localized()
export class RobotoffContributionMessage extends SignalWatcher(LitElement) {
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
    `,
  ]

  /**
   * The product code for which the contribution messages are displayed.
   */
  @property({ type: String, attribute: "product-code" })
  productCode = ""

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
    ingredients: false,
    nutrients: false,
    questions: false,
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
      show: boolean
      message: string
    }[] = [
      {
        type: RobotoffContributionType.QUESTIONS,
        show: this.showMessages.questions,
        message: msg("Answer questions about the product."),
      },
      {
        type: RobotoffContributionType.INGREDIENTS,
        show: this.showMessages.ingredients,
        message: msg("Help us correct the spelling of ingredients."),
      },
      {
        type: RobotoffContributionType.NUTRIENTS,
        show: this.showMessages.nutrients,
        message: msg("Help us correct the nutritional information."),
      },
    ].filter((item) => item.show)
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
      // Check if it need contributions. If not, don't show the message. If request fails, hide the message but do not crash all requests
      const [spellcheckInsights, nutrientInsights, questions] = await Promise.allSettled([
        fetchSpellcheckInsights(productCode),
        fetchNutrientInsightsByProductCode(productCode),
        fetchQuestionsByProductCode(productCode),
      ])

      this.showMessages = {
        ingredients:
          spellcheckInsights.status === "fulfilled" && spellcheckInsights.value.length > 0,
        nutrients: nutrientInsights.status === "fulfilled" && nutrientInsights.value.length > 0,
        questions: questions.status === "fulfilled" && questions.value.length > 0,
      }

      return { spellcheckInsights, nutrientInsights, questions }
    },
    args: () => [this.productCode],
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

  /**
   * Renders the component.
   * @returns {TemplateResult} The rendered template.
   */
  override render() {
    return this._fetchDataTask.render({
      complete: () => {
        const messagesToShow = this.messagesToShow

        if (!messagesToShow.length) {
          return nothing
        }
        return html` <div>
          <robotoff-modal
            product-code=${this.productCode}
            .robotoffContributionType=${this.robotoffContributionType}
            @close=${this.closeModal}
            @success=${this.onSave}
          ></robotoff-modal>
          <div class="robotoff-contribution-message alert info">
            <div class="container">
              <p>
                ${msg(
                  "Hey! You can help us improve the product information by answering the following parts:"
                )}
              </p>
              <ul>
                ${this.messagesToShow.map(
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
