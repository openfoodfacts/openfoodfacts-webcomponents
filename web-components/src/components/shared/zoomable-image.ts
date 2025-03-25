import { css, html, LitElement, nothing } from "lit"
import { styleMap } from "lit/directives/style-map.js"
import { customElement, property, query, state } from "lit/decorators.js"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import "../icons/rotate-left"
import "../icons/rotate-right"
import { localized, msg } from "@lit/localize"

import CropperCanvas from "@cropper/element-canvas"
import CropperImage from "@cropper/element-image"
import CropperHandle from "@cropper/element-handle"
import CropperSelection from "@cropper/element-selection"
import CropperCrosshair from "@cropper/element-crosshair"
import CropperShade from "@cropper/element-shade"
import type { Selection } from "@cropper/element-selection"
import { FLEX } from "../../styles/utils"
import { CropImageBoundingBox } from "../../types"
import { EventType } from "../../constants"

export enum CropMode {
  IMAGE_ONLY = "image-only",
  CROP_READ = "crop-read",
  CROP = "crop",
}
/**
 * A simple zoomable image component.
 * It allows to display an image that can be zoomed, and rotated.
 * It uses the cropperjs library.
 * @element zoomable-image
 **/
@customElement("zoomable-image")
@localized()
export class ZoomableImage extends LitElement {
  static override styles = [
    css`
      .cropper-parent {
        position: relative;
      }

      .button-container {
        display: flex;
        justify-content: end;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .crop-result-title {
        font-weight: bold;
        text-align: center;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
      .crop-result-buttons {
        margin-top: 0.5rem;
      }
    `,
    FLEX,
    getButtonClasses([ButtonType.White, ButtonType.Chocolate, ButtonType.LINK]),
  ]

  @query("cropper-canvas")
  canvasElement!: CropperCanvas

  @query("cropper-image")
  imageElement!: CropperImage

  @query("cropper-selection")
  selectionElement!: CropperSelection

  @state()
  image!: HTMLImageElement

  @property({ type: String, attribute: "src" })
  src = ""

  @property({ type: String, attribute: "crop-mode" })
  cropMode: string = CropMode.IMAGE_ONLY

  @state()
  rotation = 0

  @state()
  private cropResult: string = ""

  @state()
  private resultBoundingBox?: CropImageBoundingBox

  @property({ type: Object })
  size: {
    width?: string
    height?: string
  } = {
    width: "100%",
    height: "30vh",
  }

  @property({ type: Object })
  initialImageSize: {
    width?: string
    height?: string
    "max-width"?: string
    "max-height"?: string
  } = {}

  @property({ type: Object })
  boundingBox: CropImageBoundingBox = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }

  initCropper() {
    CropperCanvas.$define()
    CropperImage.$define()
    CropperHandle.$define()

    CropperSelection.$define()
    CropperCrosshair.$define()
    CropperShade.$define()
  }

  override firstUpdated() {
    this.initCropper()
  }

  rotateImage(rotation: number) {
    this.resetSelection()
    if (!this.imageElement.rotatable) {
      this.imageElement.rotatable = true
    }
    this.imageElement.$rotate(`${rotation}deg`)
  }

  getBoundingBoxFromSelectionElement() {
    const { x: offsetX, y: offsetY } = this.getOffset()
    const { x: scaleX, y: scaleY } = this.getScale()
    const boundingBox = {
      x: (this.selectionElement.x - offsetX) / scaleX,
      y: (this.selectionElement.y - offsetY) / scaleY,
      width: this.selectionElement.width / scaleX,
      height: this.selectionElement.height / scaleY,
    }
    console.log("Bounding Box:", boundingBox)
    return boundingBox
  }
  async showCrop() {
    if (!this.hasSelection()) {
      alert(msg("Please select a region to crop."))
      return
    }

    this.resultBoundingBox = this.getBoundingBoxFromSelectionElement()

    const result = await this.selectionElement.$toCanvas()
    this.cropResult = result.toDataURL()
  }

  resetSelection() {
    this.selectionElement?.$clear()
  }
  resetCrop() {
    this.cropResult = ""
    this.resultBoundingBox = undefined
    this.resetSelection()
  }

  submitCrop() {
    this.dispatchEvent(
      new CustomEvent(EventType.SUBMIT, {
        detail: {
          newBoundingBox: this.resultBoundingBox,
          oldBoundingBox: this.boundingBox,
        },
      })
    )
  }

  renderCropMode() {
    return html`
      <div>
        <div class="button-container">
          <button class="button white-button small" @click=${this.resetCrop}>
            ${msg("Reset selection")}
          </button>
          <button class="button chocolate-button small" @click=${this.showCrop}>
            ${msg("Show crop")}
          </button>
        </div>

        ${this.renderCropImageBoundingBox()}
      </div>
    `
  }

  renderCropImageBoundingBox() {
    if (!this.cropResult) {
      return nothing
    }
    return html`
      <div>
        <div class="crop-result-title">${msg("Crop Result")}</div>
        <div class="flex justify-center">
          <img src=${this.cropResult} alt="Cropped Image" />
        </div>
        <div class="crop-result-buttons flex justify-center gap-0_5">
          <button class="button chocolate-button" @click=${this.submitCrop}>
            ${msg("Validate crop")}
          </button>
          <button class="button white-button" @click=${this.resetCrop}>${msg("Reset crop")}</button>
        </div>
      </div>
    `
  }

  getOffset() {
    const cropperImageRect = this.imageElement.getBoundingClientRect()
    const cropperCanvasRect = this.canvasElement.getBoundingClientRect()
    return {
      x: cropperImageRect.left - cropperCanvasRect.left,
      y: cropperImageRect.top - cropperCanvasRect.top,
    }
  }

  getScale() {
    const transformValue = this.imageElement.$getTransform()
    return {
      x: transformValue[0],
      y: transformValue[3],
    }
  }

  getBoundingBoxDependOnImageSize() {
    const image = this.imageElement?.$image
    if (!this.boundingBox) {
      console.error("No bounding box")
    }
    if (!image) {
      return this.boundingBox
    }
    const { x: offsetX, y: offsetY } = this.getOffset()
    const { x: scaleX, y: scaleY } = this.getScale()

    console.log("getBoundingBoxDependOnImageSize", {
      scaleX,
      scaleY,
      offsetX,
      offsetY,
      boundingBox: this.boundingBox,
    })
    return {
      x: this.boundingBox.x * scaleX + offsetX,
      y: this.boundingBox.y * scaleY + offsetY,
      width: this.boundingBox.width * scaleX,
      height: this.boundingBox.height * scaleY,
    }
  }

  renderCropperControls() {
    if (this.cropMode === CropMode.IMAGE_ONLY) {
      return html` <cropper-handle action="move" plain></cropper-handle> `
    } else if (this.cropMode === CropMode.CROP_READ) {
      const boundingBox = this.getBoundingBoxDependOnImageSize()
      return html` <cropper-shade></cropper-shade>
        <cropper-selection
          outlined
          @change="${this.onCropperSelectionChange}"
          x=${boundingBox?.x ?? 0}
          y=${boundingBox?.y ?? 0}
          width=${boundingBox?.width ?? 0}
          height=${boundingBox?.height ?? 0}
          dynamic
          movable
          resizable
          zoomable
          movable
        >
        </cropper-selection>`
    }
    return html` <cropper-shade hidden></cropper-shade>
      <cropper-handle action="select" plain></cropper-handle>
      <cropper-selection
        dynamic
        movable
        resizable
        hidden
        @change="${this.onCropperSelectionChange}"
      >
        <cropper-handle action="move" plain></cropper-handle>
        <cropper-handle action="n-resize"></cropper-handle>
        <cropper-handle action="e-resize"></cropper-handle>
        <cropper-handle action="s-resize"></cropper-handle>
        <cropper-handle action="w-resize"></cropper-handle>
        <cropper-handle action="ne-resize"></cropper-handle>
        <cropper-handle action="nw-resize"></cropper-handle>
        <cropper-handle action="se-resize"></cropper-handle>
        <cropper-handle action="sw-resize"></cropper-handle>
      </cropper-selection>`
  }

  inSelection(selection: Selection, maxSelection: Selection) {
    return (
      selection.x >= maxSelection.x &&
      selection.y >= maxSelection.y &&
      selection.x + selection.width <= maxSelection.x + maxSelection.width &&
      selection.y + selection.height <= maxSelection.y + maxSelection.height
    )
  }

  hasSelection() {
    const isSelectionHidden = this.selectionElement?.hidden ?? true
    const hasNoSize = this.selectionElement?.width === 0 || this.selectionElement?.height === 0
    return !isSelectionHidden && !hasNoSize
  }

  onCropperImageTransform(event: CustomEvent) {
    if (this.cropMode !== CropMode.CROP) {
      this.imageElement.$ready(() => {
        const boundingBox = this.getBoundingBoxDependOnImageSize()
        if (boundingBox) {
          this.selectionElement.$change(
            boundingBox.x,
            boundingBox.y,
            boundingBox.width,
            boundingBox.height
          )
        }
      })
      return
    }

    const cropperCanvas = this.canvasElement

    if (!cropperCanvas || !this.hasSelection()) {
      return
    }

    const cropperImage = this.imageElement
    const cropperSelection = this.selectionElement
    const cropperCanvasRect = cropperCanvas.getBoundingClientRect()

    // 1. Clone the cropper image.
    const cropperImageClone = cropperImage.cloneNode() as CropperImage

    // 2. Apply the new matrix to the cropper image clone.
    cropperImageClone.style.transform = `matrix(${event.detail.matrix.join(", ")})`

    // 3. Make the cropper image clone invisible.
    cropperImageClone.style.opacity = "0"

    // 4. Append the cropper image clone to the cropper canvas.
    cropperCanvas.appendChild(cropperImageClone)

    // 5. Compute the boundaries of the cropper image clone.
    const cropperImageRect = cropperImageClone.getBoundingClientRect()

    // 6. Remove the cropper image clone.
    cropperCanvas.removeChild(cropperImageClone)

    const selection = cropperSelection as Selection
    const maxSelection: Selection = {
      x: cropperImageRect.left - cropperCanvasRect.left,
      y: cropperImageRect.top - cropperCanvasRect.top,
      width: cropperImageRect.width,
      height: cropperImageRect.height,
    }

    if (!this.inSelection(selection, maxSelection)) {
      event.preventDefault()
    }
  }
  onCropperSelectionChange(event: CustomEvent) {
    if (this.cropMode !== CropMode.CROP) {
      return
    }
    const cropperCanvas = this.canvasElement

    if (!cropperCanvas) {
      return
    }

    const cropperCanvasRect = cropperCanvas.getBoundingClientRect()
    const selection = event.detail as Selection

    const cropperImage = this.imageElement
    const cropperImageRect = cropperImage.getBoundingClientRect()
    const maxSelection: Selection = {
      x: cropperImageRect.left - cropperCanvasRect.left,
      y: cropperImageRect.top - cropperCanvasRect.top,
      width: cropperImageRect.width,
      height: cropperImageRect.height,
    }

    if (!this.inSelection(selection, maxSelection)) {
      event.preventDefault()
    }
  }
  renderTopPanel() {
    if (this.cropMode === CropMode.CROP_READ) {
      return html``
    }
    return html`<div class="flex justify-end">
      <button
        class="link-button"
        @click=${() => this.rotateImage(-90)}
        title=${msg("Rotate image to the left")}
      >
        <rotate-left-icon></rotate-left-icon>
      </button>
      <button
        class="link-button"
        @click=${() => this.rotateImage(90)}
        title=${msg("Rotate image to the right")}
      >
        <rotate-right-icon></rotate-right-icon>
      </button>
    </div>`
  }
  override render() {
    const crossorigin = this.cropMode !== CropMode.IMAGE_ONLY ? "anonymous" : undefined
    return html`
      <div>
        ${this.renderTopPanel()}
        <div class="cropper-parent">
          <cropper-canvas
            background
            style=${styleMap(this.size)}
            ?disabled=${this.cropMode === CropMode.CROP_READ}
          >
            <cropper-image
              src=${this.src}
              alt="Picture"
              rotable
              scalable
              skewable
              translatable
              ?crossorigin="${crossorigin}"
              @transform=${this.onCropperImageTransform}
            ></cropper-image>
            ${this.renderCropperControls()}
          </cropper-canvas>
        </div>
        ${this.cropMode === CropMode.CROP ? html` ${this.renderCropMode()} ` : nothing}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zoomable-image": ZoomableImage
  }
}
