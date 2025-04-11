import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "./delete-modal"
import folksonomyApi from "../../api/folksonomy"
import { msg } from "@lit/localize"

/**
 * FolksonomyEditorRow Component
 * @element folksonomy-editor-row
 * @description A component for adding and editing product properties in a table row format.
 */
@customElement("folksonomy-editor-row")
export class FolksonomyEditorRow extends LitElement {
  static override styles = css`
    :host {
      font-family: Arial, sans-serif;
      font-size: 0.9rem;
      color: #333;
      width: 100%;
      display: contents;
    }

    .odd-row {
      background-color: #ffffff;
    }

    .even-row {
      background-color: #f2f2f2;
    }

    .button-container {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      width: 10rem;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 20px;
      font-size: 0.9rem;
      height: 1.8rem;
    }

    input:focus {
      outline: none;
    }

    button {
      padding: 0.5rem 1rem;
      background-color: #341100;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      height: 2.5rem;
      width: 100%;
    }

    button:hover {
      background-color: #5a2a00;
    }

    table {
      width: 100%;
      table-layout: fixed;
    }

    td {
      padding: 0.5rem 1.2rem;
      text-align: left;
      vertical-align: middle;
      border: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    input[type="text"] {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 15px;
      box-sizing: border-box;
      font-size: 0.9rem;
      height: 2.5rem;
      background-color: #f9f9f9;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
    }

    .actions {
      color: white;
      background-color: #341100;
      border: none;
      border-radius: 20px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 0.9rem;
      text-align: center;
      width: 10rem;
    }

    .actions:hover {
      background-color: #5a2a00;
    }

    .save-button {
      background-color: #341100;
    }

    .save-button:hover {
      background-color: #5a2a00;
    }

    .delete-button {
      background-color: #341100;
    }

    .delete-button:hover {
      background-color: #5a2a00;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .property-link {
      color: black;
    }

    #create-button {
      width: 10rem;
      padding: 0.4rem 0.8rem;
    }

    @media (max-width: 768px) {
      .button-group {
        flex-direction: column;
      }

      .button-container {
        flex-direction: column;
      }

      #create-button {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
        height: 2rem;
        width: 7rem;
      }

      .actions {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
        height: 2rem;
        width: 7rem;
      }
    }

    @media (max-width: 480px) {
      .actions {
        width: 5rem;
        font-size: 0.7rem;
        padding: 0.3rem 0.5rem;
        height: 1.6rem;
      }

      .button-container {
        flex-direction: column;
      }

      #create-button {
        width: 5rem;
        font-size: 0.7rem;
        padding: 0.3rem 0.5rem;
        height: 1.6rem;
      }
    }

    td {
      padding: 0.4rem 0.5rem;
    }
  `

  /**
   * The product ID for which the properties are being added
   * @type {string}
   */
  @property({ type: String, attribute: "product-id" })
  productId = ""

  /**
   * The version of the product property being edited
   * @type {number}
   */
  @property({ type: Number })
  version = 1

  /**
   * The row number of the property row
   * @type {number}
   */
  @property({ type: Number, attribute: "row-number" })
  rowNumber = 1

  /**
   * The key of the property being edited
   * @type {string}
   */
  @property({ type: String })
  key = ""

  /**
   * The value of the property being edited
   * @type {string}
   */
  @property({ type: String })
  value = ""

  /**
   * The type of page being displayed (e.g., "view", "edit")
   * @type {string}
   */
  @property({ type: String, attribute: "page-type" })
  pageType = "view"

  /**
   * Indicates whether the row is empty and ready for new input
   * @type {boolean}
   */
  @property({ type: Boolean })
  empty = false

  /**
   * Indicates whether the row is in an editable state.
   * @type {boolean}
   */
  @state() editable = false

  override connectedCallback() {
    super.connectedCallback()
    if (this.pageType == "edit") {
      this.editable = true
      this.tempValue = this.value
    }
  }

  /**
   * Temporary value used while editing the property
   * @type {string}
   */
  @state() private tempValue = ""

  override render() {
    if (this.empty) {
      return html`
        <tr class="${this.rowNumber % 2 === 0 ? "even-row" : "odd-row"}">
          <td>
            <input
              type="text"
              placeholder=${msg("New key")}
              .value=${this.key}
              @input=${(e: Event) => (this.key = (e.target as HTMLInputElement).value)}
            />
          </td>
          <td>
            <input
              type="text"
              placeholder=${msg("New value")}
              .value=${this.value}
              @input=${(e: Event) => (this.value = (e.target as HTMLInputElement).value)}
            />
          </td>
          <td>
            <div class="button-group">
              <div class="button-container">
                <button @click=${this.addProperty} id="create-button">${msg("Submit")}</button>
              </div>
            </div>
          </td>
        </tr>
      `
    }

    return html`
      <tr class="${this.rowNumber % 2 === 0 ? "even-row" : "odd-row"}">
        <td>
          <a
            class="property-link"
            href="https://wiki.openfoodfacts.org/Folksonomy/Property/${this.key}"
            >${this.key}</a
          >
        </td>
        <td>
          ${this.editable
            ? html`<input type="text" .value=${this.tempValue} @input=${this.handleInputChange} />`
            : this.value}
        </td>
        <td>
          <div class="button-group">
            ${this.editable
              ? html`
                  <button class="actions save-button" @click=${this.handleSave}>
                    ${msg("Save")}
                  </button>
                  <button class="actions" @click=${this.handleCancel}>${msg("Cancel")}</button>
                `
              : html`<button class="actions" @click=${this.handleEdit}>${msg("Edit")}</button>`}
            <button class="actions delete-button" @click=${this.handleDelete}>
              ${msg("Delete")}
            </button>
          </div>
        </td>
      </tr>
    `
  }

  private handleEdit() {
    this.editable = true
    this.tempValue = this.value
  }

  private async handleSave() {
    try {
      const updatedProperty = await folksonomyApi.updateProductProperty(
        this.productId,
        this.key,
        this.tempValue,
        this.version
      )
      this.editable = false

      const updateEvent = new CustomEvent("update-row", {
        detail: {
          key: updatedProperty.key,
          value: updatedProperty.value,
          version: updatedProperty.version,
        },
        bubbles: true,
        composed: true,
      })
      this.dispatchEvent(updateEvent)
    } catch (error) {
      console.error("Failed to update property", error)
    }
  }

  private handleCancel() {
    this.editable = false
    this.tempValue = this.value
  }

  private async handleDelete() {
    const deleteModal = document.createElement("delete-modal")
    deleteModal.addEventListener("confirm-delete", async () => {
      try {
        await folksonomyApi.deleteProductProperty(this.productId, this.key, this.version)
        const deleteEvent = new CustomEvent("delete-row", {
          detail: { key: this.key },
          bubbles: true,
          composed: true,
        })
        this.dispatchEvent(deleteEvent)
      } catch (error) {
        console.error("Failed to delete property", error)
      } finally {
        deleteModal.remove()
      }
    })
    document.body.appendChild(deleteModal)
  }

  private async addProperty() {
    if (this.key && this.value) {
      try {
        const newProperty = await folksonomyApi.addProductProperty(
          this.productId,
          this.key,
          this.value,
          this.version
        )
        this.dispatchEvent(
          new CustomEvent("add-row", {
            detail: { key: newProperty.key, value: newProperty.value },
            bubbles: true,
            composed: true,
          })
        )
        this.key = ""
        this.value = ""
      } catch (error) {
        console.error("Failed to add property", error)
      }
    }
  }

  private handleInputChange(e: Event) {
    this.tempValue = (e.target as HTMLInputElement).value
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-editor-row": FolksonomyEditorRow
  }
}
