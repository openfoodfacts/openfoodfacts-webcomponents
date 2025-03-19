import { css, html, LitElement, nothing } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import { styleMap } from "lit/directives/style-map.js"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { FLEX } from "../../styles/utils"
import "../icons/rotate-left"
import "../icons/rotate-right"
import { localized, msg } from "@lit/localize"
import { mobileAndTabletCheck } from "../../utils/breakpoints"

import CropperCanvas from "@cropper/element-canvas"
import CropperImage from "@cropper/element-image"
import CropperHandle from "@cropper/element-handle"

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
      :host {
        display: block;
      }
      .cropper-parent {
        position: relative;
        position: relative;
        border: 1px solid black;
        background-color: white;
      }
    `,
    FLEX,
    getButtonClasses([ButtonType.LINK]),
  ]

  @query(".cropper-parent")
  element!: HTMLElement

  /*
   * Image element
   */
  @query("img")
  imageElement!: HTMLImageElement

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

  /**
   * Fallback image source url
   * If the image fails to load, this image will be displayed instead
   */
  @property({ type: String, attribute: "fallback-src" })
  fallbackSrc = ""

  @property({ type: Number, attribute: "current-zoom" })
  currentZoom = 1

  @property({ type: Number, attribute: "step-size" })
  stepSize = 0.1

  @property({ type: Number, attribute: "min-zoom" })
  minZoom = 0.3
  @property({ type: Number, attribute: "max-zoom" })
  maxZoom = 5

  @property({ type: Boolean, attribute: "show-buttons" })
  showButtons = false

  @property({ type: Object })
  size: {
    width?: string
    height?: string
    "max-width"?: string
    "max-height"?: string
  } = {
    width: "100%",
    height: "30vh",
  }

  @state()
  rotation = 0

  get canZoom() {
    return !mobileAndTabletCheck()
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
    // this.image = new Image()

    // this.image.src = this.src
    // // this.image.alt = "Picture"

    // const cropper = new Cropper(this.image, {
    //   container: this.element,
    //   // zoomable: true,
    //   // minZoom: this.minZoom,
    //   // maxZoom: this.maxZoom,
    //   // zoomOnWheel: true,
    //   // zoomOnTouch: true,
    //   // zoomOnDoubleClick: true,
    //   // zoomRatio: this.stepSize,
    //   // initialZoom: this.currentZoom,
    // })
    // this.cropper = cropper
  }

  rotateImage(rotation: number) {
    this.rotation += rotation
  }

  renderButtons() {
    if (!this.showButtons) return nothing
    return html`
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
    `
  }

  override render() {
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
            ></cropper-image>
            <cropper-handle action="move" plain></cropper-handle>
          </cropper-canvas>
        </div>
        ${this.renderButtons()}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zoomable-image": ZoomableImage
  }
}
