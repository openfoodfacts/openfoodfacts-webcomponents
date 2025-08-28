import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { downloadCSV } from "../../utils"
import { localized, msg } from "@lit/localize"
import folksonomyApi from "../../api/folksonomy"
import type { UserInfo } from "../../types/folksonomy"

/**
 * Folksonomy Property Products Viewer
 * @element folksonomy-property-products
 * This component displays products that use a specific folksonomy property.
 * Note: The propertyName attribute is initialized once and cannot be modified dynamically, to change it, the component must be reinitialized.
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

    .actions-column {
      text-align: center;
      width: 120px;
    }

    .actions-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-btn {
      background-color: transparent;
      border: 1px solid #341100;
      color: #341100;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
      min-width: 50px;
    }

    .action-btn:hover {
      background-color: #341100;
      color: white;
    }

    .action-btn.delete {
      border-color: #dc3545;
      color: #dc3545;
    }

    .action-btn.delete:hover {
      background-color: #dc3545;
      color: white;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn:disabled:hover {
      background-color: transparent;
      color: #341100;
    }

    .action-btn.delete:disabled:hover {
      background-color: transparent;
      color: #dc3545;
    }

    @media (max-width: 768px) {
      .actions-column {
        width: 100px;
      }

      .actions-buttons {
        flex-direction: column;
        gap: 0.125rem;
      }

      .action-btn {
        font-size: 0.7rem;
        padding: 0.2rem 0.4rem;
        min-width: 40px;
      }
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.2s ease-out;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 1rem 0;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .modal-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .modal-input:focus {
      outline: none;
      border-color: #341100;
      box-shadow: 0 0 0 2px rgba(52, 17, 0, 0.1);
    }

    .modal-text {
      color: #555;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .modal-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 80px;
    }

    .modal-btn-primary {
      background-color: #341100;
      color: white;
    }

    .modal-btn-primary:hover {
      background-color: #2a0e00;
    }

    .modal-btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .modal-btn-danger:hover {
      background-color: #c82333;
    }

    .modal-btn-secondary {
      background-color: #f8f9fa;
      color: #333;
      border: 1px solid #ddd;
    }

    .modal-btn-secondary:hover {
      background-color: #e9ecef;
    }

    .modal-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .modal {
        width: 95%;
        margin: 1rem;
      }

      .modal-footer {
        flex-direction: column;
      }

      .modal-btn {
        width: 100%;
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

  @state()
  private userInfo: UserInfo | null = null

  @state()
  private showReplaceModal = false

  @state()
  private showDeleteModal = false

  @state()
  private showMessageModal = false

  @state()
  private replaceModalData = {
    value: "",
    newValue: "",
  }

  @state()
  private deleteModalValue = ""

  @state()
  private messageModalData = {
    title: "",
    message: "",
    type: "success" as "success" | "error",
  }

  private filterTimeout: number | null = null

  override async connectedCallback() {
    super.connectedCallback()
    if (this.propertyName) {
      await this.fetchProductsPropertiesMain()
    }
    await this.fetchUserInfo()
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

  private async fetchUserInfo() {
    try {
      const userInfo = await folksonomyApi.getUserInfo()
      this.userInfo = userInfo
    } catch (error) {
      console.error("Error fetching user info:", error)
      // User might not be authenticated, which is fine
      this.userInfo = null
    } finally {
    }
  }

  private get canModerateValues(): boolean {
    return this.userInfo?.admin === true || this.userInfo?.moderator === true
  }

  private openReplaceModal(value: string) {
    this.replaceModalData = {
      value,
      newValue: "",
    }
    this.showReplaceModal = true
  }

  private closeReplaceModal() {
    this.showReplaceModal = false
    this.replaceModalData = {
      value: "",
      newValue: "",
    }
  }

  private async handleReplaceValue() {
    const { value, newValue } = this.replaceModalData

    if (!newValue.trim() || newValue.trim() === value) {
      return
    }

    try {
      await folksonomyApi.replaceValue({
        property: this.propertyName,
        old_value: value,
        new_value: newValue.trim(),
      })

      this.closeReplaceModal()
      await this.fetchProductsPropertiesMain()
      this.showMessage("success", msg("Success"), msg("Value replaced successfully!"))
    } catch (error) {
      console.error("Error replacing value:", error)
      this.showMessage("error", msg("Error"), msg("Failed to replace value. Please try again."))
    }
  }

  private openDeleteModal(value: string) {
    this.deleteModalValue = value
    this.showDeleteModal = true
  }

  private closeDeleteModal() {
    this.showDeleteModal = false
    this.deleteModalValue = ""
  }

  private async handleDeleteValue() {
    try {
      await folksonomyApi.deleteValue({
        property: this.propertyName,
        value: this.deleteModalValue,
      })

      this.closeDeleteModal()
      await this.fetchProductsPropertiesMain()
      this.showMessage("success", msg("Success"), msg("Value deleted successfully!"))
    } catch (error) {
      console.error("Error deleting value:", error)
      this.showMessage("error", msg("Error"), msg("Failed to delete value. Please try again."))
    }
  }

  private showMessage(type: "success" | "error", title: string, message: string) {
    this.messageModalData = { type, title, message }
    this.showMessageModal = true
  }

  private closeMessageModal() {
    this.showMessageModal = false
    this.messageModalData = {
      title: "",
      message: "",
      type: "success",
    }
  }

  private renderReplaceModal() {
    if (!this.showReplaceModal) return ""

    return html`
      <div class="modal-overlay" @click="${this.closeReplaceModal}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h3 class="modal-title">${msg("Replace Value")}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-text">
              ${msg("Replace all instances of '${value}' with a new value:").replace(
                "${value}",
                this.replaceModalData.value
              )}
            </div>
            <label for="new-value">${msg("New value:")}</label>
            <input
              id="new-value"
              type="text"
              class="modal-input"
              .value="${this.replaceModalData.newValue}"
              @input="${(e: Event) => {
                this.replaceModalData = {
                  ...this.replaceModalData,
                  newValue: (e.target as HTMLInputElement).value,
                }
              }}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === "Enter") {
                  this.handleReplaceValue()
                } else if (e.key === "Escape") {
                  this.closeReplaceModal()
                }
              }}"
              placeholder="${msg("Enter new value...")}"
              autofocus
            />
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" @click="${this.closeReplaceModal}">
              ${msg("Cancel")}
            </button>
            <button
              class="modal-btn modal-btn-primary"
              @click="${this.handleReplaceValue}"
              ?disabled="${!this.replaceModalData.newValue.trim() ||
              this.replaceModalData.newValue.trim() === this.replaceModalData.value}"
            >
              ${msg("Replace")}
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderDeleteModal() {
    if (!this.showDeleteModal) return ""

    return html`
      <div class="modal-overlay" @click="${this.closeDeleteModal}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h3 class="modal-title">${msg("Delete Value")}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-text">
              ${msg(
                "Are you sure you want to delete all instances of the value '${value}'?"
              ).replace("${value}", this.deleteModalValue)}
            </div>
            <div class="modal-text">
              <strong>${msg("This action cannot be undone.")}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" @click="${this.closeDeleteModal}">
              ${msg("Cancel")}
            </button>
            <button class="modal-btn modal-btn-danger" @click="${this.handleDeleteValue}">
              ${msg("Delete")}
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderMessageModal() {
    if (!this.showMessageModal) return ""

    return html`
      <div class="modal-overlay" @click="${this.closeMessageModal}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h3 class="modal-title">${this.messageModalData.title}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-text">${this.messageModalData.message}</div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-primary" @click="${this.closeMessageModal}">
              ${msg("OK")}
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderValueActions(valueItem: { value: string; count: number }) {
    return html`
      <td class="actions-column">
        <div class="actions-buttons">
          <button
            class="action-btn"
            @click="${() => this.openReplaceModal(valueItem.value)}"
            title="${msg("Replace this value across all products")}"
          >
            ${msg("Replace")}
          </button>
          <button
            class="action-btn delete"
            @click="${() => this.openDeleteModal(valueItem.value)}"
            title="${msg("Delete this value from all products")}"
          >
            ${msg("Delete")}
          </button>
        </div>
      </td>
    `
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

  private handleDownloadCSV() {
    // Create CSV content based on current view mode
    const isProductsView = this.viewMode === "products"
    const headers = isProductsView
      ? [msg("Product Barcode"), msg("Corresponding Value")]
      : [msg("Value"), msg("Product Count")]

    const rows = isProductsView
      ? this.filteredProducts.map((item) => [item.product, item.v])
      : this.filteredValues.map((item) => [item.value, item.count])

    const today = new Date().toISOString().split("T")[0]
    const filename = isProductsView
      ? `folksonomy_property_${today}_${this.propertyName}_products.csv`
      : `folksonomy_property_${today}_${this.propertyName}_values.csv`

    downloadCSV(rows, filename, headers)
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
          <th class="product-code-header">${msg("Product barcode")}</th>
          <th class="value-header">${msg("Corresponding value")}</th>
        </tr>
        <tr class="filter-row">
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="${msg("Filter barcodes...")}"
              .value="${this.filters.barcode}"
              @input="${(e: Event) =>
                this.handleFilterInput("barcode", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="${msg("Filter values...")}"
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
        ${this.canModerateValues ? this.renderValueActions(valueItem) : ""}
      </tr>
    `
  }

  private renderGroupedTableHeader() {
    return html`
      <thead>
        <tr>
          <th class="value-header">${msg("Property Value")}</th>
          <th class="count-header">${msg("Product Count")}</th>
          ${this.canModerateValues ? html`<th class="actions-column">${msg("Actions")}</th>` : ""}
        </tr>
        <tr class="filter-row">
          <td>
            <input
              type="text"
              class="filter-input"
              placeholder="${msg("Filter values...")}"
              .value="${this.filters.value}"
              @input="${(e: Event) =>
                this.handleFilterInput("value", (e.target as HTMLInputElement).value)}"
            />
          </td>
          <td></td>
          ${this.canModerateValues ? html`<td></td>` : ""}
        </tr>
      </thead>
    `
  }

  private renderContent() {
    if (this.loading) {
      return html`<div class="loading">${msg("Loading products...")}</div>`
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`
    }

    if (this.products.length === 0) {
      return html`<div class="empty-state">${msg("No products found for this property.")}</div>`
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
                ${msg("Individual Products")}
              </button>
              <button
                class="view-mode-btn ${this.viewMode === "values" ? "active" : ""}"
                @click="${() => this.switchViewMode("values")}"
              >
                ${msg("Grouped Values")}
              </button>
            </div>
            <div class="rows-counter">
              ${isProductsView
                ? `${msg("Products")}: ${currentData.length} / ${totalData.length}`
                : `${msg("Values")}: ${currentData.length} / ${totalData.length}`}
            </div>
          </div>
          <div class="button-group">
            <button class="download-btn" @click="${this.handleDownloadCSV}">
              ${msg("Download CSV")}
            </button>
            <button class="reset-btn" @click="${this.resetFilters}">${msg("Reset")}</button>
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
          <div class="error">
            ${msg("Please provide a property name using the property-name attribute.")}
          </div>
        </div>
      `
    }

    return html`
      <div class="property-container">
        <div class="content-wrapper">
          <div class="main-content">
            <div class="header-section">
              <div class="property-title-container">
                <h2 id="property_title">${msg("Folksonomy property")}: ${this.propertyName}</h2>

                <div id="fe_infobox" class="info-box">
                  ${msg("Tip: you can also find the")}
                  <a href="https://world.openfoodfacts.org/properties" target="_blank"
                    >${msg("list of all properties")}</a
                  >.
                </div>

                <p>
                  <slot name="property-description">
                    ${msg("You should find a")}
                    <a
                      href="${this.getDocumentationUrl()}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${msg("dedicated documentation")}
                    </a>
                    ${msg("about this property on Open Food Facts wiki")}
                  </slot>
                </p>

                <p>${msg("List of products using this property")}:</p>
              </div>
            </div>

            ${this.renderContent()}
          </div>
        </div>
      </div>

      ${this.renderReplaceModal()} ${this.renderDeleteModal()} ${this.renderMessageModal()}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-property-products": FolksonomyPropertyProducts
  }
}
