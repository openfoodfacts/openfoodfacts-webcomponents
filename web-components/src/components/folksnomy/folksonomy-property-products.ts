import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { localized } from "@lit/localize"

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
      display: block;
      width: 100%;
      font-family: Arial, sans-serif;
      color: #333;
    }

    .property-container {
      width: 100%;
      max-width: none;
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
      flex-shrink: 0;
      border: solid black 1px;
      padding: 0.5rem;
      background-color: #f9f9f9;
      border-radius: 4px;
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

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .content-wrapper {
        flex-direction: column;
      }

      .header-section {
        flex-direction: column;
        gap: 1rem;
      }

      .info-box {
        width: 100%;
        order: -1;
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
    }
  `

  /**
   * The property name
   */
  @property({ type: String, attribute: "property-name" })
  propertyName = ""

  /**
   * The optional property value
   */
  @property({ type: String, attribute: "property-value" })
  propertyValue = ""

  @state()
  private products: Array<{ product: string; v: string }> = []

  @state()
  private filteredProducts: Array<{ product: string; v: string }> = []

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
    if (this.propertyName) {
      await this.fetchProducts()
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

  private async fetchProducts() {
    this.loading = true
    this.error = null

    try {
      // Construct API URL based on property and optional value
      let url = `/products?k=${this.propertyName}`
      if (this.propertyValue) {
        url += `&v=${this.propertyValue}`
      }

      console.log("Fetching products with property:", url)

      // Note: You may need to update the API call based on your actual API structure
      // For now, I'm using a placeholder that matches the pattern from the reference code
      const response = await fetch(`https://api.folksonomy.openfoodfacts.org${url}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Property products data:", data)

      this.products = data || []
      this.filteredProducts = [...this.products]
    } catch (error) {
      console.error("Error fetching property products:", error)
      this.error = "Failed to load products. Please try again later."
    } finally {
      this.loading = false
    }
  }

  private applyFilters() {
    const { barcode, value } = this.filters

    this.filteredProducts = this.products.filter((item) => {
      const matchesBarcode = !barcode || item.product.toLowerCase().includes(barcode.toLowerCase())
      const matchesValue = !value || item.v.toLowerCase().includes(value.toLowerCase())

      return matchesBarcode && matchesValue
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
  }

  private downloadCSV() {
    // Create CSV content
    const headers = ["Product Barcode", "Corresponding Value"]
    const rows = this.filteredProducts.map((item) => [item.product, item.v])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `folksonomy_property_${this.propertyName}_products.csv`)
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
          <th class="product-code-header">Product barcode</th>
          <th class="value-header">Corresponding value</th>
        </tr>
        <tr class="filter-row">
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="Filter barcodes..."
              .value="${this.filters.barcode}"
              @input="${(e: Event) =>
                this.handleFilterInput("barcode", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="Filter values..."
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

  private renderContent() {
    if (this.loading) {
      return html`<div class="loading">Loading products...</div>`
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`
    }

    if (this.products.length === 0) {
      return html`<div class="empty-state">No products found for this property.</div>`
    }

    return html`
      <div class="table-container">
        <div class="filter-controls">
          <div class="rows-counter">
            Products: ${this.filteredProducts.length} / ${this.products.length}
          </div>
          <div class="button-group">
            <button class="download-btn" @click="${this.downloadCSV}">Download CSV</button>
            <button class="reset-btn" @click="${this.resetFilters}">Reset</button>
          </div>
        </div>
        <table class="products-table" id="products-table">
          ${this.renderTableHeader()}
          <tbody>
            ${this.filteredProducts.map((product) => this.renderProductRow(product))}
          </tbody>
        </table>
      </div>
    `
  }

  override render() {
    if (!this.propertyName) {
      return html`
        <div class="property-container">
          <div class="error">Please provide a property name using the property-name attribute.</div>
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
                  Folksonomy property:
                  ${this.propertyName}${this.propertyValue ? `: ${this.propertyValue}` : ""}
                </h2>

                <p>
                  You should find a
                  <a href="${this.getDocumentationUrl()}" target="_blank" rel="noopener noreferrer">
                    dedicated documentation
                  </a>
                  about this property on Open Food Facts wiki
                </p>

                <p>List of products using this property:</p>
              </div>

              <div id="fe_infobox" class="info-box">
                Tip: you can also find the <a href="/properties">list of all properties</a>.
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
