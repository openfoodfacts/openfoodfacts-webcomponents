import { css, html, LitElement, nothing } from "lit"
import { styleMap } from "lit/directives/style-map.js"
import { customElement, property, query, state } from "lit/decorators.js"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { FLEX } from "../../styles/utils"
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
        border: 1px solid black;
      }
    `,
    FLEX,
    getButtonClasses([ButtonType.LINK]),
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

  @property({ type: Number, attribute: "current-zoom" })
  currentZoom = 1

  @property({ type: Number, attribute: "step-size" })
  stepSize = 0.1

  @property({ type: Number, attribute: "min-zoom" })
  minZoom = 1
  @property({ type: Number, attribute: "max-zoom" })
  maxZoom = 5

  @property({ type: Boolean, attribute: "crop-mode" })
  cropMode: boolean = false

  @state()
  rotation = 0

  @state()
  private cropResult: string = ""

  @property({ type: Object })
  size: {
    width?: string
    height?: string
  } = {
    width: "100%",
    height: "30vh",
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.initCropper()
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback()
  }

  initCropper() {
    CropperCanvas.$define()
    CropperImage.$define()
    CropperHandle.$define()

    if (this.cropMode) {
      CropperSelection.$define()
      CropperCrosshair.$define()
      CropperShade.$define()
    }
  }

  rotateImage(rotation: number) {
    this.rotation += rotation
    this.requestUpdate()
  }

  async validateCrop() {
    const result = await this.canvasElement.$toCanvas()
    this.cropResult = result.toDataURL()
    this.dispatchEvent(
      new CustomEvent("crop-validated", {
        detail: {
          crop: this.cropResult,
        },
      })
    )
  }

  renderCropMode() {
    return html`
      <div class="flex justify-end">
        <button class="link-button" @click=${this.validateCrop}>${msg("Validate crop")}</button>
      </div>
    `
  }

  renderCropResult() {
    return html`
      <div>
        <h3>Crop Result</h3>
        <img src=${this.cropResult} alt="Cropped Image" />
      </div>
    `
  }

  renderCropperControls() {
    if (!this.cropMode) {
      return nothing
    }
    return html`
      <cropper-shade></cropper-shade>
      <cropper-selection
        initial-coverage="0.5"
        dynamic
        movable
        resizable
        zoomable
        @change="${this.onCropperSelectionChange}"
      >
        <cropper-grid role="grid" covered></cropper-grid>
        <cropper-crosshair centered></cropper-crosshair>
        <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
        <cropper-handle action="n-resize"></cropper-handle>
        <cropper-handle action="e-resize"></cropper-handle>
        <cropper-handle action="s-resize"></cropper-handle>
        <cropper-handle action="w-resize"></cropper-handle>
        <cropper-handle action="ne-resize"></cropper-handle>
        <cropper-handle action="nw-resize"></cropper-handle>
        <cropper-handle action="se-resize"></cropper-handle>
        <cropper-handle action="sw-resize"></cropper-handle>
      </cropper-selection>
    `
  }

  inSelection(selection: Selection, maxSelection: Selection) {
    return (
      selection.x >= maxSelection.x &&
      selection.y >= maxSelection.y &&
      selection.x + selection.width <= maxSelection.x + maxSelection.width &&
      selection.y + selection.height <= maxSelection.y + maxSelection.height
    )
  }

  onCropperImageTransform(event: CustomEvent) {
    const cropperCanvas = this.canvasElement

    if (!cropperCanvas) {
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
  override render() {
    const imageStyle = {
      transform: `rotate(${this.rotation}deg)`,
    }
    const crossorigin = this.cropMode ? "anonymous" : undefined
    return html`
      <div>
        <div class="flex justify-end">
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
        </div>
        <div class="cropper-parent">
          <cropper-canvas background style=${styleMap(this.size)}>
            <cropper-image
              src=${this.src}
              alt="Picture"
              rotatable
              scalable
              skewable
              translatable
              ?crossorigin="${crossorigin}"
            ></cropper-image>
            <cropper-handle action="move" plain></cropper-handle>
            ${this.renderCropperControls()}
          </cropper-canvas>
        </div>
        ${this.cropMode ? this.renderCropMode() : nothing}
        ${this.cropResult ? this.renderCropResult() : nothing}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zoomable-image": ZoomableImage
  }
}
