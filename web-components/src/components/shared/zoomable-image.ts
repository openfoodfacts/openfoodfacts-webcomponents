import { css, html, LitElement } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import Panzoom from "@panzoom/panzoom"
import { styleMap } from "lit/directives/style-map.js"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { FLEX } from "../../styles/utils"
import "../icons/rotate-left"
import "../icons/rotate-right"
import { localized, msg } from "@lit/localize"

/**
 * A simple zoomable image component.
 * It allows to display an image that can be zoomed, and rotated.
 * It uses the panzoom library.
 * @element zoomable-image
 **/
@customElement("zoomable-image")
@localized()
export class ZoomableImage extends LitElement {
  static override styles = [
    css`
      .panzoom-parent {
        position: relative;
        position: relative;
        border: 1px solid black;
      }
      .panzoom {
        position: relative;
      }
      .panzoom img {
        display: block;
        width: 100%;
        height: 100%;
        cursor: zoom-in;
      }
    `,
    FLEX,
    getButtonClasses([ButtonType.LINK]),
  ]

  @query(".panzoom")
  element!: HTMLElement

  @state()
  panzoom!: any

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
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.element.removeEventListener("wheel", this.panzoom.zoomWithWheel)
    this.panzoom.destroy()
  }

  initPanzoom() {
    const panzoom = Panzoom(this.element, {
      maxScale: this.maxZoom,
      minScale: this.minZoom,
      canvas: true,
      startScale: this.currentZoom,
      increment: this.stepSize,
    })
    this.element.addEventListener("wheel", panzoom.zoomWithWheel)
    this.panzoom = panzoom
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
        <div class="panzoom-parent">
          <div class="panzoom" style=${styleMap(this.size)}>
            <img src=${this.src} @load=${this.initPanzoom} style=${styleMap(imageStyle)} />
          </div>
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
