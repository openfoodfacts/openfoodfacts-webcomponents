import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "./delete-modal"
import folksonomyApi from "../../api/folksonomy"

/**
 * AddProperty Component
 * @element folksonomy-editor-row
 * Allows users to input a new property and value.
 */
// <folksonomy-editor-row page-type=”view” k=”has_funny_barcode” v=”yes” empty />
@customElement("folksonomy-editor-row")
export class AddProperty extends LitElement {
  static override styles = css`
    :host {
      font-family: Arial, sans-serif;
      font-size: 0.9rem;
      color: #333;
      display: block;
      width: 100%;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .input-group input:nth-child(1) {
      width: 30%;
    }

    .input-group input:nth-child(2) {
      width: 30%;
    }

    .button-container {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      width: 40%;
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

    .create-button {
      width: 10rem;
      margin-left: 1rem;
    }

    :host {
      display: contents;
      font-family: Arial, sans-serif;
      font-size: 0.9rem;
      color: #333;
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

    td:nth-child(1) {
      width: 30%;
    }

    td:nth-child(2) {
      width: 30%;
    }

    td:nth-child(3) {
      width: 40%;
    }

    input[type="text"] {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 20px;
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
        <div class="input-group">
          <input
            type="text"
            placeholder="New key"
            .value=${this.key}
            @input=${(e: Event) => (this.key = (e.target as HTMLInputElement).value)}
          />
          <input
            type="text"
            placeholder="New value"
            .value=${this.value}
            @input=${(e: Event) => (this.value = (e.target as HTMLInputElement).value)}
          />
          <div class="button-container">
            <button @click=${this.addProperty} class="create-button">Submit</button>
          </div>
        </div>
      `
    }

    return html`
      <tr>
        <td>${this.key}</td>
        <td>
          ${this.editable
            ? html`<input type="text" .value=${this.tempValue} @input=${this.handleInputChange} />`
            : this.value}
        </td>
        <td>
          <div class="button-group">
            ${this.editable
              ? html`
                  <button class="actions save-button" @click=${this.handleSave}>Save</button>
                  <button class="actions" @click=${this.handleCancel}>Cancel</button>
                `
              : html`<button class="actions" @click=${this.handleEdit}>Edit</button>`}
            <button class="actions delete-button" @click=${this.handleDelete}>Delete</button>
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
    "folksonomy-editor-row": AddProperty
  }
}
