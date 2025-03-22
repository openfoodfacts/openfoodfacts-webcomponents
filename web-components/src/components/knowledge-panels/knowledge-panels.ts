import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { fetchKnowledgePanels } from "../../api/knowledgepanel"
import { Task } from "@lit/task"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import { ALERT } from "../../styles/alert"
import "../../components/shared/loader" // Import the loader component
import { ButtonType, getButtonClasses } from "../../styles/buttons" // Import button styles
import { VISUALLY_HIDDEN_FOCUSABLE } from "../../styles/accessibility" // Import accessibility styles
import { BASE } from "../../styles/base" // Import BASE for font styles

import {
  KnowledgePanel,
  KnowledgePanelElement,
  KnowledgePanelsData,
  TableColumn,
  TableRow,
  TableCell,
  TableElement,
} from "../../types/knowledge-panel"

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
    VISUALLY_HIDDEN_FOCUSABLE,
    ALERT,
    ...getButtonClasses([ButtonType.Chocolate, ButtonType.Cappucino]), // Add button styles
    css`
      :host {
        display: block;
        max-width: 100%;
        margin-bottom: 1rem;
      }

      /* Panel Base Styles */
      .panel {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        margin-bottom: 1rem;
        overflow: hidden;
        transition: box-shadow 0.2s ease;
      }

      .panel:hover {
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
      }

      .panel.small {
        max-width: 500px;
      }

      /* Panel Contextual Variations */
      .panel.info {
        border-left: 3px solid #5bc0de;
      }

      .panel.warning {
        border-left: 3px solid #f0ad4e;
      }

      .panel.success {
        border-left: 3px solid #5cb85c;
      }

      .panel.danger {
        border-left: 3px solid #d9534f;
      }

      /* Panel Components */
      .panel-header {
        background-color: #f8f8f8;
        border-bottom: 1px solid #ddd;
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .panel-title {
        color: #333;
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
      }

      .panel-subtitle {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }

      .panel-content {
        padding: 1rem;
      }

      /* Element Layout */
      .elements {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .element {
        display: flex;
        gap: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 0.5rem;
      }

      .element:last-child {
        border-bottom: none;
      }

      .element-title {
        font-weight: 600;
        min-width: 200px;
        color: #444;
      }

      .element-value {
        flex: 1;
        color: #555;
      }

      /* Special Element Styling */
      .text_element {
        margin-bottom: 0.75rem;
        line-height: 1.5;
      }

      /* Table Styling */
      .table_element table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 0.5rem;
      }

      .table_element th,
      .table_element td {
        border: 1px solid #ddd;
        padding: 0.625rem;
        text-align: left;
      }

      .table_element th {
        background-color: #f8f8f8;
        font-weight: 600;
        color: #444;
      }

      .table_element tr:nth-child(even) {
        background-color: #fafafa;
      }

      .table_element tr:hover {
        background-color: #f5f5f5;
      }

      /* Panel Groups */
      .panel-group {
        margin-bottom: 1.5rem;
      }

      .panel-group-title {
        margin-top: 0;
        margin-bottom: 0.75rem;
        font-size: 1.1rem;
        color: #444;
        font-weight: 600;
        padding-bottom: 0.375rem;
        border-bottom: 1px solid #eee;
      }

      /* Panel Images */
      .panel-image {
        margin-bottom: 1rem;
        text-align: center;
      }

      .panel-image img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        border: 1px solid #eee;
      }

      /* Sub Panels */
      .sub-panel {
        margin-bottom: 1rem;
        padding: 0.75rem;
        border-left: 2px solid #eee;
        background-color: #fafafa;
        border-radius: 0 4px 4px 0;
      }

      .sub-panel-title {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        color: #555;
        border-bottom: none;
        padding-bottom: 0;
      }

      /* Action Components */
      .action {
        margin: 0.75rem 0;
        padding: 0.75rem;
        background-color: #f9f9f9;
        border-radius: 4px;
        border: 1px solid #eee;
      }

      .action small {
        display: block;
        color: #999;
        margin-top: 0.375rem;
        font-style: italic;
        font-size: 0.85rem;
      }

      /* Responsive Adjustments */
      @media (max-width: 768px) {
        .element {
          flex-direction: column;
          gap: 0.25rem;
        }

        .element-title {
          min-width: 100%;
        }

        .panel-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ]

  @property({ 
    type: String,
    reflect: true,
    attribute: 'heading-level' // Explicitly match the attribute name
  })
  headingLevel = "h3" // Set a default value

  @property({ type: String })
  url = ""

  @property({ type: String })
  path = ""

  @state()
  private knowledgePanels: KnowledgePanelsData | null = null

  /**
   * Add debug information to see what's happening with the component
   */
  override connectedCallback(): void {
    super.connectedCallback();
    // console.log("Knowledge Panels Component Connected");
    // console.log("Heading Level Attribute:", this.getAttribute('heading-level'));
    // console.log("Heading Level Property:", this.headingLevel);
    // console.log("Validated Heading Level:", this.getValidHeadingLevel());
  }

  /**
   * Also add debug for attribute changes
   */
  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'heading-level') {
      console.log("Heading Level Attribute Changed:", oldValue, "->", newValue);
    }
  }

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
   * Validates and normalizes the heading level
   * @returns Validated heading level string
   */
  private getValidHeadingLevel(): string {
    const validLevels = ["h1", "h2", "h3", "h4", "h5", "h6"]
    const level = this.headingLevel.toLowerCase()
    return validLevels.includes(level) ? level : "h3" // Default to h3 if invalid
  }

  /**
   * Calculates a subordinate heading level based on the main heading level
   * @param offset - Number of levels to add (1 = one level deeper)
   * @returns A valid heading level string (h1-h6)
   */
  private getSubHeadingLevel(offset: number = 1): string {
    const currentLevel = parseInt(this.getValidHeadingLevel().substring(1))
    const newLevel = Math.min(currentLevel + offset, 6) // Ensure we don't go beyond h6
    return `h${newLevel}`
  }

  /**
   * Renders a dynamic heading based on the configured level
   * @param text - Text content for the heading
   * @param className - Optional CSS class for the heading
   * @param offset - Optional level offset from the base heading level
   * @returns Template result for the heading
   */
  renderHeading(text: string, className?: string, offset: number = 0): TemplateResult {
    // If offset is provided, calculate a different heading level
    const level = offset === 0 ? this.getValidHeadingLevel() : this.getSubHeadingLevel(offset)
    const classAttr = className ? `class="${className}"` : ""
    
    // Using unsafeHTML to dynamically create the appropriate heading element
    return html`${unsafeHTML(`<${level} ${classAttr}>${text}</${level}>`)}`
  }

  /**
   * Main element renderer - delegates to specific renderers based on element type
   * @param element - The knowledge panel element to render
   * @returns Template result for the element
   */
  renderElement(element: KnowledgePanelElement): TemplateResult {
    if (!element || !element.element_type) {
      console.error("Invalid element:", element)
      return html``
    }

    // console.log("Rendering element type:", element.element_type, element)

    switch (element.element_type) {
      case "text":
        return this.renderText(element)
      case "table":
        return this.renderTable(element)
      case "titled_text":
        return this.renderTitledText(element)
      case "panel":
        return this.renderPanelElement(element)
      case "panel_group":
        return this.renderPanelGroup(element)
      case "action":
        return this.renderAction(element)
      default:
        console.log(`Unsupported element type: ${element.element_type}`, element)
        return html``
    }
  }

  /**
   * Renders a text element with HTML or plain text content
   * @param element - The text element to render
   * @returns Template result for the text element
   */
  renderText(element: KnowledgePanelElement): TemplateResult {
    const textContent =
      element.text_element?.html || element.text_element?.text || element.text || ""
    return html`<div class="text_element">${unsafeHTML(textContent)}</div>`
  }

  /**
   * Renders a table element with columns and rows
   * @param element - The table element to render
   * @returns Template result for the table element
   */
  renderTable(element: KnowledgePanelElement): TemplateResult {
    const tableData = element.table_element || ({} as TableElement)

    if (!tableData) {
      console.error("Invalid table element - missing table_element:", element)
      return html`<div class="error">Invalid table format</div>`
    }

    const columns = tableData.columns || []
    const rows = tableData.rows || []

    if (!Array.isArray(columns) || !Array.isArray(rows)) {
      console.error("Invalid table structure:", tableData)
      return html`<div class="error">Invalid table structure</div>`
    }

    return html`
      <div class="table_element">
        ${tableData.title ? this.renderHeading(tableData.title, "table-title") : ""}
        <table>
          <thead>
            <tr>
              ${columns.map(
                (column: TableColumn) => html`<th>${column.text || column.id || ""}</th>`
              )}
            </tr>
          </thead>
          <tbody>
            ${rows.map(
              (row: TableRow) => html`
                <tr>
                  ${(row.cells || []).map(
                    (cell: TableCell) => html`<td>${cell.text || cell.value || ""}</td>`
                  )}
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `
  }

  /**
   * Renders a titled text element with a title and value
   * @param element - The titled text element to render
   * @returns Template result for the titled text element
   */
  renderTitledText(element: KnowledgePanelElement): TemplateResult {
    return html`
      <div class="element">
        <div class="element-title">${element.title || ""}</div>
        <div class="element-value">${element.text || ""}</div>
      </div>
    `
  }

  /**
   * Renders a panel element, which can either reference another panel or contain its own elements
   * @param element - The panel element to render
   * @returns Template result for the panel element
   */
  renderPanelElement(element: KnowledgePanelElement): TemplateResult {
    // For panel elements, we either render the referenced panel or its own content
    if (element.panel_element?.panel_id) {
      const panelId = element.panel_element.panel_id
      // We need to get the actual panel from the panels data
      const referencedPanel = this.knowledgePanels?.[panelId]
      if (referencedPanel) {
        return this.renderPanel(referencedPanel)
      } else {
        return html`<div class="warning">Referenced panel not found: ${panelId}</div>`
      }
    } else if (element.elements && Array.isArray(element.elements)) {
      return html`
        <div class="sub-panel">
          ${element.title ? this.renderHeading(element.title, "sub-panel-title") : ""}
          <div class="elements">
            ${element.elements.map((subElement: KnowledgePanelElement) =>
              this.renderElement(subElement)
            )}
          </div>
        </div>
      `
    }
    return html`<div class="warning">Panel without elements</div>`
  }

  /**
   * Renders a panel group element with a title, optional image, and referenced panels
   * @param element - The panel group element to render
   * @returns Template result for the panel group element
   */
  renderPanelGroup(element: KnowledgePanelElement): TemplateResult {
    const panelGroup = element.panel_group_element
    if (!panelGroup) {
      return html`<div class="warning">
        ${this.renderHeading("Missing Data", "warning-title", 1)}
        <p>Panel group without data</p>
      </div>`
    }

    return html`
      <div class="panel-group">
        ${panelGroup.title ? this.renderHeading(panelGroup.title, "panel-group-title", 1) : ""}
        ${this.renderPanelGroupImage(panelGroup)} ${this.renderPanelGroupPanels(panelGroup)}
      </div>
    `
  }

  /**
   * Renders the image for a panel group if it exists
   * @param panelGroup - The panel group containing the image
   * @returns Template result for the panel group image
   */
  renderPanelGroupImage(panelGroup: any): TemplateResult {
    if (!panelGroup.image) {
      return html``
    }

    return html`
      <div class="panel-image">
        <img
          src="${panelGroup.image.sizes?.["400"]?.url ||
          panelGroup.image.sizes?.["full"]?.url ||
          ""}"
          alt="${panelGroup.image.alt || ""}"
        />
      </div>
    `
  }

  /**
   * Renders the panels referenced by a panel group
   * @param panelGroup - The panel group containing panel references
   * @returns Template result for the referenced panels
   */
  renderPanelGroupPanels(panelGroup: any): TemplateResult[] {
    return (panelGroup.panel_ids || []).map((panelId: string) => {
      const panel = this.knowledgePanels?.[panelId]
      if (panel) {
        return this.renderPanel(panel)
      } else {
        return html`<div class="warning">Referenced panel not found: ${panelId}</div>`
      }
    })
  }

  /**
   * Renders an action element with a button (disabled in this version)
   * @param element - The action element to render
   * @returns Template result for the action element
   */
  renderAction(element: KnowledgePanelElement): TemplateResult {
    const actionElement = element.action_element
    if (!actionElement) {
      return html``
    }

    return html`
      <div class="action">
        <div>${unsafeHTML(actionElement.html || "")}</div>
        <button class="button chocolate-button" disabled>
          ${(actionElement as any).action_text ||
          (() => {
            console.warn("Missing action_text for action element:", actionElement)
            return "Default Action"
          })()}
        </button>
        <small>(Actions are displayed but not functional in this version)</small>
      </div>
    `
  }

  /**
   * Renders a complete knowledge panel with title and elements
   * @param panel - The knowledge panel to render
   * @returns Template result for the knowledge panel
   */
  renderPanel(panel: KnowledgePanel): TemplateResult {
    if (!panel) {
      console.error("Attempted to render null or undefined panel")
      return html`` // Return empty template instead of undefined
    }

    // Get title from title_element if available
    const title = panel.title_element?.title || panel.title || ""

    // Get elements
    const elements = panel.elements || []

    return html`
      <div class="panel ${panel.level || ""} ${panel.size || ""}">
        ${this.renderPanelHeader(title, panel.title_element?.subtitle)}
        <div class="panel-content">
          <div class="elements">
            ${elements.map((element: KnowledgePanelElement) => this.renderElement(element))}
          </div>
        </div>
      </div>
    `
  }

  /**
   * Renders the header section of a knowledge panel
   * @param title - The panel title
   * @param subtitle - Optional subtitle for the panel
   * @returns Template result for the panel header
   */
  renderPanelHeader(title: string, subtitle?: string): TemplateResult {
    if (!title) {
      return html``
    }

    return html`
      <div class="panel-header">
        ${this.renderHeading(title, "panel-title")}
        ${subtitle ? html`<div class="panel-subtitle">${subtitle}</div>` : ""}
      </div>
    `
  }

  /**
   * Main render method for the component
   * @returns Template result for the entire component
   */
  override render(): TemplateResult {
    return this._knowledgePanelsTask.render({
      initial: () => html``, // Provide a default value
      pending: () => html`
        ${this.renderHeading("Loading Knowledge Panels", "loading-title")}
        <off-wc-loader></off-wc-loader>
      `, // Use the loader component with a heading
      complete: (result) => this.renderPanelsResult(result),
      error: (error: unknown) => {
        console.error("Task error:", error)
        return html`
          <div class="error">
            ${this.renderHeading("Error Loading Knowledge Panels", "error-title")}
            <p>${error instanceof Error ? error.message : String(error)}</p>
          </div>
        `
      },
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
      return html`<div class="error">Invalid data format received</div>`
    }

    if (Object.keys(panels).length === 0) {
      // Use a heading for the empty state message
      const emptyHeading = `No Knowledge Panels Available`
      return html`
        <div class="info">
          ${this.renderHeading(emptyHeading, "empty-heading")}
          <p>No knowledge panels were found for this request.</p>
        </div>
      `
    }

    // Store panels in the instance for reference in renderElement
    this.knowledgePanels = panels

    // Create an array of top-level panels (ones that aren't only referenced by others)
    const topLevelPanelIds = ["health_card", "environment_card"]
    const topLevelPanels = topLevelPanelIds.filter((id) => panels[id]).map((id) => panels[id])

    // If no top-level panels found, show all panels
    const panelsToRender = topLevelPanels.length > 0 ? topLevelPanels : Object.values(panels)

    // Optional: Add a section title for the overall panels
    const sectionTitle = "Knowledge Panels"

    return html`
      <div>
        ${this.renderHeading(sectionTitle, "knowledge-panels-section-title")}
        ${panelsToRender.map((panel: KnowledgePanel) => (panel ? this.renderPanel(panel) : html``))}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "knowledge-panels": KnowledgePanelComponent
  }
}