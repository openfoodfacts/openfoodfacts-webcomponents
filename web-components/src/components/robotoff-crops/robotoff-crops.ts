/**
 * RobotoffCrops Component
 *
 * This component is responsible for displaying and managing the cropping of images
 * for the Robotoff application. It integrates with the Robotoff API to fetch image
 * predictions and allows users to crop and annotate images.
 *
 * @element robotoff-crops
 */

import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "../shared/zoomable-image"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import {
  CropBoundingBox,
  ImagePrediction,
  ImagePredictionsResponse,
  QuestionAnnotationAnswer,
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

@customElement("robotoff-crops")
@localized()
export class RobotoffCrops extends LitElement {
  static override styles = [
    css`
      .question {
        font-weight: bold;
        margin-bottom: 0.5rem;
        text-align: center;
      }

      .button-container {
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
  count: number = 5

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
  @property({ type: String })
  barcode?: string = undefined

  /**
   * Name of the model to use for predictions
   * @type {string}
   */
  @property({ type: String })
  modelName: string = "ingredient-detection"

  /**
   * Minimum confidence threshold for predictions
   * @type {number}
   */
  @property({ type: Number })
  minConfidence: number = 0.8

  /**
   * Predictions fetched from the Robotoff API
   * @type {ImagePredictionsResponse | null}
   */
  @property({ type: Object })
  predictions: ImagePredictionsResponse | null = null

  /**
   * Current crop mode
   * @type {ZoomableImage.CropMode}
   */
  @state()
  cropMode: ZoomableImage.CropMode = ZoomableImage.CropMode.CROP_READ

  private _predictionTask = new Task(this, {
    task: async ([count, page, barcode, modelName, minConfidence], {}) => {
      if (!barcode) {
        return
      }
      const requestParams = {
        count,
        page,
        barcode,
        model_name: modelName,
        min_confidence: minConfidence,
      }
      return await robotoff.getImagePredictions(requestParams)
    },
    args: () => [this.count, this.page, this.barcode, this.modelName, this.minConfidence],
  })

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
            @click="${() => this.answer(QuestionAnnotationAnswer.YES)}"
          >
            ${msg("Yes")}
          </button>
          <button
            class="button cappucino-button"
            @click="${() => this.answer(QuestionAnnotationAnswer.NO)}"
          >
            ${msg("No")}
          </button>
          <button
            class="button white-button"
            @click="${() => this.answer(QuestionAnnotationAnswer.SKIP)}"
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
    return this._predictionTask.render({
      pending: () => html`<off-wc-loading></off-wc-loading>`,
      complete: (predictions) => {
        if (!predictions) {
          return nothing
        }

        // TODO: handle multiple predictions
        const imagePrediction = (predictions as ImagePredictionsResponse).image_predictions[0]

        return this.renderImagePrediction(imagePrediction)
      },
      error: (error: unknown) => html`<p>Error: ${String(error)}</p>`,
    })
  }

  /**
   * Renders an image prediction
   * @param {ImagePrediction} prediction - The image prediction to render
   * @returns {TemplateResult}
   */
  private renderImagePrediction(prediction: ImagePrediction) {
    const imgUrl = getRobotoffImageUrl(prediction.image.source_image)
    const boundingBox = prediction.data.entities[0]?.bounding_box
      ? robotoffBoundingBoxToCropImageBoundingBox(prediction.data.entities[0].bounding_box)
      : undefined

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
    const oldBoundingBox = event.detail.oldBoundingBox
      ? cropImageBoundingBoxToRobotoffBoundingBox(event.detail.oldBoundingBox)
      : null
    const robotoffBoundingBox = cropImageBoundingBoxToRobotoffBoundingBox(
      event.detail.newBoundingBox
    )
    // TODO : integrate logic with robotoff insight api

    alert(
      "initial bounding box: " +
        JSON.stringify(oldBoundingBox) +
        "\n" +
        "Crop bounding box: " +
        JSON.stringify(robotoffBoundingBox)
    )
    this.answer(QuestionAnnotationAnswer.NO, robotoffBoundingBox)
  }

  /**
   * Handles the answer event
   * @param {QuestionAnnotationAnswer} value - The answer value
   * @param {CropBoundingBox} [boundingBox] - The bounding box for the answer
   */
  answer(value: QuestionAnnotationAnswer, boundingBox?: CropBoundingBox) {
    // TODO : integrate logic with robotoff insight api
    alert(
      "Validate button clicked: " + value + "\n" + "bounding box: " + JSON.stringify(boundingBox)
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-crops": RobotoffCrops
  }
}
