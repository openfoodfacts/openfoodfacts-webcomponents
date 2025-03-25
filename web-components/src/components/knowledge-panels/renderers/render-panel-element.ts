import { html, TemplateResult } from "lit"
import { KnowledgePanelElement, KnowledgePanelsData } from "../../../types/knowledge-panel"
import { renderPanel } from "./render-panel"
import { renderHeading } from "../utils/heading-utils"
import { renderElement } from "./render-element"

/**
 * Renders a panel element, which can either reference another panel or contain its own elements
 * @param element - The panel element to render
 * @param knowledgePanels - All available knowledge panels
 * @param nutritionImages - Array of nutrition-related image URLs
 * @param headingLevel - The heading level to use
 * @returns Template result for the panel element
 */
export function renderPanelElement(
  element: KnowledgePanelElement,
  knowledgePanels: KnowledgePanelsData | null,
  nutritionImages: string[],
  headingLevel: string
): TemplateResult {
  // For panel elements, we either render the referenced panel or its own content
  if (element.panel_element?.panel_id) {
    const panelId = element.panel_element.panel_id
    // We need to get the actual panel from the panels data
    const referencedPanel = knowledgePanels?.[panelId]
    if (referencedPanel) {
      return renderPanel(referencedPanel, knowledgePanels, nutritionImages, headingLevel)
    } else {
      return html`<div class="warning">Referenced panel not found: ${panelId}</div>`
    }
  } else if (element.elements && Array.isArray(element.elements)) {
    return html`
      <div class="sub-panel">
        ${element.title ? renderHeading(element.title, "sub-panel-title", headingLevel, 1) : ""}
        <div class="elements">
          ${element.elements.map((subElement: KnowledgePanelElement) =>
            renderElement(subElement, knowledgePanels, nutritionImages, headingLevel)
          )}
        </div>
      </div>
    `
  }
  return html`<div class="warning">Panel without elements</div>`
}
