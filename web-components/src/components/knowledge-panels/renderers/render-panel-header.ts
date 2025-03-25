import { html, TemplateResult } from "lit"
import { renderHeading } from "../utils/heading-utils"

/**
 * Renders the header section of a knowledge panel
 * @param title - The panel title
 * @param subtitle - Optional subtitle for the panel
 * @param headingLevel - The heading level to use
 * @returns Template result for the panel header
 */
export function renderPanelHeader(
  title: string,
  subtitle?: string,
  headingLevel: string = "h3"
): TemplateResult {
  if (!title) {
    return html``
  }

  return html`
    <div class="panel-header">
      ${renderHeading(title, "panel-title", headingLevel)}
      ${subtitle ? html`<div class="panel-subtitle">${subtitle}</div>` : ""}
    </div>
  `
}
