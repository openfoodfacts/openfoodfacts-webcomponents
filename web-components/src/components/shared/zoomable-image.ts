import { css, html, LitElement, nothing } from "lit"
import { styleMap } from "lit/directives/style-map.js"
import { customElement, property, query, state } from "lit/decorators.js"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import "../icons/rotate-left"
import "../icons/rotate-right"
import { localized, msg } from "@lit/localize"
import { mobileAndTabletCheck } from "../../utils/breakpoints"

import CropperCanvas from "@cropper/element-canvas"
import CropperImage from "@cropper/element-image"
import CropperHandle from "@cropper/element-handle"
import CropperSelection from "@cropper/element-selection"
import CropperCrosshair from "@cropper/element-crosshair"
import CropperShade from "@cropper/element-shade"
import type { Selection } from "@cropper/element-selection"
import { FLEX } from "../../styles/utils"
import { CropperImageBoundingBox } from "../../types"
import { EventType } from "../../constants"
import "../icons/arrows-center"
import { CropperActionEvent } from "../../types/crops"

export enum CropMode {
  IMAGE_ONLY = "image-only",
  CROP_READ = "crop-read",
  CROP = "crop",
}
/**
 * A simple zoomable image component.
 * It allows to display an image that can be zoomed, and rotated, cropped.
 * It uses the cropperjs library.
 * @element zoomable-image
 **/
@customElement("zoomable-image")
@localized()
export class ZoomableImage extends LitElement {
  static override styles = [
    css`
      :host {
        display: block;
        width: 100%;
      }
      .zoomable-image {
        margin: 0 auto;
      }
      .cropper-parent {
        position: relative;
        overflow: hidden;
        border: 1px solid black;
        background-color: white;
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

  /*
   * Panzoom instance
   */
  @state()
  image!: HTMLImageElement

  /*
   * Image source url
   */
  @property({ type: String, attribute: "src" })
  src = ""

  @property({ type: Object })
  boundingBox?: CropperImageBoundingBox = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }

  /**
   * Fallback image source url
   * If the image fails to load, this image will be displayed instead
   */
  @property({ type: String, attribute: "fallback-src" })
  fallbackSrc = ""

  @state()
  currentZoom = 1

  @property({ type: Number, attribute: "scale-size" })
  scaleStep = 0.25

  @property({ type: Number, attribute: "max-zoom" })
  maxZoom = 3

  @property({ type: Number, attribute: "min-zoom" })
  minZoom = 0.3

  @property({ type: Boolean, attribute: "show-buttons" })
  showButtons = false

  @property({ type: String, attribute: "crop-mode" })
  cropMode: string = CropMode.IMAGE_ONLY

  // Use private property with getter/setter to detect changes
  private _size: {
    width: string
    height?: string
    "max-width"?: string
    "max-height"?: string
  } = {
    width: "100%",
    height: "30vh",
  }

  @property({ type: Object })
  get size() {
    return this._size
  }

  set size(value: { width: string; height?: string; "max-width"?: string; "max-height"?: string }) {
    const oldValue = this._size
    this._size = value
    this.requestUpdate("size", oldValue)
    // Manually trigger the same behavior as attributeChangedCallback
    this.fitImageToContainer()
  }

  @state()
  rotation = 0

  @state()
  private cropResult: string = ""

  @state()
  private resultBoundingBox?: CropperImageBoundingBox

  /**
   * The last transform applied to the image.
   * Used to reset the image to its original position.
   */
  @state()
  lastTransform: number[] = []

  get canZoom() {
    return !mobileAndTabletCheck()
  }

  /**
   * Called when an attribute is changed.
   * Allows to fit the image to the container when the src attribute is changed.
   */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    if (name == "src" && value) {
      this.fitImageToContainer()
    }
  }

  /**
   * Called after the component is first updated.
   * Used to initialize the cropper.
   */
  override firstUpdated() {
    this.initCropper()
  }

  /**
   * Called when the component is disconnected from the DOM.
   * Used to remove the event listener from the cropper canvas.
   */
  override disconnectedCallback(): void {
    this.canvasElement.removeEventListener("actionstart", (e) => {
      this.onCropperCanvasAction(e as CropperActionEvent)
    })
    super.disconnectedCallback()
  }

  /**
   * Initializes the zoom limit for the cropper canvas.
   * This is used to prevent the user from zooming in or out too much.
   */
  initZoomLimit() {
    this.updateLastTransform()

    this.canvasElement.addEventListener("action", (e) => {
      this.onCropperCanvasAction(e as CropperActionEvent)
    })
  }

  /**
   * Initializes the cropper components.
   */
  initCropper() {
    CropperCanvas.$define()
    CropperImage.$define()
    CropperHandle.$define()

    CropperSelection.$define()
    CropperCrosshair.$define()
    CropperShade.$define()

    this.initZoomLimit()
  }

  /**
   * Updates the last transform of the image.
   * This is used to rollback the image if user zooms out too much.
   */
  updateLastTransform() {
    this.lastTransform = this.imageElement?.$getTransform()
  }

  /**
   * Centers the image and fits it within its container.
   * This ensures the image is properly scaled and positioned to be fully visible.
   */
  fitImageToContainer() {
    setTimeout(() => {
      if (!this.imageElement) {
        return
      }

      this.imageElement.$center("contain")
    }, 0)
  }

  /**
   * Rotates the image by the specified angle.
   * @param rotation - The angle to rotate the image by.
   */
  rotateImage(rotation: number) {
    // Reset the selection before rotating the image
    this.resetSelection()
    if (!this.imageElement.rotatable) {
      // Enable rotation if it's not already enabled (bug fix)
      this.imageElement.rotatable = true
    }
    this.imageElement.$rotate(`${rotation}deg`)
  }
  /**
   * Renders the center button.
   * @returns The rendered center button.
   */
  renderCenterButton() {
    return html`
      <button class="link-button" @click=${this.fitImageToContainer} title=${msg("Center image")}>
        <arrows-center-icon size="20px"></arrows-center-icon>
      </button>
    `
  }

  /**
   * Renders the rotate buttons.
   * @returns The rendered rotate buttons.
   */
  renderRotateButtons() {
    if (this.cropMode === CropMode.CROP_READ) {
      return nothing
    }
    return html`
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
    `
  }

  /**
   * Gets the bounding box from the selection element.
   * @returns The bounding box coordinates.
   */
  getBoundingBoxFromSelectionElement() {
    const { x: offsetX, y: offsetY } = this.getOffset()
    const { x: scaleX, y: scaleY } = this.getScale()
    const boundingBox = {
      x: (this.selectionElement.x - offsetX) / scaleX,
      y: (this.selectionElement.y - offsetY) / scaleY,
      width: this.selectionElement.width / scaleX,
      height: this.selectionElement.height / scaleY,
    }
    return boundingBox
  }

  /**
   * Shows the cropped image.
   */
  async showCrop() {
    if (!this.hasSelection()) {
      alert(msg("Please select a region to crop."))
      return
    }

    this.resultBoundingBox = this.getBoundingBoxFromSelectionElement()

    const result = await this.selectionElement.$toCanvas()
    this.cropResult = result.toDataURL()
  }

  /**
   * Resets the selection.
   */
  resetSelection() {
    this.selectionElement?.$clear()
  }

  /**
   * Resets the crop.
   */
  resetCrop() {
    this.cropResult = ""
    this.resultBoundingBox = undefined
    this.resetSelection()
  }

  /**
   * Submits the crop.
   */
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

  /**
   * Renders the crop mode UI.
   * @returns The crop mode UI.
   */
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

  /**
   * Renders the crop image bounding box.
   * @returns The crop image bounding box UI.
   */
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

  /**
   * Gets the offset of the cropper image relative to the canvas.
   * @returns The offset coordinates.
   */
  getOffset() {
    const cropperImageRect = this.imageElement.getBoundingClientRect()
    const cropperCanvasRect = this.canvasElement.getBoundingClientRect()
    return {
      x: cropperImageRect.left - cropperCanvasRect.left,
      y: cropperImageRect.top - cropperCanvasRect.top,
    }
  }

  /**
   * Gets the scale of the cropper image.
   * @returns The scale coordinates.
   */
  getScale() {
    const transformValue = this.imageElement.$getTransform()
    return {
      x: transformValue[0],
      y: transformValue[3],
    }
  }

  /**
   * Calculates the scale of the image relative to the canvas size using current image width.
   * @returns The scale factor as a number.
   */
  getImageScaleRelativeToCanvas(): number {
    if (!this.imageElement || !this.canvasElement) {
      return 1
    }

    const image = this.imageElement.$image
    const canvas = this.canvasElement

    if (!image || !canvas) {
      return 1
    }

    // Get the current width and height of the image as displayed in the canvas
    const imageRect = this.imageElement.getBoundingClientRect()
    const imageWidth = imageRect.width
    const imageHeight = imageRect.height
    const canvasWidth = canvas.clientWidth
    const canvasHeight = canvas.clientHeight

    // Calculate the scale factor based on width and height
    const widthScale = imageWidth / canvasWidth
    const heightScale = imageHeight / canvasHeight

    // Return the larger scale factor to ensure the image fits within the canvas
    return Math.max(widthScale, heightScale)
  }

  /**
   * Gets the bounding box depending on the image size.
   * @returns The bounding box coordinates.
   */
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

    return {
      x: this.boundingBox!.x * scaleX + offsetX,
      y: this.boundingBox!.y * scaleY + offsetY,
      width: this.boundingBox!.width * scaleX,
      height: this.boundingBox!.height * scaleY,
    }
  }

  /**
   * Renders the cropper controls.
   * @returns The cropper controls UI.
   */
  renderCropperControls() {
    if (this.cropMode === CropMode.IMAGE_ONLY) {
      return html` <cropper-handle action="move" plain></cropper-handle> `
    } else if (this.cropMode === CropMode.CROP_READ) {
      const boundingBox = this.getBoundingBoxDependOnImageSize()
      return html` <cropper-shade></cropper-shade>
        <cropper-handle action="move" plain></cropper-handle>
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
        >
          <cropper-handle action="move" plain></cropper-handle>
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

  /**
   * Checks if the selection is within the maximum selection.
   * @param selection - The selection to check.
   * @param maxSelection - The maximum selection.
   * @returns True if the selection is within the maximum selection, false otherwise.
   */
  inSelection(selection: Selection, maxSelection: Selection) {
    return (
      selection.x >= maxSelection.x &&
      selection.y >= maxSelection.y &&
      selection.x + selection.width <= maxSelection.x + maxSelection.width &&
      selection.y + selection.height <= maxSelection.y + maxSelection.height
    )
  }

  /**
   * Checks if there is a selection.
   * @returns True if there is a selection, false otherwise.
   */
  hasSelection() {
    const isSelectionHidden = this.selectionElement?.hidden ?? true
    const hasNoSize = this.selectionElement?.width === 0 || this.selectionElement?.height === 0
    return !isSelectionHidden && !hasNoSize
  }

  /**
   * Handles the cropper image transform event.
   * @param event - The transform event.
   */
  onCropperImageTransform(event: CustomEvent<{ matrix: number[] }>) {
    if (this.cropMode !== CropMode.CROP) {
      this.imageElement.$ready(() => {
        const boundingBox = this.getBoundingBoxDependOnImageSize()
        if (boundingBox && this.selectionElement) {
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

    const cropperSelection = this.selectionElement
    const cropperCanvasRect = cropperCanvas.getBoundingClientRect()

    // 1. Clone the cropper image.
    const cropperImageClone = this.imageElement.cloneNode() as CropperImage

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

  /**
   * Handles the cropper selection change event.
   * @param event - The selection change event.
   */
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

  /**
   * Renders the top panel.
   * @returns The top panel UI.
   */
  renderTopPanel() {
    if (!this.showButtons) return nothing

    return html`
      <div class="flex justify-end">${this.renderCenterButton()} ${this.renderRotateButtons()}</div>
    `
  }

  /**
   * Handles zoom changes to ensure they stay within the specified bounds.
   * @param zoom - The new zoom level.
   */
  allowZoomChange(zoom: number): boolean {
    if (zoom > this.maxZoom) {
      return false
    }
    if (zoom < this.minZoom) {
      return false
    }
    return true
  }

  /**
   * Handles cropper canvas actions.
   * @param event - The cropper canvas action event.
   */
  onCropperCanvasAction(event: CropperActionEvent) {
    const { action } = event.detail
    if (action === "scale") {
      const isAllowed = this.allowZoomChange(this.getImageScaleRelativeToCanvas())
      if (!isAllowed) {
        event.preventDefault()
        // rollback the scale
        this.imageElement.$setTransform(this.lastTransform)
      }
    }
    this.updateLastTransform()
  }

  /**
   * Renders the component.
   * @returns The component UI.
   */
  override render() {
    const crossorigin = this.cropMode !== CropMode.IMAGE_ONLY ? "anonymous" : undefined
    return html`
      <div
        class="zoomable-image"
        style=${styleMap({
          width: this.size.width,
          "max-width": this.size["max-width"],
        })}
      >
        ${this.renderTopPanel()}
        <div class="cropper-parent">
          <cropper-canvas background style=${styleMap(this.size)} scale-step=${this.scaleStep}>
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
