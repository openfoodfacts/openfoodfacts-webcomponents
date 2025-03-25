import { html, TemplateResult } from "lit"
import {
  KnowledgePanelElement,
  TableColumn,
  TableRow,
  TableCell,
  TableElement,
} from "../../../types/knowledge-panel"
import { renderHeading } from "../utils/heading-utils"

/**
 * Renders a table element with columns and rows
 * @param element - The table element to render
 * @param headingLevel - The heading level to use
 * @returns Template result for the table element
 */
export function renderTable(element: KnowledgePanelElement, headingLevel: string): TemplateResult {
  const tableData = element.table_element || ({} as TableElement)

  if (!tableData) {
    console.error("Invalid table element - missing table_element:", element)
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
      ${tableData.title ? renderHeading(tableData.title, "table-title", headingLevel) : ""}
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
