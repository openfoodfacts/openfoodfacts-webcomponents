import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { Task } from "@lit/task"
import {
  fetchSpellcheckInsights,
  fetchSpellcheckInsightsByProductCode,
  getIngredientSpellcheckInsightsByProductCode,
} from "../../signals/ingredients"
import { getValidHeadingLevel } from "../../utils/knowledge-panels/heading-utils"
import { getTranslationsByQuantity } from "../../utils/internalization"
import { IngredientsInsight, QuestionAnnotationAnswer } from "../../types/robotoff"
import { getLocale } from "../../localization"
import { getWordDiff } from "../../utils/word-diff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import { EventType } from "../../constants"
import "./spellchecker"

@customElement("robotoff-ingredients")
export class RobotoffIngredients extends LitElement {
  static override styles = [
    BASE,
    getButtonClasses([ButtonType.Cappucino, ButtonType.Success, ButtonType.Danger]),
    css`
      :host {
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      .text-section {
        margin-bottom: 1.5rem;
      }
      h2 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }
      .text-content {
        background-color: #f8f8f8;
        padding: 1rem;
        border-radius: 4px;
        white-space: pre-wrap;
        line-height: 1.5;
      }
      .diff-highlight .deletion {
        background-color: #ffcccc;
        text-decoration: line-through;
      }
      .diff-highlight .addition {
        background-color: #ccffcc;
      }
      .diff-highlight .change-old {
        background-color: #ffcccc;
        text-decoration: line-through;
      }
      .diff-highlight .change-new {
        background-color: #ccffcc;
      }
      .summary-item {
        margin-bottom: 0.5rem;
      }
      .summary-label {
        font-weight: bold;
      }
      .code {
        font-family: monospace;
      }
    `,
  ]
  @property({ type: String, attribute: "title-level" })
  titleLevel = "h2"

  @property({ type: String, attribute: "product-code" })
  productCode = ""

  @state()
  private _currentIndex = 0

  @state()
  private _insights: IngredientsInsight[] = []

  @state()
  value = ""

  renderHeader() {
    // const titleLevel = getValidHeadingLevel(this.titleLevel, "h2")
    return html`
      <div>
        <div>
          <div>${msg("Extract ingredients")}</div>
        </div>
        <p>
          <!-- TODO Change later -->
          Poulet tika
        </p>
      </div>
    `
  }

  updateValue() {
    const insight = this._insights[this._currentIndex]
    if (insight) {
      this.value = insight.data.original
    }
  }

  private _spellcheckTask = new Task(this, {
    task: async ([productCode], {}) => {
      this._insights = []
      if (!productCode) {
        return []
      }
      // const lang = getLocale()
      // await fetchSpellcheckInsightsByProductCode(productCode)

      // this._insights = getIngredientSpellcheckInsightsByProductCode(productCode)
      // .filter(
      //   (insight) => insight!.data.lang === lang
      // )
      // return this._insights
      this._insights = (await fetchSpellcheckInsights()).filter(
        (insight) => insight.data.correction !== insight.data.original
      )
      this.updateValue()
      return this._insights
    },
    args: () => [this.productCode],
  })

  @state()
  suggestions: { old: string; new: string }[] = [
    { old: "Poulat", new: "Poulet" },
    { old: "Tikal", new: "Tika" },
  ]

  @state()
  values: Record<number, string> = {}

  get currentSuggestion() {
    return this.suggestions[this._currentIndex]
  }

  nextInsight() {
    this._currentIndex++
    this.updateValue()
  }

  submitAnnotation(event) {
    if (!this._insights.length) {
      return
    }

    // Get the current insight
    const currentInsight = this._insights[this._currentIndex]

    // Check if insight exists
    if (!currentInsight) {
      console.error("No insight found at index", this._currentIndex)
      return
    }

    // Send the annotation to Robotoff API
    robotoff
      .annotateIngredients(currentInsight.id, this.value)
      .then(() => {
        // Dispatch a submit event to notify parent components
        this.dispatchEvent(
          new CustomEvent(EventType.SUBMIT, {
            bubbles: true,
            composed: true,
            detail: {
              insightId: currentInsight.id,
              correction: this.value,
              original: currentInsight.data.original,
            },
          })
        )

        // Move to next insight or finish
        if (this._currentIndex < this._insights.length - 1) {
          this.nextInsight()
        } else {
          // All insights processed
          console.log("All ingredients insights processed")
        }
      })
      .catch((error) => {
        console.error("Error annotating ingredient insight:", error)
      })
  }

  onUpdate(event: CustomEvent) {
    const { result } = event.detail
    this.value = result
  }

  override render() {
    return this._spellcheckTask.render({
      pending: () => html`<off-wc-loader></off-wc-loader>`,
      complete: (spellcheckInsights: readonly IngredientsInsight[]) => {
        if (!spellcheckInsights.length) {
          return nothing
        }
        const lang = getLocale()

        // Make sure we have a valid insight at the current index
        const currentInsight = spellcheckInsights[this._currentIndex]
        if (!currentInsight) {
          return nothing
        }

        const correction = currentInsight.data.correction
        const original = currentInsight.data.original
        return html`
          <div>
            ${this.renderHeader()}
            <div>
              <zoomable-image
                src="https://static.openfoodfacts.org/images/products/322/989/000/0007/front_fr.10.400.jpg"
                .size="${{ width: "100%" }}"
              ></zoomable-image>
            </div>
            <div>
              <label>
                <div>${msg("Language")}</div>
                <input type="text" disabled value="${lang}" />
              </label>
              <div>
                <spellchecker
                  value=${this.value}
                  correction=${correction}
                  original=${original}
                  @update=${this.onUpdate}
                  @submit=${this.submitAnnotation}
                ></spellchecker>
              </div>
            </div>
          </div>
        `
      },
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-ingredients": RobotoffIngredients
  }
}
