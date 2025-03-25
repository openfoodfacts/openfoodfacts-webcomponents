import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import DOMPurify from "dompurify"
import { KnowledgePanelElement } from "../../../types/knowledge-panel"

/**
 * Text element renderer component
 *
 * @element text-element-renderer
 */
@customElement("text-element-renderer")
export class TextElementRenderer extends LitElement {
  static override styles = css`
    .text_element {
      width: 100%;
      margin-bottom: 0.85rem;
      line-height: 1.6;
      text-align: left;
      word-wrap: break-word;
      overflow-wrap: break-word;
      color: #333;
    }
  `

  @property({ type: Object })
  element?: KnowledgePanelElement

  override render(): TemplateResult {
    const textContent =
      this.element?.text_element?.html ||
      this.element?.text_element?.text ||
      this.element?.text ||
      ""

    // Sanitize the HTML first
    const sanitizedContent = DOMPurify.sanitize(textContent)

    // Then use it with unsafeHTML
    return html`<div class="text_element">${unsafeHTML(sanitizedContent)}</div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "text-element-renderer": TextElementRenderer
  }
}
