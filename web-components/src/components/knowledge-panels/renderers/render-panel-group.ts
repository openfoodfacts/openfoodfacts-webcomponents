import { html, TemplateResult } from "lit"
import { KnowledgePanelElement, KnowledgePanelsData } from "../../../types/knowledge-panel"
import { renderHeading } from "../utils/heading-utils"
import { renderPanelGroupImage } from "./render-image"
import { renderPanel } from "./render-panel"

/**
 * Renders a panel group element with a title, optional image, and referenced panels
 * @param element - The panel group element to render
 * @param knowledgePanels - All available knowledge panels
 * @param headingLevel - The heading level to use
 * @returns Template result for the panel group element
 */
export function renderPanelGroup(
  element: KnowledgePanelElement,
  knowledgePanels: KnowledgePanelsData | null,
  headingLevel: string
): TemplateResult {
  const panelGroup = element.panel_group_element
  if (!panelGroup) {
    return html`<div class="warning">
      ${renderHeading("Missing Data", "warning-title", headingLevel, 1)}
      <p>Panel group without data</p>
    </div>`
  }

  return html`
    <div class="panel-group">
      ${panelGroup.title
        ? renderHeading(panelGroup.title, "panel-group-title", headingLevel, 1)
        : ""}
      ${renderPanelGroupImage(panelGroup)}
      ${renderPanelGroupPanels(panelGroup, knowledgePanels, headingLevel)}
    </div>
  `
}

/**
 * Renders the panels referenced by a panel group
 * @param panelGroup - The panel group containing panel references
 * @param knowledgePanels - All available knowledge panels
 * @param headingLevel - The heading level to use
 * @returns Array of template results for the referenced panels
 */
function renderPanelGroupPanels(
  panelGroup: any,
  knowledgePanels: KnowledgePanelsData | null,
  headingLevel: string
): TemplateResult[] {
  return (panelGroup.panel_ids || []).map((panelId: string) => {
    const panel = knowledgePanels?.[panelId]
    if (panel) {
      return renderPanel(panel, knowledgePanels, [], headingLevel)
    } else {
      return html`<div class="warning">Referenced panel not found: ${panelId}</div>`
    }
  })
}
