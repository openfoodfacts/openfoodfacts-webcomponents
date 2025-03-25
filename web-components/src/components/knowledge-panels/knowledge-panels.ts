import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { fetchKnowledgePanels } from "../../api/knowledgepanel"
import { Task } from "@lit/task"
import "../../components/shared/loader" // Import the loader component
import { BASE } from "../../styles/base"
import { ALERT } from "../../styles/alert"
import { ButtonType, getButtonClasses } from "../../styles/buttons"

import { KnowledgePanel, KnowledgePanelsData } from "../../types/knowledge-panel"

// Import all renderer modules
import { renderPanel } from "./renderers/render-panel"
import { renderHeading } from "./utils/heading-utils"
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
export class KnowledgePanelComponent extends LitElement {
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

      /* Panel Base Styles - Even more roundness */
      .panel {
        width: 100%;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 24px; /* Further increased for maximum roundness */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        margin-bottom: 1.5rem;
        overflow: hidden;
        transition: box-shadow 0.2s ease;
      }

      .panel:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      }

      /* Remove small panel size limit */
      .panel.small {
        max-width: 100%;
      }

      /* Panel Contextual Variations - Flat left side, rounded right corners */
      .panel.info {
        border-left: 4px solid #79e1a6;
        border-radius: 0 24px 24px 0; /* Flat left side, extra rounded right corners */
      }

      .panel.warning {
        border-left: 4px solid #f0ad4e;
        border-radius: 0 24px 24px 0; /* Flat left side, extra rounded right corners */
      }

      .panel.success {
        border-left: 4px solid #5cb85c;
        border-radius: 0 24px 24px 0; /* Flat left side, extra rounded right corners */
      }

      .panel.danger {
        border-left: 4px solid #d9534f;
        border-radius: 0 24px 24px 0; /* Flat left side, extra rounded right corners */
      }

      /* Panel Components - Refined spacing */
      .panel-header {
        width: 100%;
        border-bottom: 1px solid #eeeeee;
        padding: 1rem 1.25rem;
        display: block;
      }

      .panel-title {
        width: 100%;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
        text-align: left;
        word-wrap: break-word; /* Handle long titles */
      }

      .panel-subtitle {
        width: 100%;
        font-size: 0.95rem;
        margin-top: 0.35rem;
        text-align: left;
        word-wrap: break-word;
      }

      /* Panel content - Improved padding */
      .panel-content {
        width: 100%;
        padding: 1.25rem;
        display: block;
      }

      /* Layout for all panels - including nutrition */
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
        border-radius: 20px; /* Further increased roundness */
        border: 1px solid #eee;
        display: block;
        margin: 0;
      }

      /* Element Layout - Better spacing */
      .elements {
        width: 100%;
        display: block;
      }

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

      /* Special Element Styling - Improved readability */
      .text_element {
        width: 100%;
        margin-bottom: 0.85rem;
        line-height: 1.6;
        text-align: left;
        word-wrap: break-word;
        overflow-wrap: break-word;
        color: #333;
      }

      /* Table Styling - Maximally rounded borders */
      .table_element {
        width: 100%;
        overflow-x: auto; /* Allow horizontal scrolling for tables on small screens */
        margin-bottom: 1.25rem;
        border-radius: 20px; /* Even more rounded */
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .table_element table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin-bottom: 0.5rem;
        text-align: left;
        border: 1px solid #e6e6e6;
        border-radius: 20px; /* Even more rounded */
        overflow: hidden;
      }

      .table_element th,
      .table_element td {
        border: 1px solid #e6e6e6;
        padding: 0.75rem;
        text-align: left;
      }

      .table_element th {
        background-color: #f8f9fa;
        font-weight: 600;
      }

      .table_element tr:nth-child(even) {
        background-color: #fcfcfc;
      }

      .table_element tr:hover {
        background-color: #f7f7f7;
      }

      /* Panel Groups - Enhanced typography */
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

      /* Panel Images and Text - Improved image handling with increased roundness */
      .panel-image {
        width: 100%;
        margin-bottom: 1.25rem;
        text-align: left;
      }

      .panel-image img {
        width: auto; /* Allow image to maintain its aspect ratio */
        max-width: 100%; /* Ensure image doesn't overflow its container */
        height: auto;
        border-radius: 20px; /* Further increased roundness */
        border: 1px solid #efefef;
        display: block;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .panel-image-text {
        width: 100%;
        margin-top: 0.65rem;
        font-size: 0.9rem;
        line-height: 1.5;
        text-align: left;
        font-style: italic;
        word-wrap: break-word;
      }

      /* Don't hide nutrition images since we're not using the two-column layout anymore */
      .nutrition-panel .panel-image {
        display: block;
        width: 100%;
      }

      /* Sub Panels - All corners rounded with increased radius */
      .sub-panel {
        width: 100%; /* Takes full width of its parent container */
        margin-bottom: 1.25rem;
        padding: 1rem;
        border-left: 3px solid #e8e8e8;
        background-color: #fafafa;
        border-radius: 20px; /* All corners rounded now */
        text-align: left;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
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

      /* Sub panel elements */
      .sub-panel .element {
        width: 100%;
      }

      .sub-panel .elements {
        width: 100%;
      }

      /* Action Components - Maximally enhanced roundness */
      .action {
        width: 100%;
        margin: 1rem 0;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 22px; /* Further increased for maximum roundness */
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

      /* Responsive improvements for various screen sizes */
      @media (min-width: 769px) {
        .panel-header {
          padding: 1.25rem 1.5rem;
        }

        .panel-content {
          padding: 1.5rem;
        }

        .sub-panel {
          padding: 1.25rem;
        }
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
        ${renderHeading("Error Loading Knowledge Panels", "error-title", this.headingLevel)}
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
          ${renderHeading(emptyHeading, "empty-heading", this.headingLevel)}
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
        ${renderHeading(sectionTitle, "knowledge-panels-section-title", this.headingLevel)}
        ${panelsToRender.map((panel: KnowledgePanel) =>
          panel
            ? renderPanel(panel, this.knowledgePanels, this.nutritionImages, this.headingLevel)
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
    "knowledge-panels": KnowledgePanelComponent
  }
}
