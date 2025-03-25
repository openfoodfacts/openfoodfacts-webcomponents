import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import {
  KnowledgePanel,
  KnowledgePanelElement,
  KnowledgePanelsData,
} from "../../../types/knowledge-panel"
import "./render-panel-header"
import "./render-element"
import "./render-image"
import "../utils/extract-images"

/**
 * Panel renderer component
 *
 * @element panel-renderer
 */
@customElement("panel-renderer")
export class PanelRenderer extends LitElement {
  static override styles = css`
    .panel {
      width: 96%;
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      margin-bottom: 1.5rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }

    .panel:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }

    .panel.small {
      max-width: 100%;
    }

    .panel.info {
      border-left: 4px solid #79e1a6;
      border-radius: 0 24px 24px 0;
    }

    .panel.warning {
      border-left: 4px solid #f0ad4e;
      border-radius: 0 24px 24px 0;
    }

    .panel.success {
      border-left: 4px solid #5cb85c;
      border-radius: 0 24px 24px 0;
    }

    .panel.danger {
      border-left: 4px solid #d9534f;
      border-radius: 0 24px 24px 0;
    }

    .panel-content {
      width: 100%;
      padding: 1.25rem;
      display: block;
    }

    .nutrition-panel .panel-content {
      width: 100%;
      display: block;
    }

    .nutrition-panel .panel-content .panel-left,
    .nutrition-panel .panel-content .panel-right {
      display: block;
      width: 100%;
      max-width: 100%;
      margin: 0 0 1.25rem 0;
    }

    .nutrition-panel .panel-content .panel-right img {
      width: auto;
      max-width: 100%;
      height: auto;
      border-radius: 20px;
      border: 1px solid #eee;
      display: block;
      margin: 0;
    }

    .elements {
      width: 100%;
      display: block;
    }

    @media (min-width: 769px) {
      .panel-content {
        padding: 1.5rem;
      }
    }
  `

  @property({ type: Object })
  panel?: KnowledgePanel

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
    if (!this.panel) {
      console.error("Attempted to render null or undefined panel")
      return html``
    }

    // Get title from title_element if available
    const title = this.panel.title_element?.title || this.panel.title || ""
    const subtitle = this.panel.title_element?.subtitle

    // Get elements
    const elements = this.panel.elements || []

    // Check if this is a nutrition panel that should have the special layout
    const isNutrition = this.isNutritionPanel()
    const panelClass = isNutrition
      ? `panel nutrition-panel ${this.panel.level || ""} ${this.panel.size || ""}`.trim()
      : `panel ${this.panel.level || ""} ${this.panel.size || ""}`.trim()

    if (isNutrition && this.nutritionImages.length > 0) {
      return html`
        <div class="${panelClass}">
          <panel-header-renderer
            title="${title}"
            subtitle="${subtitle || ""}"
            headingLevel="${this.headingLevel}"
          >
          </panel-header-renderer>
          <div class="panel-content">
            <div class="panel-left">
              <div class="elements">
                ${elements.map(
                  (element: KnowledgePanelElement) =>
                    html`<element-renderer
                      .element=${element}
                      .knowledgePanels=${this.knowledgePanels}
                      headingLevel=${this.headingLevel}
                    >
                    </element-renderer>`
                )}
              </div>
            </div>
            <div class="panel-right">
              <nutrition-image-renderer
                imageUrl="${this.nutritionImages[0]}"
                subtitle="${subtitle || ""}"
              >
              </nutrition-image-renderer>
            </div>
          </div>
        </div>
      `
    }

    // Standard panel layout for non-nutrition panels or nutrition panels without images
    return html`
      <div class="${panelClass}">
        <panel-header-renderer
          title="${title}"
          subtitle="${subtitle || ""}"
          headingLevel="${this.headingLevel}"
        >
        </panel-header-renderer>
        <div class="panel-content">
          <div class="elements">
            ${elements.map(
              (element: KnowledgePanelElement) =>
                html`<element-renderer
                  .element=${element}
                  .knowledgePanels=${this.knowledgePanels}
                  headingLevel=${this.headingLevel}
                >
                </element-renderer>`
            )}
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-renderer": PanelRenderer
  }
}
