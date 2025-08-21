import { LitElement, html, css } from "lit"
import { customElement, state } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import folksonomyApi from "../../api/folksonomy"
import { createDebounce, downloadCSV } from "../../utils"
import "../shared/dual-range-slider"
import type { UserInfoResponse } from "../../types/folksonomy"

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

    .actions {
      white-space: nowrap;
      text-align: right;
    }

    .icon-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0.35rem;
      font-size: 1.05rem;
    }

    .icon-btn:hover {
      opacity: 0.75;
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
  private currentUser: UserInfoResponse | null = null

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

  private filterDebounce = createDebounce(1100)

  override async connectedCallback() {
    super.connectedCallback()
    await Promise.all([this.fetchCurrentUser(), this.fetchProperties()])
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    // Clean up filter debounce
    this.filterDebounce.clear()
  }

  private async fetchProperties() {
    this.loading = true
    this.error = null

    try {
      const data = await folksonomyApi.fetchKeys()

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
      this.error = "error"
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

  private get isAdminOrModerator() {
    return !!(this.currentUser && (this.currentUser.admin || this.currentUser.moderator))
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
    this.filterDebounce.debounce(() => {
      this.applyFilters()
    })
  }

  private handleRangeChange(event: CustomEvent) {
    const { type, field, value } = event.detail

    let filterField: keyof typeof this.filters
    if (type === "count") {
      filterField = field === "min" ? "countMin" : "countMax"
    } else {
      filterField = field === "min" ? "valuesMin" : "valuesMax"
    }

    this.filters = {
      ...this.filters,
      [filterField]: value,
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

  private handleDownloadCSV() {
    const headers = [msg("Property"), msg("Count"), msg("Values")]
    const rows = this.filteredProperties.map((item) => [item.k, item.count, item.values])
    const today = new Date().toISOString().split("T")[0]
    const filename = `folksonomy_properties_${today}.csv`

    downloadCSV(rows, filename, headers)
  }

  private async fetchCurrentUser() {
    try {
      this.currentUser = await folksonomyApi.getCurrentUser()
    } catch (e) {
      this.currentUser = null
    }
  }

  private renderTableHeader() {
    return html`
      <thead>
        <tr>
          <th></th>
          <th class="property-name-header">${msg("Property")}</th>
          <th class="doc">${msg("Documentation")}</th>
          <th class="count">${msg("Count")}</th>
          <th class="values">${msg("Values")}</th>
          ${this.isAdminOrModerator ? html`<th class="actions">${msg("Actions")}</th>` : null}
        </tr>
        <tr class="filter-row">
          <td></td>
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="${msg("Filter properties...")}"
              .value="${this.filters.property}"
              @input="${(e: Event) =>
                this.handleFilterInput("property", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td></td>
          <td>
            <dual-range-slider
              type="count"
              min="${this.ranges.countMin}"
              max="${this.ranges.countMax}"
              minValue="${this.filters.countMin}"
              maxValue="${this.filters.countMax}"
              @range-change="${this.handleRangeChange}"
            ></dual-range-slider>
          </td>
          <td>
            <dual-range-slider
              type="values"
              min="${this.ranges.valuesMin}"
              max="${this.ranges.valuesMax}"
              minValue="${this.filters.valuesMin}"
              maxValue="${this.filters.valuesMax}"
              @range-change="${this.handleRangeChange}"
            ></dual-range-slider>
          </td>
          ${this.isAdminOrModerator ? html`<td></td>` : null}
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
            title="${msg(str`Documentation for ${property.k}`)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🛈
          </a>
        </td>
        <td class="count">${property.count}</td>
        <td class="values">${property.values}</td>
        ${this.isAdminOrModerator
          ? html`<td class="actions">
              <button
                class="icon-btn"
                title="${msg("Rename value")}"
                @click="${() => this.onRenameValue(property.k)}"
              >
                ✏️
              </button>
              <button
                class="icon-btn"
                title="${msg("Delete value")}"
                @click="${() => this.onDeleteValue(property.k)}"
              >
                🗑️
              </button>
            </td>`
          : null}
      </tr>
    `
  }

  private renderContent() {
    if (this.loading) {
      return html`<div class="loading">${msg("Loading properties...")}</div>`
    }

    if (this.error) {
      return html`<div class="error">
        ${msg("Failed to load properties. Please try again later.")}
      </div>`
    }

    if (this.properties.length === 0) {
      return html` <div class="empty-state">${msg("No properties found.")}</div> `
    }

    return html`
      <div class="filter-controls">
        <div class="rows-counter">
          ${msg("Rows")}: ${this.filteredProperties.length} / ${this.properties.length}
        </div>
        <div class="button-group">
          <button class="download-btn" @click="${this.handleDownloadCSV}">
            ${msg("Download CSV")}
          </button>
          <button class="reset-btn" @click="${this.resetFilters}">${msg("Reset")}</button>
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
        <slot name="properties-introduction">
          <h2 id="property_title">${msg("Folksonomy Properties")}</h2>
          <p>
            ${msg(
              "Explore all contributed properties from the Folksonomy Engine project. These properties provide additional metadata and insights about products in the Open Food Facts database."
            )}
          </p>
        </slot>
        ${this.renderContent()}
      </div>
    `
  }

  private async onRenameValue(propertyKey: string) {
    const oldValue = window.prompt(msg(str`Enter the current value for ${propertyKey}`))
    if (!oldValue) return
    const newValue = window.prompt(msg(str`Enter the new value for ${propertyKey}`))
    if (!newValue) return
    try {
      await folksonomyApi.renameValue(propertyKey, oldValue, newValue)
      // Refresh data to reflect any counts/values changes
      await this.fetchProperties()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      this.error = "error"
    }
  }

  private async onDeleteValue(propertyKey: string) {
    const value = window.prompt(msg(str`Enter the value to delete for ${propertyKey}`))
    if (!value) return
    const confirmed = window.confirm(
      msg(str`Are you sure you want to delete '${value}' for ${propertyKey}?`)
    )
    if (!confirmed) return
    try {
      await folksonomyApi.deleteValue(propertyKey, value)
      await this.fetchProperties()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      this.error = "error"
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-properties": FolksonomyProperties
  }
}
