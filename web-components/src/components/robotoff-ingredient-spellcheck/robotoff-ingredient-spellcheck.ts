import { LitElement, html, css, nothing } from "lit"
import { LoadingWithTimeoutMixin } from "../../mixins/loading-with-timeout-mixin"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { Task } from "@lit/task"
import {
  fetchSpellcheckInsights,
  ingredientSpellcheckInsights,
} from "../../signals/ingredient-spellcheck"
import { AnnotationAnswer, IngredientSpellcheckInsight } from "../../types/robotoff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import { EventState, EventType } from "../../constants"
import "./text-corrector"
import "../shared/zoomable-image"
import { fetchProduct } from "../../api/openfoodfacts"
import { ImageIngredientsProductType } from "../../types/openfoodfacts"
import {
  RobotoffIngredientsStateEventDetail,
  TextCorrectorEvent,
} from "../../types/ingredient-spellcheck"
import { INPUT } from "../../styles/form"
import { getValidHeadingLevel } from "../../utils/knowledge-panels/heading-utils"
import { sanitizeHtml } from "../../utils/html"
import { getFullImageUrl, ProductFields } from "../../utils/openfoodfacts"
import { mobileAndTabletCheck } from "../../utils/breakpoints"
import { ifDefined } from "lit/directives/if-defined.js"
import { LanguageCodesMixin } from "../../mixins/language-codes-mixin"
import { DisplayProductLinkMixin } from "../../mixins/display-product-link-mixin"

/**
 * RobotoffIngredients component
 * It allows the user to correct the ingredients list of a product
 * with the help of robotoff that suggests corrections.
 * It handle the data fetching and the state management.
 * It also handle the user interactions and the form submission.
 * It uses the `text-corrector` component to handle the text correction.
 * @element robotoff-ingredient-spellcheck
 * @fires state - when the state of the component changes
 * @fires submit - when the user submits the form
 * @slot complete - The content to display when the component is complete
 * @slot pending - The content to display when the component is pending
 */
@customElement("robotoff-ingredient-spellcheck")
export class RobotoffIngredientSpellcheck extends DisplayProductLinkMixin(
  LoadingWithTimeoutMixin(LanguageCodesMixin(LitElement))
) {
  static override styles = [
    BASE,
    INPUT,
    getButtonClasses([ButtonType.Cappucino, ButtonType.Success, ButtonType.Danger]),
    css`
      .robotoff-ingredient-spellcheck {
        max-width: 800px;
        margin: 0 auto;
        border-radius: 4px;
        box-sizing: border-box;
      }

      .robotoff-ingredient-spellcheck-title {
        margin-top: 0;
        margin-bottom: 1rem;
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
  @property({ type: String, attribute: "product-code", reflect: true })
  productCode = ""

  /**
   * Enables keyboard mode for the component.
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "enable-keyboard-mode" })
  enableKeyboardMode = false

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
    return getFullImageUrl(this.productData.imageUrl)
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
   * @returns {IngredientSpellcheckInsight | undefined} The current insight or undefined if no insight is available.
   */
  get _insight(): IngredientSpellcheckInsight | undefined {
    const id: string | undefined = this._insightIds[this._currentIndex]
    const value = ingredientSpellcheckInsights.getItem(id)
    return value
  }

  /**
   * Gets the value of enableKeyboardMode, considering mobile and tablet devices.
   */
  get _enable_keyboard_mode() {
    // Disable keyboard mode on mobile and tablet devices
    return this.enableKeyboardMode ? !mobileAndTabletCheck() : false
  }

  /**
   * Renders the header of the component.
   * @returns {TemplateResult} The rendered header.
   */
  renderHeader() {
    const headingLevel = getValidHeadingLevel(this.titleLevel)
    const title = `<${headingLevel} class="robotoff-ingredient-spellcheck-title">${msg("Help us fix errors in ingredients list")}</${headingLevel}>`
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
   * @param {IngredientSpellcheckInsight | undefined} insight - The insight to use for updating the image URL.
   */
  async updateIngredientsImageUrl(insight?: IngredientSpellcheckInsight) {
    if (!insight) {
      this.productData.imageUrl = undefined
      this.productData.name = undefined
      return
    }
    const result = await fetchProduct<ImageIngredientsProductType>(insight.barcode, {
      lc: insight.data.lang,
      fields: [ProductFields.IMAGE_INGREDIENTS_URL, ProductFields.PRODUCT_NAME],
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
      this._insightIds = []
      this._currentIndex = 0
      this.dispatchIngredientSpellcheckStateEvent({
        state: EventState.LOADING,
      })
      const insights = await fetchSpellcheckInsights(productCode ? productCode : undefined, {
        lc: this._languageCodes,
      })
      this._insightIds = insights
        // Currently we filter by lang here but we should do it in the API when is available
        .map((insight) => insight.id)
      this.updateValue()
      this.dispatchIngredientSpellcheckStateEvent({
        state: this._insightIds.length ? EventState.HAS_DATA : EventState.NO_DATA,
      })
    },
    args: () => [this.productCode, this.languageCodes],
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
   * Dispatches an ingredient spellcheck state event with the provided detail.
   * @param {RobotoffIngredientsStateEventDetail} detail - The detail of the event.
   */
  dispatchIngredientSpellcheckStateEvent(detail: RobotoffIngredientsStateEventDetail) {
    this.dispatchEvent(
      new CustomEvent<RobotoffIngredientsStateEventDetail>(EventType.INGREDIENT_SPELLCHECK_STATE, {
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
   * After the insight has been annotated
   * Remove Loading state and emit event annotated
   * Load the next insight
   * @returns {Promise<void>}
   */
  async afterInsightAnnotation() {
    await this.hideLoading()
    this.dispatchIngredientSpellcheckStateEvent({
      state: EventState.ANNOTATED,
    })
    this.nextInsight()
  }

  /**
   * Submits an annotation based on the provided event.
   * @param {TextCorrectorEvent} event - The event containing the annotation details.
   */
  async submitAnnotation(event: TextCorrectorEvent) {
    this.showLoading(event.detail.annotation)
    const insight = this._insight
    if (!insight) {
      console.error("No insight found at index", this._currentIndex)
      return
    }

    // Send the annotation to Robotoff API
    await robotoff.annotateIngredientSpellcheck(
      insight.id,
      event.detail.annotation,
      event.detail.correction
    )

    await this.afterInsightAnnotation()

    if (this.allInsightsAreAnswered) {
      this.dispatchIngredientSpellcheckStateEvent({
        state: EventState.FINISHED,
        insightId: insight.id,
        ...event.detail,
      })
    }
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
          show-buttons
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
      pending: () => html`<slot name="pending"><off-wc-loader></off-wc-loader></slot>`,
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

        const correction = insight.data.correction
        const original = insight.data.original

        return html`
          <div class="robotoff-ingredient-spellcheck">
            ${this.renderHeader()}
            <div>
              ${this.renderProductLink(insight.barcode)} ${this.renderImage()}
              <div>
                <text-corrector
                  loading=${ifDefined(this.loading) as AnnotationAnswer}
                  correction=${correction}
                  original=${original}
                  @save=${this.submitAnnotation}
                  ?enable-keyboard-mode=${this._enable_keyboard_mode}
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
    "robotoff-ingredient-spellcheck": RobotoffIngredientSpellcheck
  }
}
