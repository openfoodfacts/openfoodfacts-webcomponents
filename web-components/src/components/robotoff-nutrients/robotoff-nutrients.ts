import { Task } from "@lit/task"
import { css, html, LitElement, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  annotateNutrientsWithData,
  annotateNutrientWitoutData,
  fetchNutrientInsights,
  insightById,
} from "../../signals/nutrients"
import "./robotoff-nutrients-table"
import "../shared/zoomable-image"
import "../shared/loader"

import { fetchNutrientsTaxonomies } from "../../signals/taxonomies"
import { NutrientsInsight, InsightAnnotationAnswer, AnnotationAnswer } from "../../types/robotoff"
import { BASE } from "../../styles/base"
import { robotoffConfiguration } from "../../signals/robotoff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { FLEX } from "../../styles/utils"
import { EventState, EventType } from "../../constants"
import { BasicStateEventDetail } from "../../types"
import { NutrimentsProductType } from "../../types/openfoodfacts"
import { fetchProduct } from "../../api/openfoodfacts"
import { ProductFields } from "../../utils/openfoodfacts"
import { getLocale } from "../../localization"
import { fetchNutrientsOrderByCountryCode } from "../../signals/openfoodfacts"
import { countryCode } from "../../signals/app"

/**
 * Robotoff Nutrients component
 * @element robotoff-nutrients
 * @part nutrients - The nutrients component
 * @part nutrients-content-wrapper - The nutrients content wrapper
 */
@customElement("robotoff-nutrients")
export class RobotoffNutrients extends LitElement {
  static override styles = [
    BASE,
    FLEX,
    ...getButtonClasses([ButtonType.LINK]),

    css`
      .image-wrapper {
        position: sticky;
        z-index: 1;
        top: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
        background-color: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        padding-top: 1rem;
        padding-left: 1rem;
        padding-right: 1rem;
        box-sizing: border-box;
      }

      .nutrients-content-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        align-items: start;
        gap: 0.5rem 5rem;
      }

      .nutrients {
        display: flex;
      }
    `,
  ]

  /**
   * The product code to get the insights for
   * @type {string}
   */
  @property({ type: String, attribute: "product-code" })
  productCode = ""

  /**
   * Is the form submited
   * @type {boolean}
   */
  @state()
  isSubmited = false

  @state()
  insightsIds: string[] = []

  @state()
  currentInsightIndex: number = 0

  @state()
  private nutrimentsData?: NutrimentsProductType

  get currentInsightId() {
    return this.insightsIds[this.currentInsightIndex]
  }

  get currentInsight() {
    return insightById.getItem(this.currentInsightId)
  }

  /**
   * Emit the state event
   * @param {EventState} state
   */
  emitNutrientEvent(state: EventState) {
    const detail: BasicStateEventDetail = {
      state,
    }
    const event = new CustomEvent(EventType.NUTRIENT_STATE, {
      detail,
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  /**
   * Task to get the insights for the given product code
   * it will fetch the incomplete nutrients insights and the nutrients taxonomies
   * @type {Task}
   */
  private _insightsTask = new Task(this, {
    task: async ([productCode], {}) => {
      this.emitNutrientEvent(EventState.LOADING)
      const [insights] = await Promise.all([
        fetchNutrientInsights(productCode),
        fetchNutrientsTaxonomies(),
        fetchNutrientsOrderByCountryCode(countryCode.get()),
      ])

      this.insightsIds = insights.map((insight) => insight.id)
      if (!this.insightsIds.length) {
        this.emitNutrientEvent(EventState.NO_DATA)
        return
      }
      this.emitNutrientEvent(EventState.HAS_DATA)
      await this.loadInsight(0)
    },
    args: () => [this.productCode],
  })

  async loadInsight(index: number) {
    if (index >= this.insightsIds.length) {
      this.emitNutrientEvent(EventState.FINISHED)
      return
    }
    this.currentInsightIndex = index
    const insight = this.currentInsight
    await this.getProductNutriments(insight.barcode)
  }

  /**
   * Get the product nutriments
   * @param {string} productCode
   * @returns {Promise<NutrimentsProductType>}
   */
  async getProductNutriments(productCode: string) {
    this.nutrimentsData = undefined
    const result = await fetchProduct<NutrimentsProductType>(productCode, {
      fields: [ProductFields.NUTRIMENTS],
      lc: getLocale(),
    })
    this.nutrimentsData = result.product
    return result.product.nutriments
  }

  /**
   * Annotate the nutrients insights
   * @returns {Promise<void>}
   */
  async onSubmit(event: CustomEvent<InsightAnnotationAnswer>) {
    await annotateNutrientsWithData(event.detail)
    this.isSubmited = true
    this.emitNutrientEvent(EventState.ANNOTATED)
    this.loadInsight(this.currentInsightIndex + 1)
  }

  renderImage(insight: NutrientsInsight) {
    if (!insight?.source_image) {
      return nothing
    }
    const imgUrl = `${robotoffConfiguration.getItem("imgUrl")}${insight.source_image}`
    return html`
      <div class="image-wrapper">
        <zoomable-image
          src=${imgUrl}
          .size="${{
            height: "400px",
            "max-height": "35vh",
            width: "100%",
            "max-width": "500px",
          }}"
          show-buttons
        ></zoomable-image>
      </div>
    `
  }

  /**
   * Refuse the current insight
   */
  async onRefuse() {
    await annotateNutrientWitoutData(this.currentInsightId, AnnotationAnswer.REFUSE)
    await this.loadInsight(this.currentInsightIndex + 1)
  }

  /**
   * Skip the current insight
   */
  async onSkip() {
    await annotateNutrientWitoutData(this.currentInsightId, AnnotationAnswer.SKIP)
    await this.loadInsight(this.currentInsightIndex + 1)
  }

  override render() {
    return this._insightsTask.render({
      pending: () => html`<off-wc-loader></off-wc-loader>`,
      complete: () => {
        const insight = this.currentInsight
        if (!insight) {
          return html`<slot name="no-insight"></slot>`
        }
        return html`
          <div class="nutrients" part="nutrients">
            <div part="nutrients-content-wrapper" class="nutrients-content-wrapper">
              ${this.renderImage(insight as NutrientsInsight)}
              <robotoff-nutrients-table
                .nutrimentsData="${this.nutrimentsData}"
                .insight="${insight as NutrientsInsight}"
                @submit="${this.onSubmit}"
                @refuse="${this.onRefuse}"
                @skip="${this.onSkip}"
              ></robotoff-nutrients-table>
            </div>
          </div>
        `
      },
      error: (error) => html`<p>Error: ${error}</p>`,
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-nutrients": RobotoffNutrients
  }
}
