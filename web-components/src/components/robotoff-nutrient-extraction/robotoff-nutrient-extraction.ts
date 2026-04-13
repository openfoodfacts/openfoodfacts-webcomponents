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
import { fetchProduct } from "../../api/openfoodfacts"
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
        align-items: center;
        margin-bottom: 1rem;
        background-color: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        padding-left: 1rem;
        padding-right: 1rem;
        padding-bottom: 1rem;
        box-sizing: border-box;
        max-width: ${IMAGE_MAX_WIDTH}px;
        width: 100%;
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
  annotatedIds: Set<string> = new Set()

  @state()
  currentInsightIndex: number = 0

  @state()
  private nutrimentsData?: NutrimentsProductType

  @state()
  private totalInsightsCount: number = 0

  private currentPage: number = 1

  private readonly pageSize: number = 10

  private fetchMoreInsightsPromise?: Promise<void>

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
      this.currentInsightIndex = 0
      this.currentPage = 1
      this.totalInsightsCount = 0
      this.insightsIds = []
      this.annotatedIds = new Set()

      // Keep country filtering optional; do not send lc as it can hide valid insights.
      const params: any = {
        count: this.pageSize,
        page: this.currentPage,
      }
      if (this.countryCode) {
        params.countries = this.countryCode
      }

      const [insightsResponse] = await Promise.all([
        fetchNutrientInsights(productCode, params),
        fetchNutrientsTaxonomies(),
        fetchNutrientsOrderByCountryCode(this.countryCode || this._countryCode),
      ])

      const insights = insightsResponse.insights
      this.totalInsightsCount = insightsResponse.count ?? insights.length

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

  private async fetchNextInsightsPage() {
    if (this.fetchMoreInsightsPromise) {
      return this.fetchMoreInsightsPromise
    }
    if (this.insightsIds.length >= this.totalInsightsCount) {
      return
    }

    this.fetchMoreInsightsPromise = (async () => {
      try {
        const nextPage = this.currentPage + 1
        const params: any = {
          count: this.pageSize,
          page: nextPage,
        }
        if (this.countryCode) {
          params.countries = this.countryCode
        }

        const response = await fetchNutrientInsights(this.productCode, params)
        this.totalInsightsCount = response.count ?? this.totalInsightsCount
        const existingIds = new Set(this.insightsIds)
        const nextIds = response.insights
          .map((insight) => insight.id)
          .filter((id) => !existingIds.has(id))

        if (nextIds.length > 0) {
          this.insightsIds = [...this.insightsIds, ...nextIds]
        }

        this.currentPage = nextPage
      } finally {
        this.fetchMoreInsightsPromise = undefined
      }
    })()

    return this.fetchMoreInsightsPromise
  }

  async loadInsight(index: number) {
    if (index >= this.insightsIds.length && this.insightsIds.length < this.totalInsightsCount) {
      await this.fetchNextInsightsPage()
    }

    if (index >= this.insightsIds.length) {
      this.emitNutrientEvent(EventState.FINISHED)
      return
    }

    const remainingBuffered = this.insightsIds.length - index
    if (remainingBuffered <= 5 && this.insightsIds.length < this.totalInsightsCount) {
      void this.fetchNextInsightsPage()
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

  renderImage(insight: NutrientsInsight) {
    if (!insight?.source_image) {
      return nothing
    }
    const imgUrl = getRobotoffImageUrl(insight.source_image)
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

    // Remove the annotated item from the list (like Questions does)
    const annotatedId = this.currentInsightId
    this.insightsIds = this.insightsIds.filter((id) => id !== annotatedId)
    this.annotatedIds.add(annotatedId)

    // Check if we need to fetch more (like Questions: if count > length && length <= 5)
    if (this.totalInsightsCount > this.insightsIds.length && this.insightsIds.length <= 5) {
      void this.fetchNextInsightsPage()
    }

    await this.loadInsight(this.currentInsightIndex)
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
    const remainingProducts = Math.max(this.totalInsightsCount - this.annotatedIds.size, 0)
    return html`
      <div>
        <h2>${msg("Help us correct the nutritional information")}</h2>
        <p>${msg("Remaining products")}: ${remainingProducts}</p>
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
          return html`
            <p>${msg("No more products available for this filter.")}</p>
            <p>${msg("Remaining products")}: 0</p>
            <slot name="no-insight"></slot>
          `
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
