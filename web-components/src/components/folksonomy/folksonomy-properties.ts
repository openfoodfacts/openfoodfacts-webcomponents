import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import { SignalWatcher } from "@lit-labs/signals"
import folksonomyApi from "../../api/folksonomy"
import { createDebounce, downloadCSV } from "../../utils"
import "../shared/dual-range-slider"
import type { PropertyClashCheck } from "../../types/folksonomy"
import { userInfo } from "../../signals/folksonomy"

/**
 * Folksonomy Properties Viewer
 * @element folksonomy-properties
 * This component displays all contributed properties from the Folksonomy Engine project.
 */
@customElement("folksonomy-properties")
@localized()
export class FolksonomyProperties extends SignalWatcher(LitElement) {
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

    .clash-info {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
    }

    .clash-stat {
      display: flex;
      justify-content: space-between;
      margin: 0.5rem 0;
    }

    .clash-stat-label {
      font-weight: 500;
    }

    .clash-stat-value {
      font-weight: bold;
      color: #856404;
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
   * Path to single property, the property name is appended to the end.
   * It can be a full URL, a relative or absolute path
   */
  @property({ attribute: "property-base-path" })
  propertyBasePath = "/property/"

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

  @state()
  private showRenameModal = false

  @state()
  private showDeleteModal = false

  @state()
  private showClashModal = false

  @state()
  private showMessageModal = false

  @state()
  private renameModalData = {
    property: "",
    newProperty: "",
  }

  @state()
  private deleteModalProperty = ""

  @state()
  private clashData: PropertyClashCheck | null = null

  @state()
  private messageModalData = {
    title: "",
    message: "",
    type: "success" as "success" | "error",
  }

  private filterDebounce = createDebounce(1100)

  override async connectedCallback() {
    super.connectedCallback()
    await this.fetchProperties()
    await folksonomyApi.fetchUserInfo()
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

  private get canModerateProperties(): boolean {
    const currentUserInfo = userInfo.get()
    return currentUserInfo?.admin === true || currentUserInfo?.moderator === true
  }

  private getPropertyUrl(propertyName: string) {
    return `${this.propertyBasePath}${propertyName}`
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

  // Property moderation methods
  private openRenameModal(property: string) {
    this.renameModalData = {
      property,
      newProperty: "",
    }
    this.showRenameModal = true
  }

  private closeRenameModal() {
    this.showRenameModal = false
    this.renameModalData = {
      property: "",
      newProperty: "",
    }
  }

  private openDeleteModal(property: string) {
    this.deleteModalProperty = property
    this.showDeleteModal = true
  }

  private closeDeleteModal() {
    this.showDeleteModal = false
    this.deleteModalProperty = ""
  }

  private closeClashModal() {
    this.showClashModal = false
    this.clashData = null
    // Clear rename data when clash modal is closed (canceled)
    this.renameModalData = {
      property: "",
      newProperty: "",
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

  private async handleCheckClash() {
    const { property, newProperty } = this.renameModalData

    if (!newProperty.trim() || newProperty.trim() === property) {
      return
    }

    try {
      const clashData = await folksonomyApi.checkPropertyClash({
        old_property: property,
        new_property: newProperty.trim(),
      })

      this.clashData = clashData
      // Don't clear the rename data yet - we need it for the actual rename
      this.showRenameModal = false
      this.showClashModal = true
    } catch (error) {
      console.error("Error checking property clash:", error)
      this.showMessage(
        "error",
        msg("Error"),
        msg("Failed to check property conflicts. Please try again.")
      )
    }
  }

  private async handleRenameProperty() {
    const { property, newProperty } = this.renameModalData

    try {
      await folksonomyApi.renameProperty({
        old_property: property,
        new_property: newProperty.trim(),
      })

      // Clear all modal states after successful rename
      this.showClashModal = false
      this.clashData = null
      this.renameModalData = {
        property: "",
        newProperty: "",
      }

      await this.fetchProperties()
      this.showMessage("success", msg("Success"), msg("Property renamed successfully!"))
    } catch (error) {
      console.error("Error renaming property:", error)
      this.showMessage("error", msg("Error"), msg("Failed to rename property. Please try again."))
    }
  }

  private async handleDeleteProperty() {
    try {
      await folksonomyApi.deleteProperty({
        property: this.deleteModalProperty,
      })

      this.closeDeleteModal()
      await this.fetchProperties()
      this.showMessage("success", msg("Success"), msg("Property deleted successfully!"))
    } catch (error) {
      console.error("Error deleting property:", error)
      this.showMessage("error", msg("Error"), msg("Failed to delete property. Please try again."))
    }
  }

  private renderPropertyActions(property: { k: string; count: number; values: number }) {
    return html`
      <td class="actions-column">
        <div class="actions-buttons">
          <button
            class="action-btn"
            @click="${() => this.openRenameModal(property.k)}"
            title="${msg("Rename this property")}"
          >
            ${msg("Rename")}
          </button>
          <button
            class="action-btn delete"
            @click="${() => this.openDeleteModal(property.k)}"
            title="${msg("Delete this property")}"
          >
            ${msg("Delete")}
          </button>
        </div>
      </td>
    `
  }

  private renderRenameModal() {
    if (!this.showRenameModal) return ""

    return html`
      <div class="modal-overlay" @click="${this.closeRenameModal}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h3 class="modal-title">${msg("Rename Property")}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-text">
              ${msg(str`Rename property '${this.renameModalData.property}' to:`)}
            </div>
            <label for="new-property">${msg("New property name:")}</label>
            <input
              id="new-property"
              type="text"
              class="modal-input"
              .value="${this.renameModalData.newProperty}"
              @input="${(e: Event) => {
                this.renameModalData = {
                  ...this.renameModalData,
                  newProperty: (e.target as HTMLInputElement).value,
                }
              }}"
              @keydown="${(e: KeyboardEvent) => {
                if (e.key === "Enter") {
                  this.handleCheckClash()
                } else if (e.key === "Escape") {
                  this.closeRenameModal()
                }
              }}"
              placeholder="${msg("Enter new property name...")}"
              autofocus
            />
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" @click="${this.closeRenameModal}">
              ${msg("Cancel")}
            </button>
            <button
              class="modal-btn modal-btn-primary"
              @click="${this.handleCheckClash}"
              ?disabled="${!this.renameModalData.newProperty.trim() ||
              this.renameModalData.newProperty.trim() === this.renameModalData.property}"
            >
              ${msg("Check Conflicts")}
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderClashModal() {
    if (!this.showClashModal || !this.clashData) return ""

    return html`
      <div class="modal-overlay" @click="${this.closeClashModal}">
        <div class="modal" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h3 class="modal-title">${msg("Property Rename Conflicts")}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-text">
              ${msg(
                str`Renaming '${this.renameModalData.property}' to '${this.renameModalData.newProperty}' will affect:`
              )}
            </div>
            <div class="clash-info">
              <div class="clash-stat">
                <span class="clash-stat-label">${msg("Products with both properties:")}</span>
                <span class="clash-stat-value">${this.clashData.products_with_both}</span>
              </div>
              <div class="clash-stat">
                <span class="clash-stat-label">${msg("Products with old property only:")}</span>
                <span class="clash-stat-value">${this.clashData.products_with_old_only}</span>
              </div>
              <div class="clash-stat">
                <span class="clash-stat-label">${msg("Products with new property only:")}</span>
                <span class="clash-stat-value">${this.clashData.products_with_new_only}</span>
              </div>
            </div>
            <div class="modal-text">
              <strong>${msg("Do you want to proceed with the rename?")}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" @click="${this.closeClashModal}">
              ${msg("Cancel")}
            </button>
            <button class="modal-btn modal-btn-danger" @click="${this.handleRenameProperty}">
              ${msg("Proceed with Rename")}
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
            <h3 class="modal-title">${msg("Delete Property")}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-text">
              ${msg(
                str`Are you sure you want to delete the property '${this.deleteModalProperty}'?`
              )}
            </div>
            <div class="modal-text">
              <strong>${msg("This action cannot be undone.")}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" @click="${this.closeDeleteModal}">
              ${msg("Cancel")}
            </button>
            <button class="modal-btn modal-btn-danger" @click="${this.handleDeleteProperty}">
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

  private renderTableHeader() {
    return html`
      <thead>
        <tr>
          <th></th>
          <th class="property-name-header">${msg("Property")}</th>
          <th class="doc">${msg("Documentation")}</th>
          <th class="count">${msg("Count")}</th>
          <th class="values">${msg("Values")}</th>
          ${this.canModerateProperties
            ? html`<th class="actions-column">${msg("Actions")}</th>`
            : ""}
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
          ${this.canModerateProperties ? html`<td></td>` : ""}
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
        ${this.canModerateProperties ? this.renderPropertyActions(property) : ""}
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

      ${this.renderRenameModal()} ${this.renderClashModal()} ${this.renderDeleteModal()}
      ${this.renderMessageModal()}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-properties": FolksonomyProperties
  }
}
