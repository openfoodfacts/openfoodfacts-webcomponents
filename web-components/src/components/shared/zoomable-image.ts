import { css, html, LitElement } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import Panzoom from "@panzoom/panzoom"
import { styleMap } from "lit/directives/style-map.js"

@customElement("zoomable-image")
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

  override render() {
    return html`
      <div class="panzoom-parent">
        <div class="panzoom" style=${styleMap(this.size)}>
          <img src=${this.src} @load=${this.initPanzoom} />
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
