import { Task } from "@lit/task"
import { css, html, LitElement, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { annotateNutrients, fetchInsightsByProductCode, insight } from "../../signals/nutrients"
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
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
      }

      .nutrients-content-wrapper {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        align-items: center;
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

      await Promise.all([fetchInsightsByProductCode(productCode), fetchNutrientsTaxonomies()])

      const value = insight(productCode).get()
      this.emitNutrientEvent(value ? EventState.HAS_DATA : EventState.NO_DATA)
      return value
    },
    args: () => [this.productCode],
  })

  /**
   * Annotate the nutrients insights
   * @returns {Promise<void>}
   */
  async onSubmit(event: CustomEvent<InsightAnnotationAnswer>) {
    await annotateNutrients(event.detail)
    this.isSubmited = true
    this.emitNutrientEvent(EventState.ANNOTATED)
  }

  renderImage(insight: NutrientsInsight) {
    if (!insight?.source_image) {
      return nothing
    }
    const imgUrl = `${robotoffConfiguration.getItem("imgUrl")}${insight.source_image}`
    return html`
      <div>
        <div class="image-wrapper">
          <zoomable-image
            src=${imgUrl}
            .size="${{
              height: "400px",
              width: "100%",
              "max-width": "500px",
            }}"
            show-buttons
          ></zoomable-image>
        </div>
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
