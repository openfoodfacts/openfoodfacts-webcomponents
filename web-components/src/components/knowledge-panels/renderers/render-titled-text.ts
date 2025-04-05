import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import { KnowledgePanelElement } from "../../../types/knowledge-panel"

/**
 * Titled text element renderer component
 *
 * @element titled-text-element-renderer
 */
@customElement("titled-text-element-renderer")
export class TitledTextElementRenderer extends LitElement {
  static override styles = css`
    .element {
      width: 100%;
      display: block;
      padding-bottom: 0.85rem;
      margin-bottom: 0.85rem;
      border-bottom: 1px solid #f5f5f5;
      text-align: left;
    }

    .element:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .element-title {
      width: 100%;
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      text-align: left;
      word-wrap: break-word;
    }

    .element-value {
      width: 100%;
      display: block;
      color: #444;
      text-align: left;
      word-wrap: break-word;
      line-height: 1.6;
    }
  `

  @property({ type: Object })
  element?: KnowledgePanelElement

  override render(): TemplateResult {
    if (!this.element) {
      return html``
    }

    return html`
      <div class="element">
        <div class="element-title">${this.element.title || ""}</div>
        <div class="element-value">${this.element.text || ""}</div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "titled-text-element-renderer": TitledTextElementRenderer
  }
}
