import { css, html, LitElement, nothing } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import Panzoom from "@panzoom/panzoom"
import { styleMap } from "lit/directives/style-map.js"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { FLEX } from "../../styles/utils"
import "../icons/rotate-left"
import "../icons/rotate-right"
import { localized, msg } from "@lit/localize"
import { mobileAndTabletCheck } from "../../utils/breakpoints"

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
      :host {
        display: block;
      }
      .panzoom-parent {
        position: relative;
        position: relative;
        border: 1px solid black;
        background-color: white;
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

  /*
   * Panzoom element
   */
  @query(".panzoom")
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
  panzoom!: any

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

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    if (["src", "size"].includes(name)) {
      this.onImageChange()
    }
  }

  override connectedCallback(): void {
    super.connectedCallback()
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback()
    if (this.canZoom) {
      this.element.parentElement!.removeEventListener("wheel", this.panzoom.zoomWithWheel)
    }
    this.panzoom.destroy()
  }

  initPanzoom() {
    const panzoom = Panzoom(this.element, {
      maxScale: this.maxZoom,
      minScale: this.minZoom,
      canvas: true,
      increment: this.stepSize,
      contain: "inside",
    })

    if (this.canZoom) {
      this.element.parentElement!.addEventListener("wheel", panzoom.zoomWithWheel)
    }
    this.panzoom = panzoom
    this.onImageChange()
  }

  resetContain() {
    setTimeout(() => {
      this.panzoom.setOptions({
        contain: undefined,
      })
    }, 100)
  }

  onImageChange() {
    if (!this.panzoom) return
    this.rotation = 0
    this.panzoom.setOptions({
      contain: "inside",
    })
    setTimeout(() => {
      this.panzoom.reset({
        animate: false,
      })
      this.resetContain()
    }, 100)
  }

  rotateImage(rotation: number) {
    this.rotation += rotation
  }

  /**
   * Fit and center the image in the container
   */
  fitAndCenterImage() {
    if (!this.panzoom) return

    setTimeout(() => {
      this.panzoom.constrainXY(0, 0, 0, {
        contain: "inside",
      })
    }, 100)
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
    const imageStyle = {
      transform: `rotate(${this.rotation}deg)`,
    }
    return html`
      <div>
        <div class="panzoom-parent" style=${styleMap(this.size)}>
          <div class="panzoom">
            <img
              src=${this.src}
              @error=${() => {
                this.src = this.fallbackSrc
              }}
              @load=${this.initPanzoom}
              style=${styleMap(imageStyle)}
            />
          </div>
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
