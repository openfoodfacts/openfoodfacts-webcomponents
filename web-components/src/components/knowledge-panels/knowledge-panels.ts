import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { fetchKnowledgePanels } from "../../api/knowledgepanel"
import { Task } from "@lit/task"
import "../../components/shared/loader" // Import the loader component
import { BASE } from "../../styles/base"
import { ALERT } from "../../styles/alert"
import { ButtonType, getButtonClasses } from "../../styles/buttons"

import { KnowledgePanel, KnowledgePanelsData } from "../../types/knowledge-panel"

// Import all renderer components
import "./renderers/render-panel"
import "./utils/heading-utils" // Import heading renderer component
import { extractImages } from "./utils/extract-images"

/**
 * `knowledge-panels` - A web component to display knowledge panels from any source
 *
 * @element knowledge-panels
 *
 * @property {string} url - The URL to fetch the knowledge panels from
 * @property {string} path - The path to the knowledge panels inside the JSON response (e.g., "product.knowledge_panels")
 * @property {string} headingLevel - The heading level to use for panel titles (h2, h3, h4, h5, h6)
 */
@customElement("knowledge-panels")
export class KnowledgePanelsComponent extends LitElement {
  static override styles = [
    BASE,
    ALERT,
    ...getButtonClasses([ButtonType.Chocolate, ButtonType.Cappucino]),
    css`
      :host {
        display: block;
        width: 100%;
        max-width: 100%;
        margin-bottom: 1.5rem;
        box-sizing: border-box;
        overflow-x: hidden; /* Prevent horizontal scrolling */
      }

      /* Apply box-sizing to all elements */
      *,
      *:before,
      *:after {
        box-sizing: border-box;
      }

      /* Knowledge panels container */
      .knowledge-panels-container {
        width: 100%;
        text-align: left;
        overflow-x: hidden; /* Prevent horizontal scrolling */
      }

      .knowledge-panels-section-title {
        width: 100%;
        text-align: left;
        margin-bottom: 1.25rem;
        word-wrap: break-word;
        font-weight: 600;
        font-size: 1.3rem;
      }

      .info {
        padding: 0.75rem;
        margin-bottom: 1rem;
        border: 1px solid transparent;
        border-radius: 0.25rem;
        color: #0c5460;
        background-color: #d1ecf1;
        border-color: #bee5eb;
      }

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
      }
    `,
  ]

  @property({
    type: String,
    reflect: true,
    attribute: "heading-level", // Explicitly match the attribute name
  })
  headingLevel = "h3" // Set a default value

  @property({ type: String })
  url = ""

  @property({ type: String })
  path = ""

  @state()
  private knowledgePanels: KnowledgePanelsData | null = null

  @state()
  private nutritionImages: string[] = []

  /**
   * Task to fetch knowledge panels
   */
  private _knowledgePanelsTask = new Task(this, {
    task: async ([url, path]: [string, string]) => {
      if (!url || !path) {
        return null
      }
      return await fetchKnowledgePanels(url, path)
    },
    args: () => [this.url, this.path] as [string, string],
  })

  /**
   * Handle errors in a more user-friendly way
   * @param error - The error to display
   * @returns Template result for the error display
   */
  renderError(error: unknown): TemplateResult {
    console.error("Task error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return html`
      <slot name="error">
        <heading-renderer
          text="Error Loading Knowledge Panels"
          class-name="error-title"
          heading-level="${this.headingLevel}"
        >
        </heading-renderer>
        <p>${errorMessage}</p>
        <button class="button cappucino-button" @click=${this._retryLoad}>Retry</button>
      </slot>
    `
  }

  /**
   * Handle retry of data loading
   * @private
   */
  private _retryLoad(): void {
    this._knowledgePanelsTask.run()
  }

  /**
   * Main render method for the component
   * @returns Template result for the entire component
   */
  override render(): TemplateResult {
    return this._knowledgePanelsTask.render({
      initial: () => html`<div class="info">Ready to load knowledge panels.</div>`,
      pending: () => html`
        <div class="loading">
          <off-wc-loader></off-wc-loader>
        </div>
      `,
      complete: (result) => this.renderPanelsResult(result),
      error: (error: unknown) => this.renderError(error),
    })
  }

  /**
   * Renders the panels data once it has been loaded
   * @param result - The panels data from the API
   * @returns Template result for the panels
   */
  renderPanelsResult(result: unknown): TemplateResult {
    const panels = result as KnowledgePanelsData
    console.log("Panels received:", panels)

    if (!panels || typeof panels !== "object") {
      console.error("Invalid panels data:", panels)
      return html`<slot name="error">Invalid data format received</slot>`
    }

    if (Object.keys(panels).length === 0) {
      // Use a heading for the empty state message
      const emptyHeading = "No Knowledge Panels Available"
      return html`
        <div class="info">
          <heading-renderer
            text="${emptyHeading}"
            class-name="empty-heading"
            heading-level="${this.headingLevel}"
          >
          </heading-renderer>
          <p>No knowledge panels were found for this request.</p>
        </div>
      `
    }

    // Store panels in the instance for reference
    this.knowledgePanels = panels

    // Extract all nutrition-related images
    this.nutritionImages = extractImages(panels)

    // Create an array of top-level panels (ones that aren't only referenced by others)
    const topLevelPanelIds = ["health_card", "product_card", "product_details"]
    const topLevelPanels = topLevelPanelIds.filter((id) => panels[id]).map((id) => panels[id])

    // If no top-level panels found, show all panels
    const panelsToRender = topLevelPanels.length > 0 ? topLevelPanels : Object.values(panels)
    console.log("Panels to render:", panelsToRender)

    // Add a section title for the overall panels
    const sectionTitle = "Knowledge Panels"

    return html`
      <div class="knowledge-panels-container">
        <heading-renderer
          text="${sectionTitle}"
          class-name="knowledge-panels-section-title"
          heading-level="${this.headingLevel}"
        >
        </heading-renderer>
        ${panelsToRender.map((panel: KnowledgePanel) =>
          panel
            ? html` <panel-renderer
                .panel=${panel}
                .knowledgePanels=${this.knowledgePanels}
                .nutritionImages=${this.nutritionImages}
                headingLevel=${this.headingLevel}
              >
              </panel-renderer>`
            : html``
        )}
      </div>
    `
  }

  /**
   * Connected callback - called when the element is added to the DOM
   */
  override connectedCallback(): void {
    super.connectedCallback()
    // Add any initialization code here if needed
  }

  /**
   * Disconnected callback - called when the element is removed from the DOM
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // Clean up any resources here if needed
  }

  /**
   * Updated callback - called when element attributes change
   * @param changedProperties - Map of changed properties
   */
  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties)

    if (changedProperties.has("url") || changedProperties.has("path")) {
      // Reset state when URL or path changes
      this.knowledgePanels = null
      this.nutritionImages = []
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "knowledge-panels": KnowledgePanelsComponent
  }
}
