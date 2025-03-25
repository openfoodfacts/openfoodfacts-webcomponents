import { html, TemplateResult } from "lit"

/**
 * Renders the image and associated text for a panel group if it exists
 * @param panelGroup - The panel group containing the image
 * @returns Template result for the panel group image with text
 */
export function renderPanelGroupImage(panelGroup: any): TemplateResult {
  if (!panelGroup.image) {
    return html``
  }

  const imageUrl =
    panelGroup.image.sizes?.["400"]?.url || panelGroup.image.sizes?.["full"]?.url || ""

  const imageAlt = panelGroup.image.alt || "Panel image"
  const imageCaption = panelGroup.image.caption || panelGroup.image.description || ""

  return html`
    <div class="panel-image">
      <img src="${imageUrl}" alt="${imageAlt}" />
      ${imageCaption ? html`<div class="panel-image-text">${imageCaption}</div>` : html``}
    </div>
  `
}

/**
 * Renders an image with a specific URL and optional caption
 * @param imageUrl - The URL of the image to render
 * @param imageAlt - Alternative text for the image
 * @param imageCaption - Optional caption for the image
 * @returns Template result for the image with optional caption
 */
export function renderImage(
  imageUrl: string,
  imageAlt: string = "Image",
  imageCaption?: string
): TemplateResult {
  return html`
    <div class="panel-image">
      <img src="${imageUrl}" alt="${imageAlt}" />
      ${imageCaption ? html`<div class="panel-image-text">${imageCaption}</div>` : html``}
    </div>
  `
}
