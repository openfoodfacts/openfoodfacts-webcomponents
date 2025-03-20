import { LitElement, html, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
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

@customElement("robotoff-crops")
@localized()
export class RobotoffCrops extends LitElement {
  static override styles = [...getButtonClasses([ButtonType.Chocolate, ButtonType.Cappucino])]

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
      error: (error) => html`<p>Error: ${error}</p>`,
    })
  }

  private renderImagePrediction(prediction: ImagePrediction) {
    const imgUrl = getRobotoffImageUrl(prediction.image.source_image)
    return html`
      <div>
        <div>
          <zoomable-image
            src=${imgUrl}
            .size="${{ width: "500px", height: "500px" }}"
            .crop-mode=${true}
          ></zoomable-image>
          <p>${msg("Is this image a crop?")}</p>
          <div class="button-container">
            <button @click="${() => this.answer("1")}">${msg("Yes")}</button>
            <button @click="${() => this.answer("0")}">${msg("No")}</button>
            <button @click="${() => this.answer("-1")}">${msg("Skip")}</button>
          </div>
        </div>
      </div>
    `
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
