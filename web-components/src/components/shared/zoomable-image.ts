import { css, html, LitElement } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import Panzoom from "@panzoom/panzoom"
import { styleMap } from "lit/directives/style-map.js"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { FLEX } from "../../styles/utils"
import "../icons/rotate-left.ts"
import "../icons/rotate-right"
import { localized, msg } from "@lit/localize"

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
  src: string = ""

  @property({ type: Number, attribute: "current-zoom" })
  currentZoom: number = 1

  @property({ type: Number, attribute: "step-size" })
  stepSize: number = 0.1

  @property({ type: Number, attribute: "min-zoom" })
  minZoom: number = 1
  @property({ type: Number, attribute: "max-zoom" })
  maxZoom: number = 5

  @state()
  rotation: number = 0

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
            <rotate-left-icon />
          </button>
          <button
            class="link-button"
            @click=${() => this.rotateImage(90)}
            title=${msg("Rotate image to the right")}
          >
            <rotate-right-icon />
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
