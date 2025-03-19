import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import "../shared/zoomable-image"
import "./robotoff-crops"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import robotoff from "../../api/robotoff"
import { ImagePredictionsResponse } from "../../types/robotoff"
import { Task } from "@lit/task"
import { getRobotoffImageUrl } from "../../signals/robotoff"

@customElement("robotoff-crops")
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

        const imagePredictions = predictions.image_predictions
        const imgUrls = imagePredictions.map((prediction) =>
          getRobotoffImageUrl(prediction.image.source_image)
        )

        return html`
          <div>
            ${imgUrls.map(
              (imgUrl) => html`
                <zoomable-image src=${imgUrl} .size="${{ height: "350px" }}"></zoomable-image>
              `
            )}
            <div class="button-container">
              <button @click="${this.handleValidate}">Validate</button>
              <button @click="${this.handleUpdate}">Update</button>
            </div>
          </div>
        `
      },
      error: (error) => html`<p>Error: ${error}</p>`,
    })
  }

  handleValidate() {
    console.log("Validate button clicked")
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
