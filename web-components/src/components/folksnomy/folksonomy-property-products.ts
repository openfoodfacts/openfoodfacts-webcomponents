import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { localized } from "@lit/localize"
import folksonomyApi from "../../api/folksonomy"

/**
 * Folksonomy Property Products Viewer
 * @element folksonomy-property-products
 * This component displays products that use a specific folksonomy property.
 */
@customElement("folksonomy-property-products")
@localized()
export class FolksonomyPropertyProducts extends LitElement {
  static override styles = css`
    :host {
      font-family: Arial, sans-serif;
      color: #333;
    }

    .property-container {
      margin: 0 auto 1rem auto;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      box-sizing: border-box;
    }

    .property-container h2 {
      font-size: 2.2rem;
      font-weight: 400;
      color: #222;
      margin-top: 10px;
      margin-bottom: 0.5rem;
    }

    .property-container p {
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
      color: #222;
    }

    .property-container a {
      color: #341100;
    }

    .content-wrapper {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .main-content {
      flex: 1;
      min-width: 0;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .property-title-container {
      flex: 1;
      min-width: 0;
    }

    .info-box {
      margin-top: 10px;
      align-self: flex-start;
    }

    .table-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      border: solid 1px #ddd;
      font-size: 0.9rem;
    }

    .products-table th,
    .products-table td {
      padding: 0.8rem;
      text-align: left;
      border: solid 1px #ddd;
    }

    .products-table th {
      background-color: #f8f9fa;
      font-weight: bold;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .products-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .products-table tr:hover {
      background-color: #e8f4fd;
    }

    .product-code {
      font-weight: 500;
      color: #341100;
    }

    .property-value {
      font-weight: 500;
      color: #341100;
    }

    .count {
      text-align: right;
      font-weight: bold;
      color: #333;
    }

    .count-header {
      text-align: right;
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

    /* Filter styles */
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

    .download-btn:hover {
      background-color: rgb(255, 255, 255);
      color: #341100;
      border: 1px solid #341100;
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

    .reset-btn:hover {
      background-color: rgb(255, 255, 255);
      color: #341100;
      border: 1px solid #341100;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
    }

    .view-mode-toggle {
      display: flex;
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .view-mode-btn {
      background-color: transparent;
      border: none;
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 0.875rem;
    }

    .view-mode-btn:hover {
      background-color: #e9ecef;
    }

    .view-mode-btn.active {
      background-color: #341100;
      color: white;
    }

    .view-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .content-wrapper {
        flex-direction: column;
      }

      .header-section {
        flex-direction: column;
        gap: 1rem;
      }

      .products-table {
        font-size: 0.8rem;
      }

      .products-table th,
      .products-table td {
        padding: 0.5rem;
      }

      .property-container h2 {
        font-size: 1.8rem;
      }

      .property-container p {
        font-size: 0.8rem;
      }

      .filter-controls {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .view-controls {
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
      }

      .view-mode-toggle {
        width: 100%;
        max-width: 300px;
      }

      .view-mode-btn {
        flex: 1;
      }
    }
  `

  /**
   * The property name for which we will display barcodes and values
   */
  @property({ type: String, attribute: "property-name" })
  propertyName = ""

  @state()
  private products: Array<{ product: string; v: string }> = []

  @state()
  private filteredProducts: Array<{ product: string; v: string }> = []

  @state()
  private groupedValues: Array<{ value: string; count: number }> = []

  @state()
  private filteredValues: Array<{ value: string; count: number }> = []

  @state()
  private viewMode: "products" | "values" = "products"

  @state()
  private loading = false

  @state()
  private error: string | null = null

  @state()
  private filters = {
    barcode: "",
    value: "",
  }

  private filterTimeout: number | null = null

  override async connectedCallback() {
    super.connectedCallback()
    // Note: The propertyName is set once and cannot be changed dynamically.
    // If you need to change it, you must reinitialize the component.
    if (this.propertyName) {
      await this.fetchProductsPropertiesMain()
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    // Clean up filter timeout
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout)
      this.filterTimeout = null
    }
  }

  private async fetchProductsPropertiesMain() {
    this.loading = true
    this.error = null

    try {
      const data = await folksonomyApi.fetchProductsProperties(this.propertyName)

      this.products = data || []
      this.filteredProducts = [...this.products]

      // Also prepare grouped data
      const valueCountMap = new Map<string, number>()
      this.products.forEach((product) => {
        const value = product.v
        valueCountMap.set(value, (valueCountMap.get(value) || 0) + 1)
      })

      this.groupedValues = Array.from(valueCountMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)

      this.filteredValues = [...this.groupedValues]
    } catch (error) {
      console.error("Error fetching property products:", error)
      this.error = "Failed to load products. Please try again later."
    } finally {
      this.loading = false
    }
  }

  private applyFilters() {
    const { barcode, value } = this.filters

    // Filter products view
    this.filteredProducts = this.products.filter((item) => {
      const matchesBarcode = !barcode || item.product.toLowerCase().includes(barcode.toLowerCase())
      const matchesValue = !value || item.v.toLowerCase().includes(value.toLowerCase())
      return matchesBarcode && matchesValue
    })

    // Filter values view (only value filter applies)
    this.filteredValues = this.groupedValues.filter((item) => {
      const matchesValue = !value || item.value.toLowerCase().includes(value.toLowerCase())
      return matchesValue
    })
  }

  private handleFilterInput(field: "barcode" | "value", value: string) {
    this.filters = {
      ...this.filters,
      [field]: value,
    }

    // Debounce filtering with 300ms delay for live filtering
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout)
    }

    this.filterTimeout = window.setTimeout(() => {
      this.applyFilters()
    }, 300)
  }

  private resetFilters() {
    this.filters = {
      barcode: "",
      value: "",
    }
    this.filteredProducts = [...this.products]
    this.filteredValues = [...this.groupedValues]
  }

  private switchViewMode(mode: "products" | "values") {
    this.viewMode = mode
  }

  private downloadCSV() {
    // Create CSV content based on current view mode
    const isProductsView = this.viewMode === "products"
    const headers = isProductsView
      ? ["Product Barcode", "Corresponding Value"]
      : ["Value", "Product Count"]

    const rows = isProductsView
      ? this.filteredProducts.map((item) => [item.product, item.v])
      : this.filteredValues.map((item) => [item.value, item.count])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    const today = new Date().toISOString().split("T")[0]
    const filename = isProductsView
      ? `folksonomy_property_${today}_${this.propertyName}_products.csv`
      : `folksonomy_property_${today}_${this.propertyName}_values.csv`

    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  private getProductUrl(productCode: string) {
    return `/product/${productCode}`
  }

  private getPropertyValueUrl(value: string) {
    return `/property/${this.propertyName}/value/${value}`
  }

  private getDocumentationUrl() {
    return `https://wiki.openfoodfacts.org/Folksonomy/Property/${this.propertyName}`
  }

  private renderTableHeader() {
    return html`
      <thead>
        <tr>
          <th class="product-code-header"><slot name="product-barcode-header"></slot></th>
          <th class="value-header"><slot name="corresponding-value-header"></slot></th>
        </tr>
        <tr class="filter-row">
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="${this.getSlotText("filter-barcodes-placeholder")}"
              .value="${this.filters.barcode}"
              @input="${(e: Event) =>
                this.handleFilterInput("barcode", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="${this.getSlotText("filter-values-placeholder")}"
              .value="${this.filters.value}"
              @input="${(e: Event) =>
                this.handleFilterInput("value", (e.target as HTMLInputElement).value)}"
            />
          </td>
        </tr>
      </thead>
    `
  }

  private renderProductRow(product: { product: string; v: string }) {
    return html`
      <tr>
        <td class="product-code">
          <a href="${this.getProductUrl(product.product)}" class="product-code">
            ${product.product}
          </a>
        </td>
        <td class="property-value">
          <a href="${this.getPropertyValueUrl(product.v)}" class="property-value"> ${product.v} </a>
        </td>
      </tr>
    `
  }

  private renderValueRow(valueItem: { value: string; count: number }) {
    return html`
      <tr>
        <td class="property-value">
          <a href="${this.getPropertyValueUrl(valueItem.value)}" class="property-value">
            ${valueItem.value}
          </a>
        </td>
        <td class="count">${valueItem.count}</td>
      </tr>
    `
  }

  private renderGroupedTableHeader() {
    return html`
      <thead>
        <tr>
          <th class="value-header"><slot name="property-value-header"></slot></th>
          <th class="count-header"><slot name="product-count-header"></slot></th>
        </tr>
        <tr class="filter-row">
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="${this.getSlotText("filter-values-placeholder")}"
              .value="${this.filters.value}"
              @input="${(e: Event) =>
                this.handleFilterInput("value", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td></td>
        </tr>
      </thead>
    `
  }

  private getSlotText(slotName: string): string {
    const slot = this.shadowRoot?.querySelector(`slot[name="${slotName}"]`) as HTMLSlotElement
    if (slot) {
      const assignedNodes = slot.assignedNodes()
      if (assignedNodes.length > 0) {
        return assignedNodes[0].textContent || ""
      }
    }
    return ""
  }

  private renderContent() {
    if (this.loading) {
      return html`<div class="loading"><slot name="loading-text"></slot></div>`
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`
    }

    if (this.products.length === 0) {
      return html`<div class="empty-state"><slot name="no-products-text"></slot></div>`
    }

    const isProductsView = this.viewMode === "products"
    const currentData = isProductsView ? this.filteredProducts : this.filteredValues
    const totalData = isProductsView ? this.products : this.groupedValues

    return html`
      <div class="table-container">
        <div class="filter-controls">
          <div class="view-controls">
            <div class="view-mode-toggle">
              <button
                class="view-mode-btn ${this.viewMode === "products" ? "active" : ""}"
                @click="${() => this.switchViewMode("products")}"
              >
                <slot name="individual-products-text"></slot>
              </button>
              <button
                class="view-mode-btn ${this.viewMode === "values" ? "active" : ""}"
                @click="${() => this.switchViewMode("values")}"
              >
                <slot name="grouped-values-text"></slot>
              </button>
            </div>
            <div class="rows-counter">
              ${isProductsView
                ? html`<slot name="products-count-text"></slot> ${currentData.length} /
                    ${totalData.length}`
                : html`<slot name="values-count-text"></slot> ${currentData.length} /
                    ${totalData.length}`}
            </div>
          </div>
          <div class="button-group">
            <button class="download-btn" @click="${this.downloadCSV}">
              <slot name="download-button-text"></slot>
            </button>
            <button class="reset-btn" @click="${this.resetFilters}">
              <slot name="reset-button-text"></slot>
            </button>
          </div>
        </div>
        <table class="products-table" id="products-table">
          ${isProductsView ? this.renderTableHeader() : this.renderGroupedTableHeader()}
          <tbody>
            ${isProductsView
              ? this.filteredProducts.map((product) => this.renderProductRow(product))
              : this.filteredValues.map((valueItem) => this.renderValueRow(valueItem))}
          </tbody>
        </table>
      </div>
    `
  }

  override render() {
    if (!this.propertyName) {
      return html`
        <div class="property-container">
          <div class="error"><slot name="property-name-error"></slot></div>
        </div>
      `
    }

    return html`
      <div class="property-container">
        <div class="content-wrapper">
          <div class="main-content">
            <div class="header-section">
              <div class="property-title-container">
                <h2 id="property_title">
                  <slot name="property-title-prefix"></slot> ${this.propertyName}
                </h2>

                <div id="fe_infobox" class="info-box">
                  <slot name="tip-text"></slot>
                  <a href="/properties"><slot name="all-properties-link-text"></slot></a>.
                </div>

                <p>
                  <slot name="documentation-intro-text"></slot>
                  <a href="${this.getDocumentationUrl()}" target="_blank" rel="noopener noreferrer">
                    <slot name="documentation-link-text"></slot>
                  </a>
                  <slot name="documentation-outro-text"></slot>
                </p>

                <p><slot name="products-list-intro-text"></slot></p>
              </div>
            </div>

            ${this.renderContent()}
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-property-products": FolksonomyPropertyProducts
  }
}
