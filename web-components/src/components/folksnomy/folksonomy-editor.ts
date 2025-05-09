import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import "./folksonomy-editor-row"
import folksonomyApi from "../../api/folksonomy"

/**
 * Folksonomy Editor
 * @element folksonomy-editor
 * This component allows users to add personalized properties and values to the Open Food Facts database. It is part of the Folksonomy Engine project.
 */
@customElement("folksonomy-editor")
@localized()
export class FolksonomyEditor extends LitElement {
  /**
   * The product ID for which the properties are being added
   * @type {boolean}
   */
  @property({ type: String, attribute: "product-code" })
  productCode = ""

  /**
   * The type of page being displayed (e.g., "view", "edit")
   * @type {string}
   */
  @property({ type: String, attribute: "page-type" })
  pageType = "view"

  static override styles = css`
    :host {
      font-family: Arial, sans-serif;
      color: #333;
    }
    .feus {
      margin-bottom: 1rem;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
    }
    .feus h2 {
      font-size: 1.5rem;
      color: #007bff;
      margin-bottom: 0.5rem;
    }
    .feus p {
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 0.8rem;
    }
    #free_properties_form table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      border: solid 1px #ddd;
      font-size: 0.9rem;
      table-layout: fixed;
    }
    #free_properties_form table th,
    #free_properties_form table td {
      padding: 0.8rem;
      text-align: left;
      border: solid 1px #ddd;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #free_properties_form table th {
      background-color: #dedede;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
    .sort-header {
      display: inline-flex;
      align-items: center;
      gap: 0.2em;
    }
    .sort-icon {
      display: inline-flex;
      flex-direction: column;
      margin-left: 0.5em;
      font-size: 0.9em;
      line-height: 1;
    }
    .sort-arrow {
      opacity: 0.3;
      height: 0.8em;
      width: 0.8em;
      padding: 0;
      margin: 0;
      display: block;
    }
    .sort-arrow.active {
      opacity: 1;
    }
    #free_properties_form table th.sortable {
      padding-right: 0.8em;
    }
    #free_properties_form table th.sortable::before,
    #free_properties_form table th.sortable::after {
      display: none;
    }
    #free_properties_form table tr {
      height: 4rem;
    }
    #free_properties_form table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    @media (max-width: 480px) {
      #free_properties_form table tr:first-child {
        height: 0.5rem;
      }
    }
  `

  /**
   * State representing all the properties and values
   */
  @state()
  properties: Array<{ key: string; value: string; version: number }> = []

  @state()
  private sortColumn: "key" | "value" = "key"

  @state()
  private sortDirection: "asc" | "desc" = "asc"

  private handleRowDelete(event: CustomEvent) {
    const { key } = event.detail
    this.properties = this.properties.filter((property) => property.key !== key)
  }

  private handleRowAdd(event: CustomEvent) {
    const { key, value } = event.detail
    if (key && value) {
      this.properties = [...this.properties, { key, value, version: 1 }]
      this.sortProperties()
    } else {
      console.error("Key or value is missing in the event detail.")
    }
  }

  private handleRowUpdate(event: CustomEvent) {
    const { key, value, version } = event.detail
    this.properties = this.properties.map((property) =>
      property.key === key ? { ...property, value, version } : property
    )
    this.sortProperties()
  }

  private handleSort(column: "key" | "value") {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortColumn = column
      this.sortDirection = "asc"
    }
    this.sortProperties()
  }

  private sortProperties() {
    const column = this.sortColumn
    const direction = this.sortDirection === "asc" ? 1 : -1
    this.properties = [...this.properties].sort((a, b) => {
      // Use localeCompare for better, locale-aware sorting
      const valueA = a[column]?.toString().toLowerCase() ?? ""
      const valueB = b[column]?.toString().toLowerCase() ?? ""
      return valueA.localeCompare(valueB, undefined, { numeric: true }) * direction
    })
  }

  override connectedCallback() {
    super.connectedCallback()
    this.fetchAndLogFolksonomyKeys()

    this.addEventListener("add-row", this.handleRowAdd as EventListener)
    this.addEventListener("update-row", this.handleRowUpdate as EventListener)
    this.addEventListener("delete-row", this.handleRowDelete as EventListener)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    this.removeEventListener("add-row", this.handleRowAdd as EventListener)
    this.removeEventListener("update-row", this.handleRowUpdate as EventListener)
    this.removeEventListener("delete-row", this.handleRowDelete as EventListener)
  }

  private async fetchAndLogFolksonomyKeys() {
    try {
      const product_properties = await folksonomyApi.fetchProductProperties(this.productCode)

      // update the state with the fetched properties
      this.properties = product_properties.map((item: any) => ({
        key: item.k,
        value: item.v,
        version: item.version,
      }))
      this.sortProperties()
    } catch (error) {
      console.error("Error fetching folksonomy keys:", error)
    }
  }

  private renderSortIcon(column: "key" | "value") {
    const isActive = this.sortColumn === column
    return html`
      <span class="sort-icon">
        <svg
          class="sort-arrow ${isActive && this.sortDirection === "asc" ? "active" : ""}"
          viewBox="0 0 10 6"
        >
          <polygon points="5,0 10,6 0,6" />
        </svg>
        <svg
          class="sort-arrow ${isActive && this.sortDirection === "desc" ? "active" : ""}"
          viewBox="0 0 10 6"
          style="transform:rotate(180deg)"
        >
          <polygon points="5,0 10,6 0,6" />
        </svg>
      </span>
    `
  }

  private renderForm() {
    return html`
      <form id="free_properties_form">
        <table>
          <tr>
            <th
              @click=${() => this.handleSort("key")}
              class=${`sortable ${this.sortColumn === "key" ? `sort-${this.sortDirection}` : ""}`}
            >
              <span class="sort-header"> ${msg("Property")} ${this.renderSortIcon("key")} </span>
            </th>
            <th
              @click=${() => this.handleSort("value")}
              class=${`sortable ${this.sortColumn === "value" ? `sort-${this.sortDirection}` : ""}`}
            >
              <span class="sort-header"> ${msg("Value")} ${this.renderSortIcon("value")} </span>
            </th>
            <th>${msg("Actions")}</th>
          </tr>
          ${this.properties.map(
            (item, index) =>
              html`<folksonomy-editor-row
                product-code=${this.productCode}
                key=${item.key}
                value=${item.value}
                version=${item.version}
                row-number=${index + 1}
                page-type=${this.pageType}
              />`
          )}
          ${html`<folksonomy-editor-row
            product-code=${this.productCode}
            page-type=${this.pageType}
            row-number=${this.properties.length + 1}
            empty
          />`}
        </table>
      </form>
    `
  }

  override render() {
    return html`
      <section>
        <div class="feus">
          <div>
            <div>
              <h2>
                ${msg("Personalized properties")} (<span
                  data-tooltip
                  aria-haspopup="true"
                  data-position="top"
                  data-alignment="left"
                  title=${msg("Be aware the data model might be modified. Use at your own risk.")}
                  >beta</span
                >)
              </h2>
              <p>
                ${msg(
                  html`These properties are created and filed by users for any kind of usages. Feel
                    free to add your own. The properties and values you create
                    <strong>must be factual</strong>. You can dive into
                    <a href="https://openfoodfacts-explorer.vercel.app/folksonomy"
                      >the list of properties already used by the community</a
                    >
                    or explore the
                    <a href="https://wiki.openfoodfacts.org/Folksonomy/Property"
                      >properties' documentation and its search engine</a
                    >.`
                )}
              </p>
              <p>${msg("Be aware the data model might be modified. Use at your own risk.")}</p>
              <p>
                ${msg(
                  html`This is brought by the
                    <a href="https://wiki.openfoodfacts.org/Folksonomy_Engine"
                      >Folksonomy Engine project</a
                    >. Don't hesitate to participate or give feedback.`
                )}
              </p>
              ${this.renderForm()}
            </div>
          </div>
        </div>
      </section>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-editor": FolksonomyEditor
  }
}
