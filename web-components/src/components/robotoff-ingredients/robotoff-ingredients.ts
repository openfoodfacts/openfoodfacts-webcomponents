import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { Task } from "@lit/task"
import { fetchSpellcheckInsights, ingredientSpellcheckInsights } from "../../signals/ingredients"
import { IngredientsInsight } from "../../types/robotoff"
import { getLocale } from "../../localization"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import { EventState, EventType } from "../../constants"
import "./text-corrector"
import "../shared/zoomable-image"
import { fetchProduct } from "../../api/openfoodfacts"
import { ImageIngredientsProductType } from "../../types/openfoodfacts"
import { TextCorrectorEvent } from "../../types"
import { INPUT } from "../../styles/form"

@customElement("robotoff-ingredients")
export class RobotoffIngredients extends LitElement {
  static override styles = [
    BASE,
    INPUT,
    getButtonClasses([ButtonType.Cappucino, ButtonType.Success, ButtonType.Danger]),
    css`
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 4px;
      }
    `,
  ]
  @property({ type: String, attribute: "title-level" })
  titleLevel = "h2"

  @property({ type: String, attribute: "product-code" })
  productCode = ""

  @property({ type: String, attribute: "language-code" })
  languageCode = ""

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

  get _languageCode() {
    return this.languageCode || getLocale()
  }

  get _insight(): IngredientsInsight | undefined {
    const id: string | undefined = this._insigthIds[this._currentIndex]
    const value = ingredientSpellcheckInsights.getItem(id)
    return value
  }

  renderHeader() {
    return html`
      <div>
        <div>
          <h2>${msg("Help us fix errors in ingredients list")}</h2>
        </div>
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
      lc: this._languageCode,
      fields: ["image_ingredients_url", "product_name"],
    })

    this.productData = {
      imageUrl: result.product.image_ingredients_url,
      name: result.product.product_name,
    }
  }

  private _spellcheckTask = new Task(this, {
    task: async ([productCode]) => {
      const lang = this._languageCode
      this._insigthIds = []
      const insights = await fetchSpellcheckInsights(productCode ? productCode : undefined)
      this._insigthIds = insights
        .filter((insight) => insight.data.lang === lang)
        .map((insight) => insight.id)
      this.updateValue()
    },
    args: () => [this.productCode],
  })

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

  renderImage() {
    if (!this.fullImageUrl) {
      return nothing
    }
    return html`
      <div>
        <zoomable-image
          src=${this.fullImageUrl}
          fallbackSrc=${this.productData.imageUrl}
          .size="${{ width: "100%", "max-height": "40vh" }}"
        ></zoomable-image>
      </div>
    `
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
          <div class="container">
            ${this.renderHeader()}
            <div>
              ${this.renderImage()}
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
