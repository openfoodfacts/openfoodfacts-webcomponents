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

    /* Range slider container */
    .range-filter-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    }

    .range-inputs {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .range-input {
      width: 60px;
      padding: 0.25rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.75rem;
      text-align: center;
    }

    .range-input:focus {
      outline: none;
      border-color: #341100;
    }

    .range-separator {
      font-size: 0.75rem;
      color: #666;
    }

    /* Custom range slider styles */
    .range-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
      opacity: 0.7;
      transition: opacity 0.2s;
      -webkit-appearance: none;
      appearance: none;
      position: relative;
    }

    .range-slider:hover {
      opacity: 1;
    }

    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
    }

    .range-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      border: none;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
    }

    .range-slider-container {
      position: relative;
      margin: 0.25rem 0;
    }

    .range-slider-track {
      position: absolute;
      height: 6px;
      background: #341100;
      border-radius: 3px;
      top: 0;
    }

    .dual-range-container {
      position: relative;
      width: 100%;
    }

    .dual-range-slider {
      position: relative;
      height: 6px;
      background: #ddd;
      border-radius: 3px;
      margin: 0.5rem 0;
      width: 200px;
      min-width: 180px;
    }

    .dual-range-slider input[type="range"] {
      position: absolute;
      width: 100%;
      height: 6px;
      background: transparent;
      -webkit-appearance: none;
      appearance: none;
      pointer-events: none;
      outline: none;
    }

    .dual-range-slider input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      margin-top: -5px;
      margin-left: -2px;
      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      pointer-events: all;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
      border: none;
    }

    .dual-range-slider input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      margin-top: -5px;

      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      pointer-events: all;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
      border: none;
    }

    .dual-range-slider input[type="range"]:first-child::-moz-range-thumb {
      margin-left: -8px;
    }

    .dual-range-slider input[type="range"]:last-child::-moz-range-thumb {
      margin-right: -8px;
    }

    .dual-range-track {
      position: absolute;
      height: 6px;
      background: #341100;
      border-radius: 3px;
      top: 0;
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

      .range-filter-container {
        min-width: 180px;
      }

      .range-input {
        width: 50px;
        font-size: 0.7rem;
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
    countMin: 0,
    countMax: 0,
    valuesMin: 0,
    valuesMax: 0,
  }

  @state()
  private ranges = {
    countMin: 0,
    countMax: 0,
    valuesMin: 0,
    valuesMax: 0,
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

      // Calculate min/max ranges for sliders
      if (this.properties.length > 0) {
        const counts = this.properties.map((p) => p.count)
        const values = this.properties.map((p) => p.values)

        const countMin = Math.min(...counts)
        const countMax = Math.max(...counts)
        const valuesMin = Math.min(...values)
        const valuesMax = Math.max(...values)

        // Ensure minimum range of 1 to prevent overlapping handles
        this.ranges = {
          countMin: countMin,
          countMax: Math.max(countMax, countMin + 1),
          valuesMin: valuesMin,
          valuesMax: Math.max(valuesMax, valuesMin + 1),
        }

        // Initialize filters with full range
        this.filters = {
          property: "",
          countMin: this.ranges.countMin,
          countMax: this.ranges.countMax,
          valuesMin: this.ranges.valuesMin,
          valuesMax: this.ranges.valuesMax,
        }
      }
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
    const { property, countMin, countMax, valuesMin, valuesMax } = this.filters

    this.filteredProperties = this.properties.filter((item) => {
      const matchesProperty = !property || item.k.toLowerCase().includes(property.toLowerCase())
      const matchesCount = item.count >= countMin && item.count <= countMax
      const matchesValues = item.values >= valuesMin && item.values <= valuesMax

      return matchesProperty && matchesCount && matchesValues
    })
  }

  private handleFilterInput(field: "property", value: string) {
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

  private handleRangeInput(field: keyof typeof this.filters, value: string) {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return

    this.filters = {
      ...this.filters,
      [field]: numValue,
    }

    // Immediate filtering for range inputs
    this.applyFilters()
  }

  private resetFilters() {
    this.filters = {
      property: "",
      countMin: this.ranges.countMin,
      countMax: this.ranges.countMax,
      valuesMin: this.ranges.valuesMin,
      valuesMax: this.ranges.valuesMax,
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

  private renderDualRangeSlider(
    type: "count" | "values",
    min: number,
    max: number,
    currentMin: number,
    currentMax: number
  ) {
    // If range is too small, show simple inputs instead
    if (max - min < 2) {
      return html`
        <div class="range-filter-container">
          <div class="range-inputs">
            <input
              type="number"
              class="range-input"
              .value="${currentMin}"
              min="${min}"
              max="${max}"
              @input="${(e: Event) =>
                this.handleRangeInput(
                  type === "count" ? "countMin" : "valuesMin",
                  (e.target as HTMLInputElement).value
                )}"
            />
            <span class="range-separator">-</span>
            <input
              type="number"
              class="range-input"
              .value="${currentMax}"
              min="${min}"
              max="${max}"
              @input="${(e: Event) =>
                this.handleRangeInput(
                  type === "count" ? "countMax" : "valuesMax",
                  (e.target as HTMLInputElement).value
                )}"
            />
          </div>
        </div>
      `
    }

    const percent1 = ((currentMin - min) / (max - min)) * 100
    const percent2 = ((currentMax - min) / (max - min)) * 100

    return html`
      <div class="range-filter-container">
        <div class="range-inputs">
          <input
            type="number"
            class="range-input"
            .value="${currentMin}"
            min="${min}"
            max="${max}"
            @input="${(e: Event) =>
              this.handleRangeInput(
                type === "count" ? "countMin" : "valuesMin",
                (e.target as HTMLInputElement).value
              )}"
          />
          <span class="range-separator">-</span>
          <input
            type="number"
            class="range-input"
            .value="${currentMax}"
            min="${min}"
            max="${max}"
            @input="${(e: Event) =>
              this.handleRangeInput(
                type === "count" ? "countMax" : "valuesMax",
                (e.target as HTMLInputElement).value
              )}"
          />
        </div>
        <div class="dual-range-container">
          <div class="dual-range-slider">
            <div
              class="dual-range-track"
              style="left: ${percent1}%; width: ${percent2 - percent1}%"
            ></div>
            <input
              type="range"
              min="${min}"
              max="${max}"
              .value="${currentMin}"
              @input="${(e: Event) =>
                this.handleRangeInput(
                  type === "count" ? "countMin" : "valuesMin",
                  (e.target as HTMLInputElement).value
                )}"
            />
            <input
              type="range"
              min="${min}"
              max="${max}"
              .value="${currentMax}"
              @input="${(e: Event) =>
                this.handleRangeInput(
                  type === "count" ? "countMax" : "valuesMax",
                  (e.target as HTMLInputElement).value
                )}"
            />
          </div>
        </div>
      </div>
    `
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
            ${this.renderDualRangeSlider(
              "count",
              this.ranges.countMin,
              this.ranges.countMax,
              this.filters.countMin,
              this.filters.countMax
            )}
          </td>
          <td>
            ${this.renderDualRangeSlider(
              "values",
              this.ranges.valuesMin,
              this.ranges.valuesMax,
              this.filters.valuesMin,
              this.filters.valuesMax
            )}
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
