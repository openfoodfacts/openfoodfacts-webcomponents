import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { ALERT } from "../../styles/alert.js"

import { fetchSpellcheckInsights } from "../../signals/ingredients"
import { fetchNutrientInsightsByProductCode } from "../../signals/nutrients"
import { fetchQuestionsByProductCode } from "../../signals/questions"
import { localized, msg } from "@lit/localize"
import { ButtonType, getButtonClasses } from "../../styles/buttons.js"
import { RobotoffContribution } from "../../constants.js"
import { CONTAINER } from "../../styles/responsive.js"

@customElement("robotoff-contribution-message")
@localized()
export class RobotoffContributionMessage extends LitElement {
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

  @property({ type: String })
  productCode = ""

  @state()
  isLoaded = false

  @state()
  showMessages: Record<RobotoffContribution, boolean> = {
    ingredients: false,
    nutrients: false,
    questions: false,
  }

  get messagesToShow() {
    if (!this.isLoaded) {
      return []
    }
    const items = [
      {
        name: RobotoffContribution.QUESTIONS,
        show: this.showMessages.questions,
        message: msg("Answer questions about the product."),
      },
      {
        name: RobotoffContribution.INGREDIENTS,
        show: this.showMessages.ingredients,
        message: msg("Help us correct the spelling of ingredients."),
      },
      {
        name: RobotoffContribution.NUTRIENTS,
        show: this.showMessages.nutrients,
        message: msg("Help us correct the nutritional information."),
      },
    ].filter((item) => item.show)
    return items
  }

  override async firstUpdated() {
    this.isLoaded = false
    const [spellcheckInsights, nutrientInsights, questions] = await Promise.all([
      fetchSpellcheckInsights(this.productCode),
      fetchNutrientInsightsByProductCode(this.productCode),
      fetchQuestionsByProductCode(this.productCode),
    ])

    this.showMessages.ingredients = spellcheckInsights.length > 0
    this.showMessages.nutrients = nutrientInsights.length > 0
    this.showMessages.questions = questions.length > 0
    this.isLoaded = true
  }

  override render() {
    const messagesToShow = this.messagesToShow
    if (!messagesToShow.length) {
      return nothing
    }
    return html`
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
                  <button class="button white-button small">${item.message}</button>
                </li>`
            )}
          </ul>
        </div>
      </div>
    `
  }
}
