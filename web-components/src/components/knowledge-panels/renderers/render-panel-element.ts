import { LitElement, html, css, type TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import type { KnowledgePanelElement, KnowledgePanelsData } from "../../../types/knowledge-panel"
import "../../../utils/knowledge-panels/heading-utils" // Import heading renderer component

/**
 * Panel element renderer component
 *
 * @element panel-element-renderer
 */
@customElement("panel-element-renderer")
export class PanelElementRenderer extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      overflow-x: hidden; /* Prevent horizontal overflow at component level */
    }

    .warning {
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: 0.25rem;
      color: #856404;
      background-color: #fff3cd;
      border-color: #ffeeba;
    }

    .sub-panel {
      box-sizing: border-box; /* Include padding in width calculation */
      width: 100%;
      margin-bottom: 1.25rem;
      padding: 1rem;
      border-left: 3px solid #e8e8e8;
      background-color: #fafafa;
      border-radius: 20px;
      text-align: left;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
      overflow-x: hidden; /* Prevent horizontal overflow */
      word-wrap: break-word; /* Ensure long words don't cause overflow */
      overflow-wrap: break-word; /* Modern version of word-wrap */
    }

    .sub-panel-title {
      width: 100%;
      margin-top: 0;
      margin-bottom: 0.65rem;
      font-size: 1.05rem;
      border-bottom: none;
      padding-bottom: 0;
      text-align: left;
      word-wrap: break-word;
    }

    .elements {
      width: 100%;
      overflow-x: hidden; /* Prevent horizontal overflow in nested elements */
    }
  `

  @property({ type: Object })
  element?: KnowledgePanelElement

  @property({ type: Object })
  knowledgePanels: KnowledgePanelsData | null = null

  @property({ type: String })
  headingLevel = "h3"

  override render(): TemplateResult {
    if (!this.element) {
      return html``
    }

    // For panel elements, we either render the referenced panel or its own content
    if (this.element.panel_element?.panel_id) {
      const panelId = this.element.panel_element.panel_id
      // We need to get the actual panel from the panels data
      const referencedPanel = this.knowledgePanels?.[panelId]
      if (referencedPanel) {
        return html`<panel-renderer
          .panel=${referencedPanel}
          .knowledgePanels=${this.knowledgePanels}
          headingLevel=${this.headingLevel}
        >
        </panel-renderer>`
      } else {
        return html`<div class="warning">Referenced panel not found: ${panelId}</div>`
      }
    } else if (this.element.elements && Array.isArray(this.element.elements)) {
      return html`
        <div class="sub-panel">
          ${this.element.title
            ? html`<heading-renderer
                text="${this.element.title}"
                class-name="sub-panel-title"
                heading-level="${this.headingLevel}"
                offset="1"
              >
              </heading-renderer>`
            : ""}
          <div class="elements">
            ${this.element.elements.map(
              (subElement: KnowledgePanelElement) =>
                html`<element-renderer
                  .element=${subElement}
                  .knowledgePanels=${this.knowledgePanels}
                  headingLevel=${this.headingLevel}
                >
                </element-renderer>`
            )}
          </div>
        </div>
      `
    }
    return html`<div class="warning">Panel without elements</div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-element-renderer": PanelElementRenderer
  }
}
