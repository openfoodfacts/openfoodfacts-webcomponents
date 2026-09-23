import { Task } from "@lit/task"
import { css, html, LitElement, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  annotateNutrientsWithData,
  annotateNutrientWithoutData,
  fetchNutrientInsights,
  insightById,
} from "../../signals/nutrient-extraction"
import "./robotoff-nutrient-extraction-form"
import "../shared/zoomable-image"
import "../shared/loader"

import { fetchNutrientsTaxonomies } from "../../signals/taxonomies"
import {
  type NutrientsInsight,
  type InsightAnnotationAnswer,
  AnnotationAnswer,
} from "../../types/robotoff"
import { BASE } from "../../styles/base"
import { getRobotoffImageUrl } from "../../signals/robotoff"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { FLEX } from "../../styles/utils"
import { EventState, EventType } from "../../constants"
import type { BasicStateEventDetail } from "../../types"
import type { NutrimentsProductType } from "../../types/openfoodfacts"
import { fetchProduct, unselectProductImage } from "../../api/openfoodfacts"
import "../nutripatrol-flag-form/nutripatrol-flag-form"
import { ProductFields } from "../../utils/openfoodfacts"
import { fetchNutrientsOrderByCountryCode } from "../../signals/openfoodfacts"
import { LoadingWithTimeoutMixin } from "../../mixins/loading-with-timeout-mixin"
import { ifDefined } from "lit-html/directives/if-defined.js"
import { Breakpoints } from "../../utils/breakpoints"
import { LanguageCodesMixin } from "../../mixins/language-codes-mixin"
import { CountryCodeMixin } from "../../mixins/country-codes-mixin"
import { DisplayProductLinkMixin } from "../../mixins/display-product-link-mixin"
import { localized, msg } from "@lit/localize"
import { languageCode } from "../../signals/app"

const IMAGE_MAX_WIDTH = 700
/**
 * Robotoff Nutrients component
 * @element robotoff-nutrient-extraction
 * @part nutrients - The nutrients component
 * @part nutrients-content-wrapper - The nutrients content wrapper
 */
@customElement("robotoff-nutrient-extraction")
@localized()
export class RobotoffNutrientExtraction extends DisplayProductLinkMixin(
  LanguageCodesMixin(
    CountryCodeMixin(LoadingWithTimeoutMixin(LitElement, undefined as AnnotationAnswer | undefined))
  )
) {
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
        flex-direction: column;
        align-items: center;
        margin-bottom: 1rem;
        background-color: var(--off-card-bg, white);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        padding-left: 1rem;
        padding-right: 1rem;
        padding-bottom: 1rem;
        box-sizing: border-box;
        max-width: ${IMAGE_MAX_WIDTH}px;
        width: 100%;
      }

      @media (prefers-color-scheme: dark) {
        .image-wrapper {
          background-color: var(--off-card-bg, #1e1e1e);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.05);
        }
      }

      .image-actions-bar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        width: 100%;
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
        .action-chip-btn {
          border-color: #555;
          background: #2b2b2b;
          color: #ddd;
        }
        .action-chip-btn:hover {
          background: #383838;
        }
      }

      .nutrients {
        container-type: inline-size;
      }

      .nutrients-content-wrapper {
        position: relative;
        display: flex;
        align-items: start;
        gap: 0.5rem 5rem;
      }

      @container (max-width: ${Breakpoints.MD}px) {
        .nutrients-content-wrapper {
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      }
      .nutrients product-link-button {
        margin-bottom: 1rem;
      }
    `,
  ]

  /**
   * The product code to get the insights for
   * @type {string}
   */
  @property({ type: String, attribute: "product-code", reflect: true })
  productCode?: string = undefined

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
        fetchNutrientInsights(productCode, {
          lc: this._languageCodes,
        }),
        fetchNutrientsTaxonomies(),
        fetchNutrientsOrderByCountryCode(this._countryCode),
      ])

      this.insightsIds = insights.map((insight) => insight.id)
      if (!this.insightsIds.length) {
        this.emitNutrientEvent(EventState.NO_DATA)
        return
      }
      this.emitNutrientEvent(EventState.HAS_DATA)
      await this.loadInsight(0)
    },
    args: () => [this.productCode, this.countryCode, ...this._languageCodes],
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
      lc: languageCode.get(),
    })
    this.nutrimentsData = result.product
    return result.product.nutriments
  }

  @state()
  private _isFlagModalOpen = false

  async onUnselectImage(insight: NutrientsInsight) {
    if (!confirm(msg("Are you sure you want to unselect this image for nutrition?"))) {
      return
    }
    try {
      await unselectProductImage(insight.barcode, "nutrition")
      await this.onSkip()
    } catch (err) {
      console.error("Failed to unselect image", err)
    }
  }

  renderImage(insight: NutrientsInsight) {
    if (!insight?.source_image) {
      return nothing
    }
    const imgUrl = getRobotoffImageUrl(insight.source_image)
    const file = insight.source_image.split("/").pop() ?? ""
    const imageId = file.replace(/\..+$/, "")

    return html`
      <div class="image-wrapper">
        <zoomable-image
          src=${imgUrl}
          .size="${{
            height: "35vh",
            width: "100%",
            "max-width": `${IMAGE_MAX_WIDTH}px`,
          }}"
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
            @click=${() => this.onUnselectImage(insight)}
            title=${msg("Unselect image")}
          >
            ✕ ${msg("Unselect image")}
          </button>
        </div>
        <nutripatrol-flag-form
          .barcode=${insight.barcode}
          type="image"
          .imageId=${imageId}
          ?open=${this._isFlagModalOpen}
          @close=${() => (this._isFlagModalOpen = false)}
        ></nutripatrol-flag-form>
      </div>
    `
  }

  /**
   * After the insight has been annotated
   * Remove Loading state and emit event annotated
   * Load the next insight
   * @returns {Promise<void>}
   */
  async afterInsightAnnotation() {
    await this.hideLoading()
    this.emitNutrientEvent(EventState.ANNOTATED)
    this.loadInsight(this.currentInsightIndex + 1)
  }

  /**
   * Annotate the nutrients insights
   * @returns {Promise<void>}
   */
  async onSubmit(event: CustomEvent<InsightAnnotationAnswer>) {
    this.showLoading(AnnotationAnswer.ACCEPT_AND_ADD_DATA)
    await annotateNutrientsWithData(event.detail)
    await this.afterInsightAnnotation()
  }

  /**
   * Refuse the current insight
   */
  async onRefuse() {
    this.showLoading(AnnotationAnswer.REFUSE)
    await annotateNutrientWithoutData(this.currentInsightId, AnnotationAnswer.REFUSE)
    await this.afterInsightAnnotation()
  }

  /**
   * Skip the current insight
   */
  async onSkip() {
    this.showLoading(AnnotationAnswer.SKIP)
    await annotateNutrientWithoutData(this.currentInsightId, AnnotationAnswer.SKIP)
    await this.afterInsightAnnotation()
  }
  renderHeader(insight: NutrientsInsight) {
    return html`
      <div>
        <h2>${msg("Help us correct the nutritional information")}</h2>
        ${this.renderProductLink(insight.barcode)}
      </div>
    `
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
            ${this.renderHeader(insight)}
            <div part="nutrients-content-wrapper" class="nutrients-content-wrapper">
              ${this.renderImage(insight as NutrientsInsight)}
              <robotoff-nutrient-extraction-form
                loading=${ifDefined(this.loading) as AnnotationAnswer}
                .nutrimentsData="${this.nutrimentsData}"
                .insight="${insight as NutrientsInsight}"
                @submit="${this.onSubmit}"
                @refuse="${this.onRefuse}"
                @skip="${this.onSkip}"
              ></robotoff-nutrient-extraction-form>
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
    "robotoff-nutrient-extraction": RobotoffNutrientExtraction
  }
}
