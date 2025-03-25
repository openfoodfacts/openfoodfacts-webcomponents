import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "../shared/zoomable-image"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import {
  ImagePrediction,
  ImagePredictionsResponse,
  QuestionAnnotationAnswer,
} from "../../types/robotoff"
import { Task } from "@lit/task"
import { getRobotoffImageUrl } from "../../signals/robotoff"
import { localized, msg } from "@lit/localize"
import "../shared/loader"
import { FLEX } from "../../styles/utils"

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

  @property({ type: Number })
  count: number = 5

  @property({ type: Number })
  page: number = 1
  @property({ type: String })
  barcode?: string = undefined

  @property({ type: String })
  modelName: string = "ingredient-detection"

  @property({ type: Number })
  minConfidence: number = 0.8

  @property({ type: Object })
  predictions: ImagePredictionsResponse | null = null

  @state()
  cropMode: boolean = false

  private _predictionTask = new Task(this, {
    task: async (
      [count, page, barcode, modelName, minConfidence]: [number, number, string, string, number],
      {}
    ) => {
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

  renderCropAnswerButtons() {
    if (this.cropMode) {
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
          <button class="button cappucino-button" @click="${() => this.answer("1")}">
            ${msg("Yes")}
          </button>
          <button class="button cappucino-button" @click="${() => this.answer("0")}">
            ${msg("No")}
          </button>
          <button class="button white-button" @click="${() => this.answer("-1")}">
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

  override render() {
    return this._predictionTask.render({
      pending: () => html`<off-wc-loading></off-wc-loading>`,
      complete: (predictions?: ImagePredictionsResponse) => {
        if (!predictions) {
          return nothing
        }

        const imagePrediction = predictions.image_predictions[0]

        return this.renderImagePrediction(imagePrediction)
      },
      error: (error: string) => html`<p>Error: ${error}</p>`,
    })
  }

  private renderImagePrediction(prediction: ImagePrediction) {
    const imgUrl = getRobotoffImageUrl(prediction.image.source_image)
    return html`
      <div>
        <div>
          <p class="question">
            <i>${msg("Is this picture a good view of the ingredients in the food?")}</i>
          </p>
          <zoomable-image
            src=${imgUrl}
            .size="${{ width: "500px", height: "500px" }}"
            ?crop-mode=${this.cropMode}
            @save=${this.onCropSave}
          ></zoomable-image>
        </div>
        ${this.renderCropAnswerButtons()}
      </div>
    `
  }

  toggleCropMode() {
    this.cropMode = !this.cropMode
  }

  onCropSave(event: CustomEvent<CropResult>) {
    this.cropResult = event.detail.cropResult
  }

  answer(value: QuestionAnnotationAnswer) {
    console.log("Validate button clicked", value)
    // Add validation logic here
  }

  handleUpdate() {
    console.log("Update button clicked")
    // Add update logic here
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-crops": RobotoffCrops
  }
}
