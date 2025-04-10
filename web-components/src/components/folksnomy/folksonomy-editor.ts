import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { localized } from "@lit/localize"
import "./data-row" // Import the new DataRow component
import "./add-property" // Import the new AddProperty component
import folksonomyApi from "../../api/folksonomy" // Import the API module

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
  @property({ type: String, attribute: "product-id" })
  productId = ""

  /**
   * The type of page being displayed (e.g., "view", "edit")
   * @type {boolean}
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
      table-layout: fixed; /* Ensure fixed column widths */
    }

    #free_properties_form table th,
    #free_properties_form table td {
      padding: 0.8rem;
      text-align: left;
      border: solid 1px #ddd;
      overflow: hidden; /* Prevent content overflow */
      text-overflow: ellipsis; /* Add ellipsis for overflowed text */
      white-space: nowrap; /* Prevent text wrapping */
    }

    #free_properties_form table th:nth-child(1),
    #free_properties_form table td:nth-child(1) {
      width: 30%; /* Property column */
    }

    #free_properties_form table th:nth-child(2),
    #free_properties_form table td:nth-child(2) {
      width: 30%; /* Value column */
    }

    #free_properties_form table th:nth-child(3),
    #free_properties_form table td:nth-child(3) {
      width: 40%; /* Actions column */
    }

    #free_properties_form table th {
      background-color: #f1f1f1;
      font-weight: bold;
      color: #555;
    }

    #free_properties_form table tr {
      height: 4rem; /* Fixed row height */
    }

    #free_properties_form table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .actions {
      color: #007bff;
      cursor: pointer;
      text-decoration: underline;
      font-size: 0.9rem;
    }

    .actions:hover {
      color: #0056b3;
    }

    button {
      padding: 0.5rem 1rem;
      background-color: #341100; /* Updated background color */
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    button:hover {
      background-color: #5a2a00; /* Slightly darker shade */
    }
  `

  /**
   * State representing all the properties and values
   */
  @state()
  properties: Array<{ key: string; value: string }> = []

  override connectedCallback() {
    super.connectedCallback()
    this.fetchAndLogFolksonomyKeys()
  }

  private async fetchAndLogFolksonomyKeys() {
    try {
      const product_properties = await folksonomyApi.fetchProductProperties(this.productId)
      console.log("Product properties:", product_properties)

      // update the state with the fetched properties
      this.properties = product_properties.map((item: any) => ({
        key: item.k,
        value: item.v,
      }))

    } catch (error) {
      console.error("Error fetching folksonomy keys:", error)
    }
  }

  override render() {
    console.log("chekcing state: ", this.properties)

    return html`
      <section class="row">
        <div id="free_properties_1" class="large-12 column feus">
          <div class="card">
            <div class="card-section h-space-tiny">
              <h2>
                Personalized properties (<span
                  data-tooltip
                  aria-haspopup="true"
                  class="has-tip"
                  data-position="top"
                  data-alignment="left"
                  title="Be aware the data model might be modified. Use at your own risk."
                  >beta</span
                >)
              </h2>
              <p id="fe_login_info"></p>
              <p>
                These properties are created and filed by users for any kind of usages. Feel free to
                add your own. The properties and values you create <strong>must be factual</strong>.
                You can dive into
                <a href="/properties">the list of properties already used by the community</a>
                or explore the
                <a href="https://wiki.openfoodfacts.org/Folksonomy/Property"
                  >properties' documentation and its search engine</a
                >.
              </p>
              <p>Be aware the data model might be modified. Use at your own risk.</p>
              <p>
                This is brought by the
                <a href="https://wiki.openfoodfacts.org/Folksonomy_Engine"
                  >folksonomy engine project</a
                >. Don't hesitate to participate or give feedback.
              </p>
              <form id="free_properties_form">
                <table>
                  <tr>
                    <th>Property</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                  ${this.properties.map(
                    (item) => html`<data-row .key=${item.key} .value=${item.value}></data-row>`
                  )}
                  <tr>
                    <td colspan="3">
                      <add-property @add-property=${this.handleAddProperty}></add-property>
                    </td>
                  </tr>
                </table>
              </form>
            </div>
          </div>
        </div>
      </section>
    `
  }

  private handleAddProperty(event: CustomEvent) {
    const { key, value } = event.detail
    this.properties = [...this.properties, { key, value }]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-editor": FolksonomyEditor
  }
}
