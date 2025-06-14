import { LitElement, html, css } from "lit"
import { customElement, state } from "lit/decorators.js"
import { localized } from "@lit/localize"
import folksonomyApi from "../../api/folksonomy"

/**
 * Folksonomy Properties Viewer
 * @element folksonomy-properties
 * This component displays all contributed properties from the Folksonomy Engine project.
 */
@customElement("folksonomy-properties")
@localized()
export class FolksonomyProperties extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      color: #333;
    }

    .properties-container {
      margin-bottom: 1rem;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
    }

    .properties-container h2 {
      font-size: 2.2rem;
      font-weight: 600;
      color: #222;
      margin-top: 10px;
      margin-bottom: 0.5rem;
    }

    .properties-container p {
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
      color: #222;
    }

    .properties-container a {
      color: #341100;
    }

    .properties-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      border: solid 1px #ddd;
      font-size: 0.9rem;
    }

    .properties-table th,
    .properties-table td {
      padding: 0.8rem;
      text-align: left;
      border: solid 1px #ddd;
    }

    .properties-table th {
      background-color: #f8f9fa;
      font-weight: bold;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .properties-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .properties-table tr:hover {
      background-color: #e8f4fd;
    }

    .property-name {
      font-weight: 500;
      color: #341100;
    }

    .doc-link {
      font-size: 1.1rem;
    }

    .doc-link:hover {
      opacity: 0.7;
    }

    .count {
      text-align: right;
      font-weight: 500;
    }

    .values {
      text-align: right;
      font-weight: 500;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .error {
      color: #dc3545;
      text-align: center;
      padding: 1rem;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    /* Prepare table for filtering */
    .filter-row {
      background-color: #f8f9fa;
    }

    .filter-input {
      width: 100%;
      padding: 0.25rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.875rem;
      box-sizing: border-box;
    }

    .filter-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .filter-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1rem 0;
      padding: 0.5rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .rows-counter {
      font-size: 0.875rem;
      color: #666;
    }

    .reset-btn {
      background-color: #341100;
      color: white;
      border: 1px solid #341100;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      transition:
        background-color 0.3s,
        color 0.3s;
      margin-left: 1rem;
    }

    .download-btn {
      background-color: #341100;
      color: white;
      border: 1px solid #341100;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      transition:
        background-color 0.3s,
        color 0.3s;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
    }

    .status-bar {
      font-size: 0.875rem;
      color: #666;
      font-style: italic;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .properties-table {
        font-size: 0.8rem;
      }

      .properties-table th,
      .properties-table td {
        padding: 0.5rem;
      }

      .properties-container h2 {
        font-size: 1.8rem;
      }

      .properties-container p {
        font-size: 0.8rem;
      }
    }
  `

  @state()
  private properties: Array<{ k: string; count: number; values: number }> = []

  @state()
  private filteredProperties: Array<{ k: string; count: number; values: number }> = []

  @state()
  private loading = false

  @state()
  private error: string | null = null

  @state()
  private filters = {
    property: "",
    count: "",
    values: "",
  }

  private filterTimeout: number | null = null

  override async connectedCallback() {
    super.connectedCallback()
    await this.fetchProperties()
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    // Clean up filter timeout
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout)
      this.filterTimeout = null
    }
  }

  private async fetchProperties() {
    this.loading = true
    this.error = null

    try {
      const data = await folksonomyApi.fetchKeys()
      console.log("Folksonomy properties data:", data)

      // Sort by count (descending order)
      this.properties = data.sort((a, b) => a.k.localeCompare(b.k))
      this.filteredProperties = [...this.properties]
    } catch (error) {
      console.error("Error fetching folksonomy properties:", error)
      this.error = "Failed to load properties. Please try again later."
    } finally {
      this.loading = false
    }
  }

  private getPropertyUrl(propertyName: string) {
    return `https://world.openfoodfacts.org/property/${propertyName}`
  }

  private getDocumentationUrl(propertyName: string) {
    return `https://wiki.openfoodfacts.org/Folksonomy/Property/${propertyName}`
  }

  private applyFilters() {
    const { property, count, values } = this.filters

    this.filteredProperties = this.properties.filter((item) => {
      const matchesProperty = !property || item.k.toLowerCase().includes(property.toLowerCase())
      const matchesCount = !count || item.count.toString() === count
      const matchesValues = !values || item.values.toString() === values

      return matchesProperty && matchesCount && matchesValues
    })
  }

  private handleFilterInput(field: "property" | "count" | "values", value: string) {
    this.filters = {
      ...this.filters,
      [field]: value,
    }

    // Debounce filtering with 1100ms delay (as specified in original config)
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout)
    }

    this.filterTimeout = window.setTimeout(() => {
      this.applyFilters()
    }, 1100)
  }

  private resetFilters() {
    this.filters = {
      property: "",
      count: "",
      values: "",
    }
    this.filteredProperties = [...this.properties]
  }

  private downloadCSV() {
    const headers = ["Property", "Count", "Values"]
    const rows = this.filteredProperties.map((item) => [item.k, item.count, item.values])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "folksonomy_properties.csv")
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  private renderTableHeader() {
    return html`
      <thead>
        <tr>
          <th></th>
          <th class="property-name-header">Property</th>
          <th class="doc">Documentation</th>
          <th class="count">Count</th>
          <th class="values">Values</th>
        </tr>
        <tr class="filter-row">
          <td></td>
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="Filter properties..."
              .value="${this.filters.property}"
              @input="${(e: Event) =>
                this.handleFilterInput("property", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td></td>
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="Filter count..."
              .value="${this.filters.count}"
              @input="${(e: Event) =>
                this.handleFilterInput("count", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="Filter values..."
              .value="${this.filters.values}"
              @input="${(e: Event) =>
                this.handleFilterInput("values", (e.target as HTMLInputElement).value)}"
            />
          </td>
        </tr>
      </thead>
    `
  }

  private renderPropertyRow(property: { k: string; count: number; values: number }) {
    return html`
      <tr class="property">
        <td></td>
        <td>
          <a href="${this.getPropertyUrl(property.k)}" class="property-name"> ${property.k} </a>
        </td>
        <td>
          <a
            href="${this.getDocumentationUrl(property.k)}"
            class="doc-link"
            title="Documentation for ${property.k}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🛈
          </a>
        </td>
        <td class="count">${property.count}</td>
        <td class="values">${property.values}</td>
      </tr>
    `
  }

  private renderContent() {
    if (this.loading) {
      return html`<div class="loading">Loading properties...</div>`
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`
    }

    if (this.properties.length === 0) {
      return html` <div class="empty-state">No properties found.</div> `
    }

    return html`
      <div class="filter-controls">
        <div class="rows-counter">
          Rows: ${this.filteredProperties.length} / ${this.properties.length}
        </div>
        <div class="button-group">
          <button class="download-btn" @click="${this.downloadCSV}">Download CSV</button>
          <button class="reset-btn" @click="${this.resetFilters}">Reset</button>
        </div>
      </div>
      <table class="properties-table" id="folksonomy-properties-table">
        ${this.renderTableHeader()}
        <tbody id="free_prop_body">
          ${this.filteredProperties.map((property) => this.renderPropertyRow(property))}
        </tbody>
      </table>
    `
  }

  override render() {
    return html`
      <div class="properties-container">
        <h2 id="property_title">Properties</h2>
        <p>
          Open Food Facts allows anyone to reuse contributed properties or create new ones (see the
          <a
            href="https://wiki.openfoodfacts.org/Folksonomy_Engine"
            target="_blank"
            rel="noopener noreferrer"
            >Folksonomy Engine project</a
          >). Here's the list of all contributed properties.
        </p>
        ${this.renderContent()}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-properties": FolksonomyProperties
  }
}
