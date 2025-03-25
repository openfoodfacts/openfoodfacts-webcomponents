import { html, TemplateResult } from "lit"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import DOMPurify from "dompurify"
import { KnowledgePanelElement } from "../../../types/knowledge-panel"

/**
 * Renders a text element with HTML or plain text content
 * @param element - The text element to render
 * @returns Template result for the text element
 */
export function renderText(element: KnowledgePanelElement): TemplateResult {
  const textContent = element.text_element?.html || element.text_element?.text || element.text || ""

  // Sanitize the HTML first
  const sanitizedContent = DOMPurify.sanitize(textContent)

  // Then use it with unsafeHTML
  return html`<div class="text_element">${unsafeHTML(sanitizedContent)}</div>`
}
