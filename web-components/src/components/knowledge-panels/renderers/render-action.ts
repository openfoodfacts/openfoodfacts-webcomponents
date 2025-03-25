import { html, TemplateResult } from "lit"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import DOMPurify from "dompurify"
import { KnowledgePanelElement } from "../../../types/knowledge-panel"

/**
 * Renders an action element with a button and improved styling
 * @param element - The action element to render
 * @returns Template result for the action element
 */
export function renderAction(element: KnowledgePanelElement): TemplateResult {
  const actionElement = element.action_element
  if (!actionElement) {
    return html``
  }

  const actionText = (actionElement as any).action_text || "Default Action"
  const actionDescription = (actionElement as any).description || ""
  const sanitizedHTML = DOMPurify.sanitize(actionElement.html || "")

  return html`
    <div class="action">
      <div>${unsafeHTML(sanitizedHTML)}</div>
      <button class="button chocolate-button" disabled>${actionText}</button>
      ${actionDescription ? html`<small>${actionDescription}</small>` : ""}
      <small>(Actions are displayed but not functional in this version)</small>
    </div>
  `
}
