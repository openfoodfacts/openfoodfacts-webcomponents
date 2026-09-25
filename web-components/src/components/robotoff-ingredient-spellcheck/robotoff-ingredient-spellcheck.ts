import { LitElement, html, css, nothing } from "lit"
import { LoadingWithTimeoutMixin } from "../../mixins/loading-with-timeout-mixin"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { localized, msg } from "@lit/localize"
import { Task } from "@lit/task"
import {
  fetchSpellcheckInsights,
  ingredientSpellcheckInsights,
} from "../../signals/ingredient-spellcheck"
import { AnnotationAnswer, type IngredientSpellcheckInsight } from "../../types/robotoff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import { EventState, EventType } from "../../constants"
import "./text-corrector"
import "../shared/zoomable-image"
import { fetchProduct, unselectProductImage } from "../../api/openfoodfacts"
import "../nutripatrol-flag-form/nutripatrol-flag-form"
import type { ImageIngredientsProductType } from "../../types/openfoodfacts"
import type {
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
@localized()
export class RobotoffIngredientSpellcheck extends DisplayProductLinkMixin(
  LoadingWithTimeoutMixin(LanguageCodesMixin(LitElement), undefined as AnnotationAnswer | undefined)
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

      .image-container-wrapper {
        position: relative;
        margin-bottom: 1rem;
      }

      .image-actions-bar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .action-chip-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.35rem 0.75rem;
        font-size: 0.82rem;
        border-radius: 1rem;
        border: 1px solid #ccc;
        background: #f7f7f7;
        color: #333;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .action-chip-btn:hover {
        background: #e9e9e9;
      }

      @media (prefers-color-scheme: dark) {
        .robotoff-ingredient-spellcheck-title {
          color: #eee;
        }
        .action-chip-btn {
          border-color: #555;
          background: #2b2b2b;
          color: #ddd;
        }
        .action-chip-btn:hover {
          background: #383838;
        }
      }

      .transient-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #262626;
        color: #fff;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        z-index: 9999;
        font-size: 0.92rem;
        font-weight: 500;
        animation: toastFadeIn 0.2s ease-in-out;
      }

      @keyframes toastFadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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
  productCode?: string = undefined

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

  @state()
  private _isFlagModalOpen = false

  @state()
  private _toastMessage: string | null = null

  private _toastTimer: ReturnType<typeof setTimeout> | null = null

  private _productDataCache = new Map<string, { imageUrl?: string; name?: string }>()

  private productDataCacheKey(insight: IngredientSpellcheckInsight) {
    return `${insight.barcode}:${insight.data.lang}`
  }

  showToast(message: string, duration = 2500) {
    this._toastMessage = message
    if (this._toastTimer) {
      clearTimeout(this._toastTimer)
    }
    this._toastTimer = setTimeout(() => {
      this._toastMessage = null
      this.requestUpdate()
    }, duration)
    this.requestUpdate()
  }

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
    void this.updateIngredientsImageUrl(insight)
  }

  /**
   * Updates the ingredients image URL based on the provided insight.
   * @param {IngredientSpellcheckInsight | undefined} insight - The insight to use for updating the image URL.
   */
  async updateIngredientsImageUrl(insight?: IngredientSpellcheckInsight) {
    if (!insight) {
      this.productData = { imageUrl: undefined, name: undefined }
      return
    }

    const cacheKey = this.productDataCacheKey(insight)
    if (this._productDataCache.has(cacheKey)) {
      this.productData = this._productDataCache.get(cacheKey)!
      return
    }

    try {
      const result = await fetchProduct<ImageIngredientsProductType>(insight.barcode, {
        lc: insight.data.lang,
        fields: [ProductFields.IMAGE_INGREDIENTS_URL, ProductFields.PRODUCT_NAME],
      })

      const data = {
        imageUrl: result.product?.image_ingredients_url,
        name: result.product?.product_name,
      }
      this._productDataCache.set(cacheKey, data)
      if (this._insight?.id === insight.id) {
        this.productData = data
      }
    } catch {
      if (this._insight?.id === insight.id) {
        this.productData = { imageUrl: undefined, name: undefined }
      }
    }
  }

  prefetchNextInsights() {
    const nextIndices = [this._currentIndex + 1, this._currentIndex + 2]
    for (const idx of nextIndices) {
      const id = this._insightIds[idx]
      if (!id) continue
      const nextInsight = ingredientSpellcheckInsights.getItem(id)
      if (!nextInsight) continue
      const cacheKey = this.productDataCacheKey(nextInsight)
      if (this._productDataCache.has(cacheKey)) continue

      void fetchProduct<ImageIngredientsProductType>(nextInsight.barcode, {
        lc: nextInsight.data.lang,
        fields: [ProductFields.IMAGE_INGREDIENTS_URL, ProductFields.PRODUCT_NAME],
      })
        .then((result) => {
          const data = {
            imageUrl: result.product?.image_ingredients_url,
            name: result.product?.product_name,
          }
          this._productDataCache.set(cacheKey, data)
          if (data.imageUrl) {
            const fullUrl = getFullImageUrl(data.imageUrl) ?? data.imageUrl
            const img = new Image()
            img.src = fullUrl
          }
        })
        .catch(() => {})
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
      this._insightIds = insights.map((insight) => insight.id)
      this.updateValue()
      this.prefetchNextInsights()
      this.dispatchIngredientSpellcheckStateEvent({
        state: this._insightIds.length ? EventState.HAS_DATA : EventState.NO_DATA,
      })
    },
    args: () => [this.productCode, ...this._languageCodes],
  })

  /**
   * Moves to the next insight and updates the value if not all insights are answered.
   */
  nextInsight() {
    this._currentIndex++
    if (!this.allInsightsAreAnswered) {
      this.updateValue()
      this.prefetchNextInsights()
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
   * Submits an annotation with optimistic UI.
   * Immediately advances to the next question and fires the API request in the background.
   * @param {TextCorrectorEvent} event - The event containing the annotation details.
   */
  submitAnnotation(event: TextCorrectorEvent) {
    const insight = this._insight
    if (!insight) {
      console.error("No insight found at index", this._currentIndex)
      return
    }

    const { annotation, correction } = event.detail
    const isSkip = annotation === AnnotationAnswer.SKIP
    const isLastInsight = this._currentIndex === this._insightIds.length - 1

    // Send the annotation to Robotoff API in background
    void robotoff
      .annotateIngredientSpellcheck(insight.id, annotation, correction)
      .then(() => {
        this.showToast(isSkip ? msg("Skipped") : msg("Correction saved!"))
        this.dispatchIngredientSpellcheckStateEvent({
          state: EventState.ANNOTATED,
          insightId: insight.id,
        })
        if (isLastInsight) {
          this.dispatchIngredientSpellcheckStateEvent({
            state: EventState.FINISHED,
            insightId: insight.id,
            ...event.detail,
          })
        }
      })
      .catch((error) => {
        console.error("Failed to submit annotation:", error)
        this.showToast(msg("Error saving annotation"), 4000)
        this.dispatchIngredientSpellcheckStateEvent({
          state: EventState.ERROR,
          insightId: insight.id,
        })
      })

    // Advance to next question immediately (optimistic UI)
    this.nextInsight()
  }

  /**
   * Unselects the current ingredient image on Open Food Facts
   */
  async onUnselectImage() {
    const insight = this._insight
    if (
      !insight ||
      !confirm(msg("Are you sure you want to unselect this image for ingredients?"))
    ) {
      return
    }

    const lang = insight.data.lang || "fr"
    const imageField = `ingredients_${lang}`
    let isLastInsight = false

    try {
      await unselectProductImage(insight.barcode, imageField)
      this._productDataCache.delete(this.productDataCacheKey(insight))
      this.showToast(msg("Image unselected"))
      if (this._insight?.id === insight.id) {
        isLastInsight = this._currentIndex === this._insightIds.length - 1
        this.nextInsight()
      }
    } catch (err) {
      console.error("Failed to unselect image:", err)
      this.showToast(msg("Failed to unselect image"), 4000)
      return
    }

    try {
      await robotoff.annotateIngredientSpellcheck(insight.id, AnnotationAnswer.SKIP)
      this.dispatchIngredientSpellcheckStateEvent({
        state: EventState.ANNOTATED,
        insightId: insight.id,
        annotation: AnnotationAnswer.SKIP,
      })
      if (isLastInsight) {
        this.dispatchIngredientSpellcheckStateEvent({
          state: EventState.FINISHED,
          insightId: insight.id,
        })
      }
    } catch (err) {
      console.error("Failed to submit annotation:", err)
      this.showToast(msg("Error saving annotation"), 4000)
      this.dispatchIngredientSpellcheckStateEvent({
        state: EventState.ERROR,
        insightId: insight.id,
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
    const insight = this._insight

    return html`
      <div class="image-container-wrapper">
        <zoomable-image
          src=${this.fullImageUrl}
          fallback-src=${this.productData.imageUrl ?? ""}
          .size="${{ width: "100%", height: "30vh" }}"
          show-buttons
        ></zoomable-image>
        <div class="image-actions-bar">
          <button
            type="button"
            class="action-chip-btn"
            @click=${() => (this._isFlagModalOpen = true)}
            title=${msg("Report problematic image")}
          >
            🚩 ${msg("Flag image")}
          </button>
          <button
            type="button"
            class="action-chip-btn"
            @click=${this.onUnselectImage}
            title=${msg("Unselect image")}
          >
            ✕ ${msg("Unselect image")}
          </button>
        </div>
        ${
          insight
            ? html`<nutripatrol-flag-form
                .barcode=${insight.barcode}
                type="image"
                .imageId=${insight.source_image ?? ""}
                ?open=${this._isFlagModalOpen}
                @close=${() => (this._isFlagModalOpen = false)}
              ></nutripatrol-flag-form>`
            : nothing
        }
      </div>
    `
  }

  /**
   * Renders the component based on the spellcheck task state.
   * @returns {TemplateResult} The rendered component.
   */
  override render() {
    return html`${this._spellcheckTask.render({
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
    })}${
      this._toastMessage ? html`<div class="transient-toast">${this._toastMessage}</div>` : nothing
    }`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-ingredient-spellcheck": RobotoffIngredientSpellcheck
  }
}
