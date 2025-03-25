import { html, TemplateResult } from "lit"
import { KnowledgePanelElement, KnowledgePanelsData } from "../../../types/knowledge-panel"
import { renderText } from "./render-text"
import { renderTable } from "./render-table"
import { renderTitledText } from "./render-titled-text"
import { renderPanelElement } from "./render-panel-element"
import { renderPanelGroup } from "./render-panel-group"
import { renderAction } from "./render-action"

/**
 * Main element renderer - delegates to specific renderers based on element type
 * @param element - The knowledge panel element to render
 * @param knowledgePanels - All available knowledge panels
 * @param nutritionImages - Array of nutrition-related image URLs
 * @param headingLevel - The heading level to use
 * @returns Template result for the element
 */
export function renderElement(
  element: KnowledgePanelElement,
  knowledgePanels: KnowledgePanelsData | null,
  nutritionImages: string[],
  headingLevel: string
): TemplateResult {
  if (!element || !element.element_type) {
    console.error("Invalid element:", element)
    return html``
  }

  switch (element.element_type) {
    case "text":
      return renderText(element)
    case "table":
      return renderTable(element, headingLevel)
    case "titled_text":
      return renderTitledText(element)
    case "panel":
      return renderPanelElement(element, knowledgePanels, nutritionImages, headingLevel)
    case "panel_group":
      return renderPanelGroup(element, knowledgePanels, headingLevel)
    case "action":
      return renderAction(element)
    default:
      console.log(`Unsupported element type: ${element.element_type}`, element)
      return html``
  }
}
