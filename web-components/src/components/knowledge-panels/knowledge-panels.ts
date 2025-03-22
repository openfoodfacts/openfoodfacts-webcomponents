import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { fetchKnowledgePanels } from "../../api/knowledgepanel"
import { Task } from "@lit/task"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import { ALERT } from "../../styles/alert"
import { ButtonType, getButtonClasses } from "../../styles/buttons" // Import button styles
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
 */
@customElement("knowledge-panels")
export class KnowledgePanelComponent extends LitElement {
  static override styles = [
    ALERT,
    ...getButtonClasses([ButtonType.Chocolate, ButtonType.Cappucino]), // Add button styles
    css`
      :host {
        display: block;
        font-family: var(--font-family, "Public Sans", Helvetica, Roboto, Arial, sans-serif);
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

      /* Status Indicators */
      .loading {
        padding: 1rem;
        text-align: center;
        color: #777;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
      }

      .loading::before {
        content: "";
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid #ddd;
        border-radius: 50%;
        border-top-color: #5bc0de;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
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

      .panel-group h4 {
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

      .sub-panel h4 {
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

      /* Remove button styling - now using imported styles */
      
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

      /* Accessibility Improvements */
      :focus-visible {
        outline: 2px solid #5bc0de;
        outline-offset: 2px;
      }
    `,
  ]

  @property({ type: String })
  url = ""

  @property({ type: String })
  path = ""

  @state()
  private knowledgePanels: KnowledgePanelsData | null = null

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

  renderElement(element: KnowledgePanelElement): TemplateResult {
    if (!element || !element.element_type) {
      console.error("Invalid element:", element)
      return html``
    }

    console.log("Rendering element type:", element.element_type, element)

    switch (element.element_type) {
      case "text":
        const textContent =
          element.text_element?.html || element.text_element?.text || element.text || ""
        return html`<div class="text_element">${unsafeHTML(textContent)}</div>`

      case "table": {
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
            ${tableData.title ? html`<h4>${tableData.title}</h4>` : ""}
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

      case "titled_text":
        return html`
          <div class="element">
            <div class="element-title">${element.title || ""}</div>
            <div class="element-value">${element.text || ""}</div>
          </div>
        `

      case "panel":
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
              ${element.title ? html`<h4>${element.title}</h4>` : ""}
              <div class="elements">
                ${element.elements.map((subElement: KnowledgePanelElement) =>
                  this.renderElement(subElement)
                )}
              </div>
            </div>
          `
        }
        return html`<div class="warning">Panel without elements</div>`

      case "panel_group": {
        const panelGroup = element.panel_group_element
        if (!panelGroup) {
          return html`<div class="warning">Panel group without data</div>`
        }

        return html`
          <div class="panel-group">
            ${panelGroup.title ? html`<h4>${panelGroup.title}</h4>` : ""}
            ${panelGroup.image
              ? html`
                  <div class="panel-image">
                    <img
                      src="${panelGroup.image.sizes?.["400"]?.url ||
                      panelGroup.image.sizes?.["full"]?.url ||
                      ""}"
                      alt="${panelGroup.image.alt || ""}"
                    />
                  </div>
                `
              : ""}
            ${(panelGroup.panel_ids || []).map((panelId: string) => {
              const panel = this.knowledgePanels?.[panelId]
              if (panel) {
                return this.renderPanel(panel)
              } else {
                return html`<div class="warning">Referenced panel not found: ${panelId}</div>`
              }
            })}
          </div>
        `
      }

      case "action": {
        const actionElement = element.action_element
        if (!actionElement) {
          return html``
        }

        return html`
          <div class="action">
            <div>${unsafeHTML(actionElement.html || "")}</div>
            <button class="button chocolate-button" disabled>
              ${(actionElement as any).action_text || (() => {
                console.warn("Missing action_text for action element:", actionElement)
                return "Default Action"
              })()}
            </button>
            <small>(Actions are displayed but not functional in this version)</small>
          </div>
        `
      }

      default:
        console.log(`Unsupported element type: ${element.element_type}`, element)
        return html``
    }
  }

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
        ${title
          ? html`
              <div class="panel-header">
                <h3 class="panel-title">${title}</h3>
                ${panel.title_element?.subtitle
                  ? html`<div class="panel-subtitle">${panel.title_element.subtitle}</div>`
                  : ""}
              </div>
            `
          : ""}

        <div class="panel-content">
          <div class="elements">
            ${elements.map((element: KnowledgePanelElement) => this.renderElement(element))}
          </div>
        </div>
      </div>
    `
  }

  override render(): TemplateResult {
    return this._knowledgePanelsTask.render({
      initial: () => html``, // Provide a default value
      pending: () => html`<div class="loading">Loading knowledge panels...</div>`,
      complete: (result) => {
        const panels = result as KnowledgePanelsData
        console.log("Panels received:", panels)

        if (!panels || typeof panels !== "object") {
          console.error("Invalid panels data:", panels)
          return html`<div class="error">Invalid data format received</div>`
        }

        if (Object.keys(panels).length === 0) {
          return html`<div class="info">No knowledge panels found.</div>`
        }

        // Store panels in the instance for reference in renderElement
        this.knowledgePanels = panels

        // Create an array of top-level panels (ones that aren't only referenced by others)
        const topLevelPanelIds = ["health_card", "environment_card"]
        const topLevelPanels = topLevelPanelIds.filter((id) => panels[id]).map((id) => panels[id])

        // If no top-level panels found, show all panels
        const panelsToRender = topLevelPanels.length > 0 ? topLevelPanels : Object.values(panels)

        return html`
          <div>
            ${panelsToRender.map((panel: KnowledgePanel) =>
              panel ? this.renderPanel(panel) : html``
            )}
          </div>
        `
      },
      error: (error: unknown) => {
        console.error("Task error:", error)
        return html`<div class="error">
          ${error instanceof Error ? error.message : String(error)}
        </div>`
      },
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "knowledge-panels": KnowledgePanelComponent
  }
}