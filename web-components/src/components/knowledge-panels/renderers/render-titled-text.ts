import { html, TemplateResult } from "lit"
import { KnowledgePanelElement } from "../../../types/knowledge-panel"

/**
 * Renders a titled text element with a title and value
 * @param element - The titled text element to render
 * @returns Template result for the titled text element
 */
export function renderTitledText(element: KnowledgePanelElement): TemplateResult {
  return html`
    <div class="element">
      <div class="element-title">${element.title || ""}</div>
      <div class="element-value">${element.text || ""}</div>
    </div>
  `
}
