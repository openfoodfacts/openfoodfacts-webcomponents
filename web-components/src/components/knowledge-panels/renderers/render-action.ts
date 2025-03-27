import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import DOMPurify from "dompurify"
import { KnowledgePanelElement } from "../../../types/knowledge-panel"

/**
 * Action element renderer component
 *
 * @element action-element-renderer
 */
@customElement("action-element-renderer")
export class ActionElementRenderer extends LitElement {
  static override styles = css`
    .action {
      width: 100%;
      margin: 1rem 0;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 22px;
      border: 1px solid #e8e8e8;
      text-align: left;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }

    .action small {
      width: 100%;
      display: block;
      margin-top: 0.5rem;
      font-style: italic;
      font-size: 0.85rem;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .button {
      display: inline-block;
      font-weight: 500;
      text-align: center;
      vertical-align: middle;
      cursor: pointer;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      border-radius: 0.25rem;
      transition:
        color 0.15s ease-in-out,
        background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
    }

    .chocolate-button {
      color: #fff;
      background-color: #7d5437;
      border-color: #6a4730;
    }

    .chocolate-button:hover {
      color: #fff;
      background-color: #60412b;
      border-color: #4d3422;
    }
  `

  @property({ type: Object })
  element?: KnowledgePanelElement

  override render(): TemplateResult {
    if (!this.element) {
      return html``
    }

    const actionElement = this.element.action_element
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
}

declare global {
  interface HTMLElementTagNameMap {
    "action-element-renderer": ActionElementRenderer
  }
}
