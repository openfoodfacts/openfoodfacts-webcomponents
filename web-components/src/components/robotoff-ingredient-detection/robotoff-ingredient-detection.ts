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
import { IngredientDetectionInsight } from "../../types/robotoff"
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

@customElement("robotoff-ingredient-detection")
@localized()
export class RobotoffIngredientDetection extends LoadingWithTimeoutMixin(LitElement) {
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

  get insights() {
    return this.insightIds.map((id) => ingredientDetectionInsights.getItem(id))
  }

  get currentInsight() {
    return this.insights[this.index]
  }

  private insightsTask = new Task(this, {
    task: async ([count, page, productCode], {}) => {
      this.insightIds = []

      const response = await fetchIngredientsDetectionInsights(productCode, {
        count,
        page,
      })
      this.insightIds = response.map((insight) => insight.id)
      this.setIndex(0)
      return response
    },
    args: () => [this.count, this.page, this.productCode],
  })

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
        .loading=${this.loading}
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
    this.setIndex(this.index + 1)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-ingredient-detection": RobotoffIngredientDetection
  }
}
