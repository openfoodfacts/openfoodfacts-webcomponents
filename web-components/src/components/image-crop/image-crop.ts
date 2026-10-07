import { localized } from "@lit/localize"
import { LitElement, html, css } from "lit"
import { customElement, property, query } from "lit/decorators.js"
import "../shared/zoomable-image"
import { CropMode, type ZoomableImage } from "../shared/zoomable-image"
import { EventType } from "../../constants"
import type { CropperImageBoundingBox } from "../../types"
import type { ImageCropResult } from "../../types/crops"
import { cropImageToBlob, normalizeBoundingBox } from "../../utils/crop"

/**
 * ImageCrop is a generic component to crop (and rotate) an image.
 * The selection can be validated either with the built-in buttons (fires a `crop` event),
 * or by the parent calling `getCrop()` (e.g. from its own "Save" button, with `hide-actions`).
 * @element image-crop
 * @fires crop - When the user validates the crop with the built-in buttons. Detail: ImageCropResult
 * @fires crop-error - When the crop validated with the built-in buttons could not be generated. Detail: { error }
 */
@customElement("image-crop")
@localized()
export class ImageCrop extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }
  `

  /**
   * Image source url (can be an object url, e.g. from URL.createObjectURL(file))
   */
  @property({ type: String })
  src = ""

  /**
   * Size of the image container
   */
  @property({ type: Object })
  size: ZoomableImage["size"] = {
    width: "100%",
    height: "60vh",
  }

  /**
   * Show the toolbar (rotate, center buttons)
   */
  @property({ type: Boolean, attribute: "show-buttons" })
  showButtons = false

  /**
   * Hide the built-in crop buttons, to validate the crop with getCrop()
   */
  @property({ type: Boolean, attribute: "hide-actions" })
  hideActions = false

  /**
   * Type of the cropped image
   */
  @property({ type: String, attribute: "output-type" })
  outputType = "image/webp"

  /**
   * Quality of the cropped image (between 0 and 1), for lossy types
   */
  @property({ type: Number, attribute: "output-quality" })
  outputQuality?: number

  @query("zoomable-image")
  zoomableImage!: ZoomableImage

  /**
   * Gets the cropped image from the current selection.
   * @returns The crop result, or null if there is no selection.
   */
  async getCrop(): Promise<ImageCropResult | null> {
    const selection = this.zoomableImage?.getCropSelection()
    if (!selection) {
      return null
    }
    return this.buildResult(selection.boundingBox, selection.rotation)
  }

  /**
   * Builds the crop result (blob & bounding boxes) from a selection.
   */
  private async buildResult(
    boundingBox: CropperImageBoundingBox,
    rotation: number
  ): Promise<ImageCropResult> {
    const image = this.zoomableImage.imageElement.$image
    const blob = await cropImageToBlob(
      image,
      boundingBox,
      rotation,
      this.outputType,
      this.outputQuality
    )
    return {
      blob,
      boundingBox,
      normalizedBoundingBox: normalizeBoundingBox(
        boundingBox,
        image.naturalWidth,
        image.naturalHeight
      ),
      rotation,
    }
  }

  /**
   * Re-emits the zoomable-image submit (built-in "Validate crop" button) as a crop event.
   */
  private async onSubmit(
    event: CustomEvent<{ newBoundingBox?: CropperImageBoundingBox; rotation: number }>
  ) {
    event.stopPropagation()
    const { newBoundingBox, rotation } = event.detail
    if (!newBoundingBox) {
      return
    }
    let result: ImageCropResult
    try {
      result = await this.buildResult(newBoundingBox, rotation)
    } catch (error) {
      // e.g. crop area too small, or canvas export failure: let the parent show some feedback
      this.dispatchEvent(
        new CustomEvent<{ error: unknown }>(EventType.CROP_ERROR, {
          detail: { error },
          bubbles: true,
          composed: true,
        })
      )
      return
    }
    this.dispatchEvent(
      new CustomEvent<ImageCropResult>(EventType.CROP, {
        detail: result,
        bubbles: true,
        composed: true,
      })
    )
  }

  override render() {
    return html`
      <zoomable-image
        src=${this.src}
        .size=${this.size}
        crop-mode=${CropMode.CROP}
        ?show-buttons=${this.showButtons}
        ?hide-crop-actions=${this.hideActions}
        @submit=${this.onSubmit}
      ></zoomable-image>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "image-crop": ImageCrop
  }
}
