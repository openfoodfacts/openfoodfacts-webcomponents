import { html, TemplateResult } from "lit"
import {
  KnowledgePanel,
  KnowledgePanelElement,
  KnowledgePanelsData,
} from "../../../types/knowledge-panel"
import { renderPanelHeader } from "./render-panel-header"
import { renderElement } from "./render-element"
import { renderImage } from "./render-image"

/**
 * Checks if a panel is a nutrition panel
 * @param panel - The panel to check
 * @returns True if it's a nutrition panel
 */
export function isNutritionPanel(panel: KnowledgePanel): boolean {
  const title = panel.title_element?.title || panel.title || ""
  return title.toLowerCase().includes("nutrition") || title.toLowerCase().includes("nutritional")
}

/**
 * Renders a complete knowledge panel with title and elements
 * @param panel - The knowledge panel to render
 * @param knowledgePanels - All available knowledge panels
 * @param nutritionImages - Array of nutrition-related image URLs
 * @param headingLevel - The heading level to use
 * @returns Template result for the knowledge panel
 */
export function renderPanel(
  panel: KnowledgePanel,
  knowledgePanels: KnowledgePanelsData | null,
  nutritionImages: string[],
  headingLevel: string
): TemplateResult {
  if (!panel) {
    console.error("Attempted to render null or undefined panel")
    return html`` // Return empty template instead of undefined
  }

  // Get title from title_element if available
  const title = panel.title_element?.title || panel.title || ""
  console.log("Rendering panel:", title, panel)
  // Get elements
  const elements = panel.elements || []

  // Check if this is a nutrition panel that should have the special layout
  const isNutrition = isNutritionPanel(panel)
  const panelClass = isNutrition
    ? `panel nutrition-panel ${panel.level || ""} ${panel.size || ""}`.trim()
    : `panel ${panel.level || ""} ${panel.size || ""}`.trim()

  if (isNutrition && nutritionImages.length > 0) {
    return html`
      <div class="${panelClass}">
        ${renderPanelHeader(title, panel.title_element?.subtitle, headingLevel)}
        <div class="panel-content">
          <div class="panel-left">
            <div class="elements">
              ${elements.map((element: KnowledgePanelElement) =>
                renderElement(element, knowledgePanels, nutritionImages, headingLevel)
              )}
            </div>
          </div>
          <div class="panel-right">
            ${renderImage(
              nutritionImages[0],
              "Nutrition Information",
              panel.title_element?.subtitle
            )}
          </div>
        </div>
      </div>
    `
  }

  // Standard panel layout for non-nutrition panels or nutrition panels without images
  return html`
    <div class="${panelClass}">
      ${renderPanelHeader(title, panel.title_element?.subtitle, headingLevel)}
      <div class="panel-content">
        <div class="elements">
          ${elements.map((element: KnowledgePanelElement) =>
            renderElement(element, knowledgePanels, nutritionImages, headingLevel)
          )}
        </div>
      </div>
    </div>
  `
}
