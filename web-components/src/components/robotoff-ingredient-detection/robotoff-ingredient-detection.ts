/**
 * RobotoffIngredientDetection Component
 *
 * This component is responsible for managing ingredient detection insights
 * for the Robotoff application. It fetches ingredient detection insights
 * and delegates the form interaction to the robotoff-ingredient-detection-form component.
 *
 * @element robotoff-ingredient-detection
 */

import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { AnnotationAnswer, IngredientDetectionInsight } from "../../types/robotoff"
import { Task } from "@lit/task"
import { localized } from "@lit/localize"
import "../shared/loader"
import {
  fetchIngredientsDetectionInsights,
  ingredientDetectionInsights,
} from "../../signals/ingredient-detection"
import robotoff from "../../api/robotoff"
import "./robotoff-ingredient-detection-form"
import { LoadingWithTimeoutMixin } from "../../mixins/loading-with-timeout-mixin"
import { LanguageCodesMixin } from "../../mixins/language-codes-mixin"
import { EventType, EventState } from "../../constants"
import { RobotoffIngredientsStateEventDetail } from "../../types/ingredient-spellcheck"

/**
 * RobotoffIngredientDetection Component
 *
 * This component is responsible for managing ingredient detection insights
 * for the Robotoff application. It fetches ingredient detection insights
 * and delegates the form interaction to the robotoff-ingredient-detection-form component.
 *
 * @element robotoff-ingredient-detection
 * @fires robotoff-ingredients-state - Indicates the state of the ingredient detection process.
 */
@customElement("robotoff-ingredient-detection")
@localized()
export class RobotoffIngredientDetection extends LanguageCodesMixin(
  LoadingWithTimeoutMixin(LitElement)
) {
  static override styles = [
    css`
      :host {
        display: block;
        max-width: 800px;
        width: 100%;
      }
    `,
  ]

  /**
   * Number of predictions to fetch
   * @type {number}
   */
  @property({ type: Number })
  count: number = 100

  /**
   * Current page number for pagination
   * @type {number}
   */
  @property({ type: Number })
  page: number = 1

  /**
   * Barcode of the product
   * @type {string}
   */
  @property({ type: String, attribute: "product-code", reflect: true })
  productCode?: string = undefined

  /**
   * Current index of the insight
   * @type {number}
   */
  @state()
  index = 0

  /**
   * List of insight ids
   * @type {string[]}
   */
  @state()
  insightIds: string[] = []

  /**
   * Dispatches an ingredient detection state event with the provided detail.
   * @param {RobotoffIngredientsStateEventDetail} detail - The detail of the event.
   */
  dispatchIngredientDetectionStateEvent(detail: RobotoffIngredientsStateEventDetail) {
    this.dispatchEvent(
      new CustomEvent<RobotoffIngredientsStateEventDetail>(EventType.INGREDIENT_DETECTION_STATE, {
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
   * Gets all insights by mapping insight IDs to their corresponding insight objects
   * @returns {IngredientDetectionInsight[]} Array of insight objects
   */
  get insights() {
    return this.insightIds.map((id) => ingredientDetectionInsights.getItem(id))
  }

  /**
   * Gets the current insight based on the current index
   * @returns {IngredientDetectionInsight|undefined} The current insight or undefined if not found
   */
  get currentInsight() {
    return this.insights[this.index]
  }

  /**
   * Task for fetching ingredient detection insights
   * Handles the asynchronous fetching of insights and updates the component state
   */
  private insightsTask = new Task(this, {
    task: async ([count, page, productCode], {}) => {
      this.insightIds = []

      const response = await fetchIngredientsDetectionInsights(productCode, {
        count,
        page,
        // use _languageCodes instead of languageCodes to get fallback language
        lc: this._languageCodes,
      })
      this.insightIds = response.map((insight) => insight.id)
      this.dispatchIngredientDetectionStateEvent({
        state: this.insightIds.length ? EventState.HAS_DATA : EventState.NO_DATA,
      })
      this.setIndex(0)
      return response
    },
    // use languageCode to avoid fallback language
    args: () => [this.count, this.page, this.productCode, this.languageCodes],
  })

  /**
   * Sets the current index and updates the component state
   * @param {number} index - The index to set
   */
  async setIndex(index: number) {
    this.index = index
  }

  /**
   * Renders the component
   * @returns {TemplateResult}
   */
  override render() {
    return this.insightsTask.render({
      pending: () => html`<off-wc-loading></off-wc-loading>`,
      complete: () => {
        const insight = this.currentInsight

        if (!insight) {
          return nothing
        }

        return this.renderInsight(insight)
      },
      error: (error: unknown) => html`<p>Error: ${String(error)}</p>`,
    })
  }

  /**
   * Renders an ingredient detection insight
   * @param {IngredientDetectionInsight} insight - The insight to render
   * @returns {TemplateResult}
   */
  private renderInsight(insight: IngredientDetectionInsight) {
    return html`
      <robotoff-ingredient-detection-form
        .insight=${insight}
        .loading=${this.loading as AnnotationAnswer | undefined}
        @submit=${this.onFormSubmit}
      ></robotoff-ingredient-detection-form>
    `
  }

  /**
   * Handles the form submit event from the form component
   * @param {CustomEvent} event - The submit event
   */
  onFormSubmit(event: CustomEvent) {
    const { insightId, value, data } = event.detail

    this.showLoading(value)
    robotoff.annotateIngredientDetection(insightId, value, data)
    this.hideLoading()
    this.dispatchIngredientDetectionStateEvent({
      state: EventState.ANNOTATED,
    })
    const newIndex = this.index + 1
    this.setIndex(newIndex)
    if (newIndex >= this.insights.length) {
      this.dispatchIngredientDetectionStateEvent({
        state: EventState.FINISHED,
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-ingredient-detection": RobotoffIngredientDetection
  }
}
