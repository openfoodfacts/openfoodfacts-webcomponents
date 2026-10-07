import { localized, msg } from "@lit/localize"
import { LitElement, html, css, nothing, type PropertyValues } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import "../shared/zoomable-image"
import { CropMode, type ZoomableImage } from "../shared/zoomable-image"
import { EventType } from "../../constants"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import type { ImageRedactResult, NormalizedBoundingBox } from "../../types/crops"
import { denormalizeBoundingBox, normalizeBoundingBox, redactImageToBlob } from "../../utils/crop"

/**
 * ImageRedact is a generic component to hide areas of an image with black boxes.
 * The user can draw multiple boxes, and select one to move, resize or remove it.
 * Nothing is applied to the image until the redaction is validated, either with the built-in button
 * (fires a `redact` event), or by the parent calling `getRedaction()` (e.g. with `hide-actions`).
 * @element image-redact
 * @fires redact - When the user validates with the built-in button. Detail: ImageRedactResult
 * @fires redact-error - When the redaction validated with the built-in button could not be generated. Detail: { error }
 */
@customElement("image-redact")
@localized()
export class ImageRedact extends LitElement {
  static override styles = [
    getButtonClasses([ButtonType.White, ButtonType.Chocolate]),
    css`
      :host {
        display: block;
        width: 100%;
      }
      .button-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: end;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
    `,
  ]

  /**
   * Image source url (can be an object url, e.g. from URL.createObjectURL(file))
   */
  @property({ type: String })
  src = ""

  /**
   * Initial boxes (e.g. predictions), relative to the image size
   */
  @property({ type: Array })
  boxes: NormalizedBoundingBox[] = []

  /**
   * Size of the image container
   */
  @property({ type: Object })
  size: ZoomableImage["size"] = {
    width: "100%",
    height: "60vh",
  }

  /**
   * Show the toolbar (center button)
   */
  @property({ type: Boolean, attribute: "show-buttons" })
  showButtons = false

  /**
   * Hide the built-in validate button, to validate the redaction with getRedaction()
   */
  @property({ type: Boolean, attribute: "hide-actions" })
  hideActions = false

  /**
   * Type of the redacted image
   */
  @property({ type: String, attribute: "output-type" })
  outputType = "image/webp"

  /**
   * Quality of the redacted image (between 0 and 1), for lossy types
   */
  @property({ type: Number, attribute: "output-quality" })
  outputQuality?: number

  @query("zoomable-image")
  zoomableImage!: ZoomableImage

  @state()
  private boxCount = 0

  @state()
  private hasSelectedBox = false

  private loadToken = 0

  private onSelectionChange(event: CustomEvent<{ boxCount: number; hasSelectedBox: boolean }>) {
    this.boxCount = event.detail.boxCount
    this.hasSelectedBox = event.detail.hasSelectedBox
  }

  override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("src") || changedProperties.has("boxes")) {
      this.loadInitialBoxes()
    }
  }

  /**
   * Draws the initial boxes, once the image is loaded and displayed.
   */
  private async loadInitialBoxes() {
    // src & boxes can change in separate updates: only the latest load applies its boxes
    const loadToken = ++this.loadToken
    await this.zoomableImage.updateComplete
    const imageElement = this.zoomableImage.imageElement
    if (!imageElement || !this.src) {
      return
    }
    const image = await imageElement.$ready()
    // wait for the image to be centered in the canvas
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    if (loadToken !== this.loadToken) {
      return
    }
    this.zoomableImage.setRedactBoxes(
      this.boxes.map((box) => denormalizeBoundingBox(box, image.naturalWidth, image.naturalHeight))
    )
  }

  /**
   * Gets the redacted image from the current boxes.
   * @returns The redaction result (possibly without any box).
   */
  async getRedaction(): Promise<ImageRedactResult> {
    const image = this.zoomableImage.imageElement.$image
    if (!image?.naturalWidth || !image?.naturalHeight) {
      throw new Error("Image is not loaded")
    }
    const boxes = this.zoomableImage.getRedactBoxes()
    const blob = await redactImageToBlob(image, boxes, this.outputType, this.outputQuality)
    return {
      blob,
      boxes,
      normalizedBoxes: boxes.map((box) =>
        normalizeBoundingBox(box, image.naturalWidth, image.naturalHeight)
      ),
    }
  }

  private async onValidate() {
    let result: ImageRedactResult
    try {
      result = await this.getRedaction()
    } catch (error) {
      // e.g. image not loaded yet, or canvas export failure: let the parent show some feedback
      this.dispatchEvent(
        new CustomEvent<{ error: unknown }>(EventType.REDACT_ERROR, {
          detail: { error },
          bubbles: true,
          composed: true,
        })
      )
      return
    }
    this.dispatchEvent(
      new CustomEvent<ImageRedactResult>(EventType.REDACT, {
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
        crop-mode=${CropMode.REDACT}
        ?show-buttons=${this.showButtons}
        @redact-selection-change=${this.onSelectionChange}
      ></zoomable-image>
      <div class="button-container">
        <button
          class="button white-button small"
          ?disabled=${!this.hasSelectedBox}
          @click=${() => this.zoomableImage.removeActiveRedactBox()}
        >
          ${msg("Remove selected box")}
        </button>
        <button
          class="button white-button small"
          ?disabled=${this.boxCount === 0}
          @click=${() => this.zoomableImage.clearRedactBoxes()}
        >
          ${msg("Remove all boxes")}
        </button>
        ${
          this.hideActions
            ? nothing
            : html`
                <button class="button chocolate-button small" @click=${this.onValidate}>
                  ${msg("Validate")}
                </button>
              `
        }
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "image-redact": ImageRedact
  }
}
