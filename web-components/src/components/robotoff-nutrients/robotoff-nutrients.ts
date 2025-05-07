import { Task } from "@lit/task"
import { css, html, LitElement, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  annotateNutrients,
  fetchNutrientInsightsByProductCode,
  insight,
} from "../../signals/nutrients"
import "./robotoff-nutrients-table"
import "../shared/zoomable-image"
import "../shared/loader"

import { fetchNutrientsTaxonomies } from "../../signals/taxonomies"
import { NutrientsInsight, InsightAnnotationAnswer } from "../../types/robotoff"
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
 * @part messages-wrapper - The messages wrapper
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
  private nutrimentsData?: NutrimentsProductType
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
      if (!productCode) {
        return undefined
      }

      this.emitNutrientEvent(EventState.LOADING)

      await Promise.all([
        fetchNutrientInsightsByProductCode(productCode),
        fetchNutrientsTaxonomies(),
        fetchNutrientsOrderByCountryCode(countryCode.get()),
        this.getProductNutriments(productCode),
      ])

      const value = insight(productCode).get()
      this.emitNutrientEvent(value ? EventState.HAS_DATA : EventState.NO_DATA)
      return value
    },
    args: () => [this.productCode],
  })

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
    await annotateNutrients(event.detail)
    this.isSubmited = true
    this.emitNutrientEvent(EventState.ANNOTATED)
    // TODO : when we handle multiple insights, we need to check if there are more insights to annotate before emitting the FINISHED event
    this.emitNutrientEvent(EventState.FINISHED)
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

  override render() {
    return this._insightsTask.render({
      pending: () => html`<off-wc-loader></off-wc-loader>`,
      complete: (insight) => {
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
