import { LitElement, html, css, type TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import type {
  KnowledgePanelElement,
  TableColumn,
  TableRow,
  TableCell,
  TableElement,
} from "../../../types/knowledge-panel"
import "../../../utils/knowledge-panels/heading-utils" // Import heading renderer component
import { sanitizeHtml } from "../../../utils/html"

/**
 * Table element renderer component
 *
 * @element table-element-renderer
 */
@customElement("table-element-renderer")
export class TableElementRenderer extends LitElement {
  static override styles = css`
    .table_element {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 1.25rem;
      border-radius: 20px;
      /*box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);*/
    }

    .table_element table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 0.5rem;
      text-align: left;
      border: 1px solid #e6e6e6;
      border-radius: 20px;
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
  `

  @property({ type: Object })
  element?: KnowledgePanelElement

  @property({ type: String })
  headingLevel = "h3"

  override render(): TemplateResult {
    if (!this.element) {
      return html`<slot name="error">Missing element data</slot>`
    }

    const tableData = this.element.table_element || ({} as TableElement)

    if (!tableData) {
      console.error("Invalid table element - missing table_element:", this.element)
      return html`<slot name="error">Invalid table format</slot>`
    }

    const columns = tableData.columns || []
    const rows = tableData.rows || []

    if (!Array.isArray(columns) || !Array.isArray(rows)) {
      console.error("Invalid table structure:", tableData)
      return html`<slot name="error">Invalid table structure</slot>`
    }

    return html`
      <div class="table_element">
        ${tableData.title
          ? html`<heading-renderer
              text="${tableData.title}"
              class-name="table-title"
              heading-level="${this.headingLevel}"
            >
            </heading-renderer>`
          : ""}
        <table>
          <thead>
            <tr>
              ${columns.map(
                (column: TableColumn) =>
                  html`<th>${sanitizeHtml(column.text || column.id || "")}</th>`
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
}

declare global {
  interface HTMLElementTagNameMap {
    "table-element-renderer": TableElementRenderer
  }
}
