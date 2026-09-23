import { LitElement, html, css, type TemplateResult, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import type {
  KnowledgePanel,
  KnowledgePanelElement,
  KnowledgePanelsData,
} from "../../../types/knowledge-panel"

import "../../../utils/knowledge-panels/heading-utils"
import "../../../utils/knowledge-panels/extract-images"

import "./render-panel-header"
import "./render-element"
import "./render-image"

/**
 * Panel renderer component
 *
 * @element panel-renderer
 */
@customElement("panel-renderer")
export class PanelRenderer extends LitElement {
  static override styles = css`
    .panel {
      margin-bottom: 1.5rem;
      border-radius: 16px;
      border: 1px solid #f2d3ac;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border-bottom: 1px solid #f2d3ac;
      background: #fffdfa;
      overflow: hidden;
      transition: box-shadow 0.15s;
    }

    summary {
      background: #ffe9c7;
      font-weight: bold;
      font-size: 1.12rem;
      cursor: pointer;
      padding: 1rem 1rem;
      border-bottom: 1px solid #f2d3ac;
      outline: none;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #674d23;
      transition: background 0.18s;
    }

    summary:hover {
      background: #ffe0a6;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    .panel-size-small > details summary {
      padding: 0.5rem 1rem;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .panel-size-small .panel-header {
      gap: 0.5rem;
    }

    .panel-icon {
      border-radius: 4px;
      width: 5rem;
      height: 5rem;
      object-fit: contain;
    }

    .panel-icon-small {
      width: 1rem;
      height: 1rem;
    }

    .panel-icon-medium {
      width: 1.5rem;
      height: 1.5rem;
    }

    .panel-icon-large {
      width: 2.5rem;
      height: 2.5rem;
    }

    .arrow {
      transition: transform 0.2s;
      margin-left: 0.5rem;
      font-size: 1.3rem;
    }
    details[open] .arrow {
      transform: rotate(90deg);
    }
    .panel-content {
      padding: 1.2rem 1.3rem;
      background: #fffdfa;
    }
    .panel-subtitle {
      margin-bottom: 0.75rem;
      font-style: italic;
      color: #a88b56;
    }
  `
  @property({ type: Object })
  panel?: KnowledgePanel

  @property({ type: Boolean })
  frame = true

  @property({ type: Object })
  knowledgePanels: KnowledgePanelsData | null = null

  @property({ type: Array })
  nutritionImages: string[] = []

  @property({ type: String })
  headingLevel = "h3"

  /**
   * Checks if a panel is a nutrition panel
   * @returns True if it's a nutrition panel
   */
  isNutritionPanel(): boolean {
    if (!this.panel) return false

    const title = this.panel.title_element?.title || this.panel.title || ""
    return title.toLowerCase().includes("nutrition") || title.toLowerCase().includes("nutritional")
  }

  override render(): TemplateResult {
    if (!this.panel) return html``

    const title = this.panel.title_element?.title || this.panel.title || ""
    const subtitle = this.panel.title_element?.subtitle || ""

    const content =
      this.panel.elements.length > 0
        ? this.panel.elements.map(
            (element: KnowledgePanelElement) =>
              html`<element-renderer
                .element=${element}
                .knowledgePanels=${this.knowledgePanels}
                headingLevel=${this.headingLevel}
              ></element-renderer>`
          )
        : nothing

    const icon = this.panel.title_element?.icon_url

    if (!this.frame || this.panel.title_element == null) {
      return html`${content}`
    }

    return html`
      <div
        class="
        panel
        panel-size-${this.panel.size || "medium"}
        panel-level-${this.panel.level || "info"}
        "
      >
        <details .open=${this.panel.expanded ?? false}>
          <summary>
            <div class="panel-header">
              ${icon
                ? html`
                    <img
                      class="panel-icon panel-icon-${this.panel.title_element?.icon_size}"
                      .src=${icon}
                      .alt=${title}
                    />
                    <div>${title}</div>
                  `
                : html`<div>${title}</div>`}
            </div>
            <span class="arrow">▶</span>
          </summary>
          <div class="panel-content">
            ${subtitle ? html`<div class="panel-subtitle">${subtitle}</div>` : ""} ${content}
          </div>
        </details>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-renderer": PanelRenderer
  }
}
