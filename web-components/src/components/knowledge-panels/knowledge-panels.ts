import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { fetchKnowledgePanels } from "../../api/knowledgepanel"
import { Task } from "@lit/task"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import { ALERT } from "../../styles/alert"
import "../../components/shared/loader" // Import the loader component
import { ButtonType, getButtonClasses } from "../../styles/buttons" // Import button styles
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
/* Updated Knowledge Panel Component CSS */
export class KnowledgePanelComponent extends LitElement {
  static override styles = [
    BASE,
    ALERT,
    ...getButtonClasses([ButtonType.Chocolate, ButtonType.Cappucino]), // Add button styles
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

      /* Panel Base Styles - Improved curves and shadows */
      .panel {
        width: 100%;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
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

      /* Panel Contextual Variations - More pronounced curves */
      .panel.info {
        border-left: 4px solid #79e1a6;
        border-radius: 0 8px 8px 0;
      }

      .panel.warning {
        border-left: 4px solid #f0ad4e;
        border-radius: 0 8px 8px 0;
      }

      .panel.success {
        border-left: 4px solid #5cb85c;
        border-radius: 0 8px 8px 0;
      }

      .panel.danger {
        border-left: 4px solid #d9534f;
        border-radius: 0 8px 8px 0;
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
        color: #222;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
        text-align: left;
        word-wrap: break-word; /* Handle long titles */
      }

      .panel-subtitle {
        width: 100%;
        color: #555;
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
        border-radius: 8px;
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
        color: #333;
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

      /* Table Styling - Improved borders and radius */
      .table_element {
        width: 100%;
        overflow-x: auto; /* Allow horizontal scrolling for tables on small screens */
        margin-bottom: 1.25rem;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .table_element table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin-bottom: 0.5rem;
        text-align: left;
        border: 1px solid #e6e6e6;
        border-radius: 6px;
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
        color: #333;
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
        color: #333;
        font-weight: 600;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
        text-align: left;
        word-wrap: break-word;
      }

      /* Panel Images and Text - Improved image handling */
      .panel-image {
        width: 100%;
        margin-bottom: 1.25rem;
        text-align: left;
      }

      .panel-image img {
        width: auto; /* Allow image to maintain its aspect ratio */
        max-width: 100%; /* Ensure image doesn't overflow its container */
        height: auto;
        border-radius: 8px;
        border: 1px solid #efefef;
        display: block;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .panel-image-text {
        width: 100%;
        margin-top: 0.65rem;
        font-size: 0.9rem;
        color: #666;
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

      /* Sub Panels - Improved curves and borders */
      .sub-panel {
        width: 100%; /* Takes full width of its parent container */
        margin-bottom: 1.25rem;
        padding: 1rem;
        border-left: 3px solid #e8e8e8;
        background-color: #fafafa;
        border-radius: 0 8px 8px 0;
        text-align: left;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
      }

      .sub-panel-title {
        width: 100%;
        margin-top: 0;
        margin-bottom: 0.65rem;
        font-size: 1.05rem;
        color: #444;
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

      /* Action Components - Enhanced for better visibility */
      .action {
        width: 100%;
        margin: 1rem 0;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e8e8e8;
        text-align: left;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      }

      .action small {
        width: 100%;
        display: block;
        color: #888;
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
        color: #222;
        font-size: 1.3rem;
      }

      /* Button styling improvements */
      .button {
        border-radius: 6px;
        font-weight: 500;
        padding: 0.65rem 1.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .button:hover {
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
      }

      /* Make buttons full width on mobile */
      @media (max-width: 768px) {
        .button {
          width: 100%;
          display: block;
        }
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
   * Extracts images from all panels
   * @param panels - The knowledge panels data
   */
  private extractImages(panels: KnowledgePanelsData): void {
    this.nutritionImages = []

    // First look for the nutrition panel
    let nutritionPanel: KnowledgePanel | null = null
    for (const panelId in panels) {
      const panel = panels[panelId]
      if (
        panel.title === "Nutrition" ||
        panel.title === "Nutrition facts" ||
        panel.title_element?.title === "Nutrition" ||
        panel.title_element?.title === "Nutrition facts"
      ) {
        nutritionPanel = panel
        break
      }
    }

    // If we found a nutrition panel, extract all images from it and all sub-panels
    if (nutritionPanel && nutritionPanel.elements) {
      // Process all elements in the nutrition panel
      for (const element of nutritionPanel.elements) {
        // Process text elements that might contain HTML with images
        if (element.element_type === "text" && element.text_element?.html) {
          const htmlContent = element.text_element.html
          const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
          let match
          while ((match = imgRegex.exec(htmlContent)) !== null) {
            if (match[1]) {
              this.nutritionImages.push(match[1])
            }
          }
        }

        // Process panel group elements with images
        if (element.element_type === "panel_group" && element.panel_group_element?.image) {
          const image = element.panel_group_element.image
          const imageUrl = image.sizes?.["400"]?.url || image.sizes?.["full"]?.url
          if (imageUrl) {
            this.nutritionImages.push(imageUrl)
          }
        }

        // Check nested elements
        if (element.elements) {
          this.extractNestedImages(element.elements)
        }

        // Check referenced panels
        if (element.element_type === "panel" && element.panel_element?.panel_id) {
          const referencedPanel = panels[element.panel_element.panel_id]
          if (referencedPanel && referencedPanel.elements) {
            this.extractNestedImages(referencedPanel.elements)
          }
        }
      }
    }

    // Look through all panels if we didn't find any nutrition images
    if (this.nutritionImages.length === 0) {
      for (const panelId in panels) {
        const panel = panels[panelId]
        if (panel.elements) {
          this.extractNestedImages(panel.elements)
        }
      }
    }

    console.log("Extracted nutrition images:", this.nutritionImages)
  }

  /**
   * Helper to extract images from nested elements
   * @param elements - Array of panel elements to process
   */
  private extractNestedImages(elements: KnowledgePanelElement[]): void {
    for (const element of elements) {
      // Process text elements that might contain HTML with images
      if (element.element_type === "text" && element.text_element?.html) {
        const htmlContent = element.text_element.html
        const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
        let match
        while ((match = imgRegex.exec(htmlContent)) !== null) {
          if (match[1]) {
            this.nutritionImages.push(match[1])
          }
        }
      }

      // Process panel group elements with images
      if (element.element_type === "panel_group" && element.panel_group_element?.image) {
        const image = element.panel_group_element.image
        const imageUrl = image.sizes?.["400"]?.url || image.sizes?.["full"]?.url
        if (imageUrl) {
          this.nutritionImages.push(imageUrl)
        }
      }

      // Recursively process nested elements
      if (element.elements) {
        this.extractNestedImages(element.elements)
      }
    }
  }

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
   * Renders the image and associated text for a panel group if it exists
   * @param panelGroup - The panel group containing the image
   * @returns Template result for the panel group image with text
   */
  renderPanelGroupImage(panelGroup: any): TemplateResult {
    if (!panelGroup.image) {
      return html``
    }

    const imageUrl =
      panelGroup.image.sizes?.["400"]?.url || panelGroup.image.sizes?.["full"]?.url || ""

    const imageAlt = panelGroup.image.alt || "Panel image"
    const imageCaption = panelGroup.image.caption || panelGroup.image.description || ""

    return html`
      <div class="panel-image">
        <img src="${imageUrl}" alt="${imageAlt}" />
        ${imageCaption ? html`<div class="panel-image-text">${imageCaption}</div>` : html``}
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
   * Renders an action element with a button and improved styling
   * @param element - The action element to render
   * @returns Template result for the action element
   */
  renderAction(element: KnowledgePanelElement): TemplateResult {
    const actionElement = element.action_element
    if (!actionElement) {
      return html``
    }

    const actionText = (actionElement as any).action_text || "Default Action"
    const actionDescription = (actionElement as any).description || ""

    return html`
      <div class="action">
        <div>${unsafeHTML(actionElement.html || "")}</div>
        <button class="button chocolate-button" disabled>${actionText}</button>
        ${actionDescription ? html`<small>${actionDescription}</small>` : ""}
        <small>(Actions are displayed but not functional in this version)</small>
      </div>
    `
  }

  /**
   * Checks if a panel is a nutrition panel
   * @param panel - The panel to check
   * @returns True if it's a nutrition panel
   */
  private isNutritionPanel(panel: KnowledgePanel): boolean {
    const title = panel.title_element?.title || panel.title || ""
    return title.toLowerCase().includes("nutrition") || title.toLowerCase().includes("nutritional")
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
    console.log("Rendering panel:", title, panel)
    // Get elements
    const elements = panel.elements || []

    // Check if this is a nutrition panel that should have the special layout
    const isNutrition = this.isNutritionPanel(panel)
    const panelClass = isNutrition
      ? `panel nutrition-panel ${panel.level || ""} ${panel.size || ""}`.trim()
      : `panel ${panel.level || ""} ${panel.size || ""}`.trim()

    if (isNutrition && this.nutritionImages.length > 0) {
      return html`
        <div class="${panelClass}">
          ${this.renderPanelHeader(title, panel.title_element?.subtitle)}
          <div class="panel-content">
            <div class="panel-left">
              <div class="elements">
                ${elements.map((element: KnowledgePanelElement) => this.renderElement(element))}
              </div>
            </div>
            <div class="panel-right">
              <img src="${this.nutritionImages[0]}" alt="Nutrition Information" />
              ${panel.title_element?.subtitle
                ? html`<div class="panel-image-text">${panel.title_element.subtitle}</div>`
                : ""}
            </div>
          </div>
        </div>
      `
    }

    // Standard panel layout for non-nutrition panels or nutrition panels without images
    return html`
      <div class="${panelClass}">
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
   * Handle errors in a more user-friendly way
   * @param error - The error to display
   * @returns Template result for the error display
   */
  renderError(error: unknown): TemplateResult {
    console.error("Task error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return html`
      <div class="error">
        ${this.renderHeading("Error Loading Knowledge Panels", "error-title")}
        <p>${errorMessage}</p>
        <button class="button cappucino-button" @click=${this._retryLoad}>Retry</button>
      </div>
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
      return html`<div class="error">Invalid data format received</div>`
    }

    if (Object.keys(panels).length === 0) {
      // Use a heading for the empty state message
      const emptyHeading = "No Knowledge Panels Available"
      return html`
        <div class="info">
          ${this.renderHeading(emptyHeading, "empty-heading")}
          <p>No knowledge panels were found for this request.</p>
        </div>
      `
    }

    // Store panels in the instance for reference in renderElement
    this.knowledgePanels = panels

    // Extract all nutrition-related images
    this.extractImages(panels)

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
        ${this.renderHeading(sectionTitle, "knowledge-panels-section-title")}
        ${panelsToRender.map((panel: KnowledgePanel) => (panel ? this.renderPanel(panel) : html``))}
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
