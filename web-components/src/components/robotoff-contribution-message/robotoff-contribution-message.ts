import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { Task } from "@lit/task"
import { ALERT } from "../../styles/alert.js"

import { fetchSpellcheckInsights } from "../../signals/ingredients"
import { fetchNutrientInsightsByProductCode } from "../../signals/nutrients"
import { fetchQuestionsByProductCode } from "../../signals/questions"
import { localized, msg, str } from "@lit/localize"
import { ButtonType, getButtonClasses } from "../../styles/buttons.js"
import { RobotoffContributionType } from "../../constants.js"
import { CONTAINER } from "../../styles/responsive.js"
import "../robotoff-modal/robotoff-modal"
import { SignalWatcher } from "@lit-labs/signals"

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
      }
      .robotoff-contribution-message li {
        text-align: left;
      }
    `,
  ]

  @property({ type: String, attribute: "product-code" })
  productCode = ""

  @state()
  robotoffContributionType?: RobotoffContributionType

  @state()
  showMessages: Record<RobotoffContributionType, boolean> = {
    ingredients: false,
    nutrients: false,
    questions: false,
  }

  get messagesToShow() {
    const items: {
      type: RobotoffContributionType
      show: boolean
      message: string
    }[] = [
      {
        type: RobotoffContributionType.QUESTIONS,
        show: this.showMessages.questions,
        message: msg(str`Answer questions about the product.`),
      },
      {
        type: RobotoffContributionType.INGREDIENTS,
        show: this.showMessages.ingredients,
        message: msg(str`Help us correct the spelling of ingredients.`),
      },
      {
        type: RobotoffContributionType.NUTRIENTS,
        show: this.showMessages.nutrients,
        message: msg(str`Help us correct the nutritional information.`),
      },
    ].filter((item) => item.show)
    return items
  }

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

  openModal(type: RobotoffContributionType) {
    this.robotoffContributionType = type
  }

  override render() {
    return this._fetchDataTask.render({
      complete: () => {
        const messagesToShow = this.messagesToShow

        if (!messagesToShow.length) {
          return nothing
        }
        return html`<div class="robotoff-contribution-message alert info">
          <robotoff-modal
            product-code=${this.productCode}
            .robotoffContributionType=${this.robotoffContributionType}
          ></robotoff-modal>
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
