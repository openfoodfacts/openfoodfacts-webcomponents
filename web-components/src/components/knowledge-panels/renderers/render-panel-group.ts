import { LitElement, html, css, type TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import type { KnowledgePanelElement, KnowledgePanelsData } from "../../../types/knowledge-panel"
import "../../../utils/knowledge-panels/heading-utils"

/**
 * Panel group element renderer component
 *
 * @element panel-group-element-renderer
 */
@customElement("panel-group-element-renderer")
export class PanelGroupElementRenderer extends LitElement {
  static override styles = css`
    .panel-group {
      width: 100%;
      margin-bottom: 1.75rem;
      text-align: left;
    }

    .panel-group-title {
      width: 100%;
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.15rem;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f0f0f0;
      text-align: left;
      word-wrap: break-word;
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

    const panelGroup = this.element.panel_group_element
    if (!panelGroup) {
      return html`<div class="warning">
        <heading-renderer
          text="Missing Data"
          class-name="warning-title"
          heading-level="${this.headingLevel}"
          offset="1"
        >
        </heading-renderer>
        <p>Panel group without data</p>
      </div>`
    }

    return html`
      <div class="panel-group">
        ${panelGroup.title
          ? html`<heading-renderer
              text="${panelGroup.title}"
              class-name="panel-group-title"
              heading-level="${this.headingLevel}"
              offset="1"
            >
            </heading-renderer>`
          : ""}
        <panel-group-image-renderer .panelGroup=${panelGroup}></panel-group-image-renderer>
        ${this.renderPanelGroupPanels(panelGroup)}
      </div>
    `
  }

  /**
   * Renders the panels referenced by a panel group
   * @param panelGroup - The panel group containing panel references
   * @returns Array of rendered panels
   */
  renderPanelGroupPanels(panelGroup: any): TemplateResult[] {
    return (panelGroup.panel_ids || []).map((panelId: string) => {
      const panel = this.knowledgePanels?.[panelId]
      if (panel) {
        return html`<panel-renderer
          .panel=${panel}
          .knowledgePanels=${this.knowledgePanels}
          headingLevel=${this.headingLevel}
        >
        </panel-renderer>`
      } else {
        return html`<div class="warning">Referenced panel not found: ${panelId}</div>`
      }
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-group-element-renderer": PanelGroupElementRenderer
  }
}
