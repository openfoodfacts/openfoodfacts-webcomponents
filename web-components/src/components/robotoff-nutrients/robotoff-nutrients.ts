import { Task } from "@lit/task"
import { css, html, LitElement, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { annotateNutrients, fetchInsightsByProductCode, insight } from "../../signals/nutrients"
import "./robotoff-nutrients-table"
import "../shared/zoomable-image"
import "../shared/loader"

import { fetchNutrientsTaxonomies } from "../../signals/taxonomies"
import { Insight, InsightAnnotationAnswer } from "../../types/robotoff"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
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
      .messages-wrapper p {
        max-width: 400px;
      }

      .image-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1rem;
      }

      .nutrients-content-wrapper {
        gap: 2rem 5rem;
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
   * Show messages
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "show-messages" })
  showMessages = false

  /**
   * Is the form submited
   * @type {boolean}
   */
  @state()
  isSubmited = false

  /**
   * Show success message
   * @type {boolean}
   */
  @state()
  showSuccessMessage = false

  /**
   * Do we show the image of the product by default
   */
  @property({ type: Boolean, attribute: "show-image" })
  showImage = true

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
   * Render messages
   * @returns {TemplateResult | typeof nothing}
   */
  renderMessages() {
    if (!this.showMessages) {
      return nothing
    }

    if (!this.isSubmited) {
      return msg(
        html`Open food facts lives thanks to its community.<br />
          Can you help us validate nutritional information?`
      )
    }
    if (this.showSuccessMessage) {
      return msg("Thank you for your contribution!")
    }
    return nothing
  }

  /**
   * Annotate the nutrients insights
   * @returns {Promise<void>}
   */
  async onSubmit(event: CustomEvent<InsightAnnotationAnswer>) {
    await annotateNutrients(event.detail)
    this.isSubmited = true
    this.showSuccessMessage = true
    this.emitNutrientEvent(EventState.ANNOTATED)
  }

  hideImage() {
    this.showImage = false
  }
  displayImage() {
    this.showImage = true
  }

  renderImage(insight: Insight) {
    if (!insight?.source_image) {
      return nothing
    }
    const imgUrl = `${robotoffConfiguration.getItem("imgUrl")}${insight.source_image}`
    return html`
      <div>
        <div class="flex justify-center">
          ${this.showImage
            ? html`<button class="link-button" @click=${this.hideImage}>
                ${msg("Hide image")}
              </button>`
            : html`<button class="link-button is-closed" @click=${this.displayImage}>
                ${msg("Voir image")}
              </button>`}
        </div>

        ${this.showImage
          ? html`<div class="image-wrapper">
              <zoomable-image src=${imgUrl} .size="${{ height: "350px" }}"></zoomable-image>
            </div>`
          : nothing}
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
          <div part="nutrients">
            <div part="messages-wrapper" class="messages-wrapper">
              <p>
                <i>${this.renderMessages()}</i>
              </p>
            </div>
            <div part="nutrients-content-wrapper" class="nutrients-content-wrapper">
              ${this.renderImage(insight as Insight)}
              <robotoff-nutrients-table
                .insight="${insight as Insight}"
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
