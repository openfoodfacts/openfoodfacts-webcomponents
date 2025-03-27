import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"

/**
 * Panel group image renderer component
 *
 * @element panel-group-image-renderer
 */
@customElement("panel-group-image-renderer")
export class PanelGroupImageRenderer extends LitElement {
  static override styles = css`
    .panel-image {
      width: 100%;
      margin-bottom: 1.25rem;
      text-align: left;
    }

    .panel-image img {
      width: auto;
      max-width: 100%;
      height: auto;
      border-radius: 20px;
      border: 1px solid #efefef;
      display: block;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .panel-image-text {
      width: 100%;
      margin-top: 0.65rem;
      font-size: 0.9rem;
      line-height: 1.5;
      text-align: left;
      font-style: italic;
      word-wrap: break-word;
    }
  `

  @property({ type: Object })
  panelGroup: any

  override render(): TemplateResult {
    if (!this.panelGroup || !this.panelGroup.image) {
      return html``
    }

    const imageUrl =
      this.panelGroup.image.sizes?.["400"]?.url || this.panelGroup.image.sizes?.["full"]?.url || ""

    const imageAlt = this.panelGroup.image.alt || "Panel image"
    const imageCaption = this.panelGroup.image.caption || this.panelGroup.image.description || ""

    return html`
      <div class="panel-image">
        <img src="${imageUrl}" alt="${imageAlt}" />
        ${imageCaption ? html`<div class="panel-image-text">${imageCaption}</div>` : html``}
      </div>
    `
  }
}

/**
 * Generic image renderer component
 *
 * @element image-renderer
 */
@customElement("image-renderer")
export class ImageRenderer extends LitElement {
  static override styles = css`
    .panel-image {
      width: 100%;
      margin-bottom: 1.25rem;
      text-align: left;
    }

    .panel-image img {
      width: auto;
      max-width: 100%;
      height: auto;
      border-radius: 20px;
      border: 1px solid #efefef;
      display: block;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .panel-image-text {
      width: 100%;
      margin-top: 0.65rem;
      font-size: 0.9rem;
      line-height: 1.5;
      text-align: left;
      font-style: italic;
      word-wrap: break-word;
    }
  `

  @property({ type: String })
  imageUrl = ""

  @property({ type: String })
  imageAlt = "Image"

  @property({ type: String })
  imageCaption = ""

  override render(): TemplateResult {
    if (!this.imageUrl) {
      return html``
    }

    return html`
      <div class="panel-image">
        <img src="${this.imageUrl}" alt="${this.imageAlt}" />
        ${this.imageCaption
          ? html`<div class="panel-image-text">${this.imageCaption}</div>`
          : html``}
      </div>
    `
  }
}

/**
 * Nutrition image renderer component
 *
 * @element nutrition-image-renderer
 */
@customElement("nutrition-image-renderer")
export class NutritionImageRenderer extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    img {
      width: auto;
      max-width: 100%;
      height: auto;
      border-radius: 20px;
      border: 1px solid #eee;
      display: block;
      margin: 0;
    }

    .panel-image-text {
      width: 100%;
      margin-top: 0.65rem;
      font-size: 0.9rem;
      line-height: 1.5;
      text-align: left;
      font-style: italic;
      word-wrap: break-word;
    }
  `

  @property({ type: String })
  imageUrl = ""

  @property({ type: String })
  subtitle = ""

  override render(): TemplateResult {
    if (!this.imageUrl) {
      return html``
    }

    return html`
      <img src="${this.imageUrl}" alt="Nutrition Information" />
      ${this.subtitle ? html`<div class="panel-image-text">${this.subtitle}</div>` : ""}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-group-image-renderer": PanelGroupImageRenderer
    "image-renderer": ImageRenderer
    "nutrition-image-renderer": NutritionImageRenderer
  }
}
