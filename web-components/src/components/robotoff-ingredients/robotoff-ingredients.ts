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
import { RobotoffIngredientsStateEventDetail, TextCorrectorEvent } from "../../types/ingredients"
import { INPUT } from "../../styles/form"
import { getValidHeadingLevel } from "../../utils/knowledge-panels/heading-utils"
import { sanitizeHtml } from "../../utils/html"

/**
 * RobotoffIngredients component
 *
 * @fires state - when the state of the component changes
 * @fires submit - when the user submits the form
 */
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
  /**
   * The HTML tag level for the title of the component.
   * @type {string}
   */
  @property({ type: String, attribute: "title-level" })
  titleLevel = "h2"

  /**
   * The product code for which the ingredients are being corrected.
   * @type {string}
   */
  @property({ type: String, attribute: "product-code" })
  productCode = ""

  /**
   * The language code for the product.
   * @type {string}
   */
  @property({ type: String, attribute: "language-code" })
  languageCode = ""

  /**
   * The current index of the insight being displayed.
   * @type {number}
   */
  @state()
  private _currentIndex = 0

  /**
   * An array of insight IDs for the product.
   * @type {string[]}
   */
  @state()
  private _insightIds: string[] = []

  /**
   * The product data, including the image URL and name.
   * @type {{ imageUrl?: string, name?: string }}
   */
  @state()
  private productData: {
    imageUrl?: string
    name?: string
  } = {}

  /**
   * Gets the full image URL by replacing the '400.jpg' suffix with 'full.jpg'.
   * @returns {string | undefined} The full image URL or undefined if no image URL is available.
   */
  get fullImageUrl() {
    return this.productData.imageUrl
      ? this.productData.imageUrl.replace(/400.jpg$/, "full.jpg")
      : undefined
  }

  /**
   * Gets the language code, defaulting to the locale if not set.
   * @returns {string} The language code.
   */
  get _languageCode() {
    return this.languageCode || getLocale()
  }

  /**
   * Checks if all insights have been answered.
   * @returns {boolean} True if all insights are answered, false otherwise.
   */
  get allInsightsAreAnswered() {
    return this._currentIndex >= this._insightIds.length
  }

  /**
   * Gets the current insight based on the current index.
   * @returns {IngredientsInsight | undefined} The current insight or undefined if no insight is available.
   */
  get _insight(): IngredientsInsight | undefined {
    const id: string | undefined = this._insightIds[this._currentIndex]
    const value = ingredientSpellcheckInsights.getItem(id)
    return value
  }

  /**
   * Renders the header of the component.
   * @returns {TemplateResult} The rendered header.
   */
  renderHeader() {
    const headingLevel = getValidHeadingLevel(this.titleLevel)
    const title = `<${headingLevel}>${msg("Help us fix errors in ingredients list")}</${headingLevel}>`
    return html`
      <div>
        <div>${sanitizeHtml(title)}</div>
      </div>
    `
  }

  /**
   * Updates the value based on the current insight.
   */
  updateValue() {
    const insight = this._insight
    this.updateIngredientsImageUrl(insight)
  }

  /**
   * Updates the ingredients image URL based on the provided insight.
   * @param {IngredientsInsight | undefined} insight - The insight to use for updating the image URL.
   */
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

  /**
   * A task to fetch spellcheck insights for the product.
   * @type {Task}
   */
  private _spellcheckTask = new Task(this, {
    task: async ([productCode]) => {
      const lang = this._languageCode
      this._insightIds = []
      this._currentIndex = 0
      this.dispatchIngredientsStateEvent({
        state: EventState.LOADING,
      })
      const insights = await fetchSpellcheckInsights(productCode ? productCode : undefined)
      this._insightIds = insights
        // Currently we filter by lang here but we should do it in the API when is available
        .filter((insight) => insight.data.lang === lang)
        .map((insight) => insight.id)
      this.updateValue()
      this.dispatchIngredientsStateEvent({
        state: this._insightIds.length ? EventState.HAS_DATA : EventState.NO_DATA,
      })
    },
    args: () => [this.productCode],
  })

  /**
   * Moves to the next insight and updates the value if not all insights are answered.
   */
  nextInsight() {
    this._currentIndex++
    if (!this.allInsightsAreAnswered) {
      this.updateValue()
    }
  }

  /**
   * Dispatches an ingredients state event with the provided detail.
   * @param {RobotoffIngredientsStateEventDetail} detail - The detail of the event.
   */
  dispatchIngredientsStateEvent(detail: RobotoffIngredientsStateEventDetail) {
    this.dispatchEvent(
      new CustomEvent<RobotoffIngredientsStateEventDetail>(EventType.INGREDIENTS_STATE, {
        bubbles: true,
        composed: true,
        detail: {
          productCode: this.productCode,
          ...detail,
        },
      })
    )
  }

  /**
   * Submits an annotation based on the provided event.
   * @param {TextCorrectorEvent} event - The event containing the annotation details.
   */
  async submitAnnotation(event: TextCorrectorEvent) {
    const insight = this._insight
    if (!insight) {
      console.error("No insight found at index", this._currentIndex)
      return
    }

    // Send the annotation to Robotoff API
    await robotoff.annotateIngredients(insight.id, event.detail.annotation, event.detail.correction)

    // Move to next insight or finish
    this.nextInsight()

    this.dispatchIngredientsStateEvent({
      state: this.allInsightsAreAnswered ? EventState.ANNOTATED : EventState.ANSWERED,
      insightId: insight.id,
      ...event.detail,
    })
  }

  /**
   * Renders the image based on the full image URL.
   * @returns {TemplateResult | typeof nothing} The rendered image or nothing if no image URL is available.
   */
  renderImage() {
    if (!this.fullImageUrl) {
      return nothing
    }
    return html`
      <div>
        <zoomable-image
          src=${this.fullImageUrl}
          fallback-src=${this.productData.imageUrl ?? ""}
          .size="${{ width: "100%", height: "30vh" }}"
        ></zoomable-image>
      </div>
    `
  }
  /**
   * Renders the component based on the spellcheck task state.
   * @returns {TemplateResult} The rendered component.
   */
  override render() {
    return this._spellcheckTask.render({
      pending: () => html`<off-wc-loader></off-wc-loader>`,
      complete: () => {
        const insight = this._insight
        if (this.allInsightsAreAnswered) {
          return html`<slot name="complete">
            <p>${msg("All insights have been answered! Thanks for your help!")}</p>
          </slot>`
        }
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
