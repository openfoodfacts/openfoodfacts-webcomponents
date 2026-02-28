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
import { FLEX, RELATIVE } from "../../styles/utils"
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
import { clickOutside } from "../../directives/click-outside"
import "../shared/info-button"
import { POPOVER } from "../../styles/popover"
import { darkModeListener } from "../../utils/dark-mode-listener"
import { classMap } from "lit-html/directives/class-map.js"

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
  isDarkMode = darkModeListener.darkMode
  private _darkModeCb = (isDark: boolean) => {
    this.isDarkMode = isDark
    this.requestUpdate()
  }

  override connectedCallback() {
    super.connectedCallback()
    darkModeListener.subscribe(this._darkModeCb)
  }

  override disconnectedCallback() {
    darkModeListener.unsubscribe(this._darkModeCb)
    super.disconnectedCallback()
  }
  static override styles = [
    BASE,
    FLEX,
    POPOVER,
    RELATIVE,
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

      .date {
        padding-top: 15px;
        font-size: medium;
        font-weight: 500;
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

      .info-popover {
        z-index: 2;
        min-width: 200px;
      }

      .info-button-wrapper {
        display: flex-start;
        position: absolute;
      }

      .relative {
        position: relative;
        margin-top: 6px;
        margin-bottom: 4px;
        display: flex;
        align-items: start;
        justify-content: end;
        width: 100%;
        right: 1px;
        top: 1px;
        z-index: 10;
      }

      .dark-mode {
        background-color: #1e1e1e;
        color: #ffffff;
        border: 1px solid #333;
      }

      .dark-mode .popover-content {
        background-color: #1e1e1e;
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

  @state()
  private uploaded_Date: string = ""

  @state()
  showInfoPopover: boolean = false

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
      fields: [ProductFields.NUTRIMENTS, ProductFields.IMAGES],
      lc: languageCode.get(),
    })
    this.nutrimentsData = result.product
    const images = result?.product?.images
    const key = images["nutrition_en"]?.imgid
    const uploaded_t = key ? images[key]?.uploaded_t : undefined

    this.uploaded_Date = this.getUploadedTime(uploaded_t)
    return result.product.nutriments
  }

  /**
   * Toggles the info popover.
   */
  toggleInfoPopover() {
    this.showInfoPopover = !this.showInfoPopover
  }

  /**
   * Closes the info popover.
   */
  closeInfoPopover() {
    this.showInfoPopover = false
  }

  getUploadedTime = (data: number | undefined) =>
    data
      ? new Date(data * 1000).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : ""

  renderImage(insight: NutrientsInsight) {
    if (!insight?.source_image) {
      return nothing
    }
    const imgUrl = getRobotoffImageUrl(insight.source_image)
    return html`
      <div class="image-wrapper">
        <div class="relative">
          <div class="info-button-wrapper">
            <info-button @click=${this.toggleInfoPopover} size="sm"></info-button>
            ${this.renderInfoPopover()}
          </div>
        </div>
        <zoomable-image
          src=${imgUrl}
          customClass="justify-start"
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
   * Renders the info popover.
   * @returns {TemplateResult} The rendered info popover.
   */
  renderInfoPopover() {
    if (!this.showInfoPopover) {
      return nothing
    }
    return html`
      <div
        class=${classMap({
          popover: true,
          "info-popover": true,
          "dark-mode": this.isDarkMode,
        })}
        ${clickOutside(() => this.closeInfoPopover())}
      >
        <div class="popover-right popover-content">
          ${msg(html`
            <div>
              ${this.uploaded_Date
                ? html`Image uploaded on <br />
                    <span style="margin-top:4px;">
                      <em> ${this.uploaded_Date}</em>
                    </span> `
                : html`No information available`}
            </div>
          `)}
        </div>
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
