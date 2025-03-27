import { LitElement, html, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import { KnowledgePanelElement, KnowledgePanelsData } from "../../../types/knowledge-panel"

// Import all element renderer components so they're registered
import "./render-text"
import "./render-table"
import "./render-titled-text"
import "./render-panel-element"
import "./render-panel-group"
import "./render-action"

/**
 * Element renderer dispatcher component
 *
 * @element element-renderer
 */
@customElement("element-renderer")
export class ElementRenderer extends LitElement {
  @property({ type: Object })
  element?: KnowledgePanelElement

  @property({ type: Object })
  knowledgePanels: KnowledgePanelsData | null = null

  @property({ type: String })
  headingLevel = "h3"

  override render(): TemplateResult {
    if (!this.element || !this.element.element_type) {
      console.error("Invalid element:", this.element)
      return html``
    }

    switch (this.element.element_type) {
      case "text":
        return html`<text-element-renderer .element=${this.element}></text-element-renderer>`

      case "table":
        return html`<table-element-renderer
          .element=${this.element}
          headingLevel=${this.headingLevel}
        >
        </table-element-renderer>`

      case "titled_text":
        return html`<titled-text-element-renderer .element=${this.element}>
        </titled-text-element-renderer>`

      case "panel":
        return html`<panel-element-renderer
          .element=${this.element}
          .knowledgePanels=${this.knowledgePanels}
          headingLevel=${this.headingLevel}
        >
        </panel-element-renderer>`

      case "panel_group":
        return html`<panel-group-element-renderer
          .element=${this.element}
          .knowledgePanels=${this.knowledgePanels}
          headingLevel=${this.headingLevel}
        >
        </panel-group-element-renderer>`

      case "action":
        return html`<action-element-renderer .element=${this.element}> </action-element-renderer>`

      default:
        console.log(`Unsupported element type: ${this.element.element_type}`, this.element)
        return html``
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "element-renderer": ElementRenderer
  }
}
