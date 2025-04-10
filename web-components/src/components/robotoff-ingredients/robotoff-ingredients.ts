import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { Task } from "@lit/task"
import {
  fetchSpellcheckInsights,
  fetchSpellcheckInsightsByProductCode,
  getIngredientSpellcheckInsightsByProductCode,
  ingredientSpellcheckInsights,
} from "../../signals/ingredients"
import { getValidHeadingLevel } from "../../utils/knowledge-panels/heading-utils"
import { getTranslationsByQuantity } from "../../utils/internalization"
import { IngredientsInsight, QuestionAnnotationAnswer } from "../../types/robotoff"
import { getLocale } from "../../localization"
import { getWordDiff } from "../../utils/word-diff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import { EventState, EventType } from "../../constants"
import "./text-corrector"
import "../shared/zoomable-image"
import { fetchProduct } from "../../api/openfoodfacts"
import { insight, insightById } from "../../signals/nutrients"
import { ImageIngredientsProductType } from "../../types/openfoodfacts"
import { TextCorrectorEvent } from "../../types"

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
  private _insigthIds: string[] = []

  @state()
  private productData: {
    imageUrl?: string
    name?: string
  } = {}

  get fullImageUrl() {
    return this.productData.imageUrl
      ? this.productData.imageUrl.replace(/400.jpg$/, "full.jpg")
      : undefined
  }

  get languageCode() {
    return getLocale()
  }

  get _insight(): IngredientsInsight | undefined {
    const id: string | undefined = this._insigthIds[this._currentIndex]
    const value = ingredientSpellcheckInsights.getItem(id)
    return value
  }

  renderHeader() {
    // const titleLevel = getValidHeadingLevel(this.titleLevel, "h2")
    return html`
      <div>
        <div>
          <div>${msg("Extract ingredients")}</div>
        </div>
        <p>${this.productData.name}</p>
      </div>
    `
  }

  updateValue() {
    const insight = this._insight
    this.updateIngredientsImageUrl(insight)
  }

  async updateIngredientsImageUrl(insight?: IngredientsInsight) {
    if (!insight) {
      this.productData.imageUrl = undefined
      this.productData.name = undefined
      return
    }
    const result = await fetchProduct<ImageIngredientsProductType>(insight.barcode, {
      lc: this.languageCode,
      fields: ["image_ingredients_url", "product_name"],
    })

    this.productData = {
      imageUrl: result.product.image_ingredients_url,
      name: result.product.product_name,
    }
  }

  private _spellcheckTask = new Task(this, {
    task: async ([productCode]) => {
      const lang = this.languageCode
      this._insigthIds = []
      const insights = await fetchSpellcheckInsights(productCode ? productCode : undefined)
      this._insigthIds = insights
        .filter((insight) => insight.data.lang === lang)
        .map((insight) => insight.id)
      this.updateValue()
    },
    args: () => [this.productCode],
  })

  @state()
  values: Record<number, string> = {}

  nextInsight() {
    this._currentIndex++
    this.updateValue()
  }

  async submitAnnotation(event: TextCorrectorEvent) {
    const insight = this._insight
    if (!insight) {
      console.error("No insight found at index", this._currentIndex)
      return
    }

    // Send the annotation to Robotoff API
    await robotoff.annotateIngredients(insight.id, event.detail.annotation, event.detail.correction)
    // Dispatch a submit event to notify parent components
    this.dispatchEvent(
      new CustomEvent(EventType.INGREDIENTS_STATE, {
        bubbles: true,
        composed: true,
        detail: {
          state: EventState.ANNOTATED,
          insightId: insight.id,
          ...event.detail,
        },
      })
    )

    // Move to next insight or finish
    if (this._currentIndex < this._insigthIds.length - 1) {
      this.nextInsight()
    } else {
      // All insights processed
      alert("All ingredients insights processed")
    }
  }

  override render() {
    return this._spellcheckTask.render({
      pending: () => html`<off-wc-loader></off-wc-loader>`,
      complete: () => {
        const insight = this._insight
        if (!insight) {
          return nothing
        }

        // Make sure we have a valid insight at the current index
        const correction = insight.data.correction
        const original = insight.data.original

        return html`
          <div>
            ${this.renderHeader()}
            <div>
              <label>
                <div>${msg("Language")}</div>
                <input type="text" disabled value="${this.languageCode}" />
              </label>
              <div>
                <zoomable-image
                  src=${this.fullImageUrl}
                  fallbackSrc=${this.productData.imageUrl}
                  .size="${{ width: "100%" }}"
                ></zoomable-image>
              </div>
              <div>
                <text-corrector
                  correction=${correction}
                  original=${original}
                  @submit=${this.submitAnnotation}
                ></text-corrector>
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
