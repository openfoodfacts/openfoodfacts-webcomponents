import { css, html, LitElement } from "lit"
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
        position: relative;
        border: 1px solid black;
      }
    `,
    FLEX,
    getButtonClasses([ButtonType.LINK]),
  ]

  @query(".cropper-parent")
  element!: HTMLElement

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

  @state()
  rotation = 0

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

  override render() {
    const imageStyle = {
      transform: `rotate(${this.rotation}deg)`,
    }
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
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zoomable-image": ZoomableImage
  }
}
