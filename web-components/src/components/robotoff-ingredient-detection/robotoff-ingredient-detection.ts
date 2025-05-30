/**
 * RobotoffCrops Component
 *
 * This component is responsible for displaying and managing the cropping of images
 * for the Robotoff application. It integrates with the Robotoff API to fetch image
 * predictions and allows users to crop and annotate images.
 *
 * @element robotoff-ingredient-detection
 */

import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "../shared/zoomable-image"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import {
  IngredientDetectionInsight,
  IngredientDetectionAnnotationData,
  AnnotationAnswer,
} from "../../types/robotoff"
import { Task } from "@lit/task"
import { getRobotoffImageUrl } from "../../signals/robotoff"
import { localized, msg } from "@lit/localize"
import "../shared/loader"
import { FLEX } from "../../styles/utils"
import { CropResult } from "../../types"
import * as ZoomableImage from "../shared/zoomable-image"
import {
  cropImageBoundingBoxToRobotoffBoundingBox,
  robotoffBoundingBoxToCropImageBoundingBox,
} from "../../utils/crop"
import {
  fetchIngredientsDetectionInsights,
  ingredientDetectionInsights,
} from "../../signals/ingredient-detection"
import robotoff from "../../api/robotoff"

@customElement("robotoff-ingredient-detection")
@localized()
export class RobotoffIngredientDetection extends LitElement {
  static override styles = [
    css`
      .question {
        font-weight: bold;
        margin-bottom: 0.5rem;
        text-align: center;
      }

      .button-container {datadata
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
      }

      .crop-button-container {
        display: flex;
        justify-content: center;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
    `,
    FLEX,
    ...getButtonClasses([
      ButtonType.Chocolate,
      ButtonType.Cappucino,
      ButtonType.White,
      ButtonType.LINK,
    ]),
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
   * Current crop mode
   * @type {ZoomableImage.CropMode}
   */
  @state()
  cropMode: ZoomableImage.CropMode = ZoomableImage.CropMode.CROP_READ

  @state()
  image?: HTMLImageElement

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
    this.image = undefined
    this.index = index
    const insight = this.currentInsight
    if (!insight) {
      return
    }
    this.image = new Image()
    this.image.onload = () => {
      this.requestUpdate()
    }
    this.image.src = getRobotoffImageUrl(insight.source_image!)
  }

  /**
   * Renders the crop answer buttons
   * @returns {TemplateResult}
   */
  renderCropAnswerButtons() {
    if (this.cropMode === ZoomableImage.CropMode.CROP) {
      return html`
        <div>
          <div class="crop-button-container">
            <button class="button cappucino-button" @click="${this.toggleCropMode}">
              ${msg("Cancel crop")}
            </button>
          </div>
        </div>
      `
    }
    return html`
      <div class="flex flex-col align-center">
        <div class="button-container">
          <button
            class="button cappucino-button"
            type="button"
            @click="${() => this.answer(AnnotationAnswer.ACCEPT)}"
          >
            ${msg("Yes")}
          </button>
          <button
            type="button"
            class="button cappucino-button"
            @click="${() => this.answer(AnnotationAnswer.REFUSE)}"
          >
            ${msg("No")}
          </button>
          <button
            type="button"
            class="button white-button"
            @click="${() => this.answer(AnnotationAnswer.SKIP)}"
          >
            ${msg("Skip")}
          </button>
        </div>
        <div>
          <span>${msg("or")}</span>
        </div>
        <div class="crop-button-container">
          <button class="button chocolate-button" @click="${this.toggleCropMode}">
            ${msg("I'll propose a better crop")}
          </button>
        </div>
      </div>
    `
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
   * Renders an image prediction
   * @param {ImagePrediction} prediction - The image prediction to render
   * @returns {TemplateResult}
   */
  private renderInsight(insight: IngredientDetectionInsight) {
    if (!insight.source_image) {
      return nothing
    }
    const imgUrl = getRobotoffImageUrl(insight.source_image)
    if (this.image) {
      console.log("image", this.image.naturalWidth, this.image.naturalHeight)
    }
    const boundingBox =
      insight.data.bounding_box && this.image
        ? robotoffBoundingBoxToCropImageBoundingBox(
            insight.data.bounding_box,
            this.image.naturalWidth,
            this.image.naturalHeight
          )
        : { x: 0, y: 0, width: 0, height: 0 }

    return html`
      <div>
        <div>
          <p class="question">
            <i>${msg("Is this selection a good crop of the ingredients in the food?")}</i>
          </p>
          <zoomable-image
            src=${imgUrl}
            .size="${{ "max-width": "500px", height: "500px", width: "100%" }}"
            crop-mode=${this.cropMode}
            .boundingBox=${boundingBox}
            show-buttons
            @submit=${this.onCropSave}
          ></zoomable-image>
        </div>
        ${this.renderCropAnswerButtons()}
      </div>
    `
  }

  /**
   * Toggles the crop mode
   */
  toggleCropMode() {
    this.cropMode =
      this.cropMode === ZoomableImage.CropMode.CROP
        ? ZoomableImage.CropMode.CROP_READ
        : ZoomableImage.CropMode.CROP
  }

  /**
   * Handles the crop save event
   * @param {CustomEvent<CropResult>} event - The crop save event
   */
  onCropSave(event: CustomEvent<CropResult>) {
    if (!this.image) {
      return
    }
    const robotoffBoundingBox = cropImageBoundingBoxToRobotoffBoundingBox(
      event.detail.newBoundingBox,
      this.image.width,
      this.image.height
    )

    this.answer(AnnotationAnswer.ACCEPT_AND_ADD_DATA, {
      bounding_box: robotoffBoundingBox,
      // TODO Change this to the actual annotation text
      annotation: this.currentInsight.data.text,
    })
  }

  /**
   * Handles the answer event
   * @param {AnnotationAnswer} value - The answer value
   * @param {RobotoffBoundingBox} [boundingBox] - The bounding box for the answer
   */
  answer(value: AnnotationAnswer, data?: IngredientDetectionAnnotationData) {
    const insightId = this.currentInsight.id
    robotoff.annotateIngredientDetection(insightId, value, data)
    this.setIndex(this.index + 1)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-ingredient-detection": RobotoffIngredientDetection
  }
}
