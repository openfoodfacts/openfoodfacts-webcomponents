import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"

/**
 * Data Row
 * @element data-row
 * Displays a row of data with editable functionality.
 */
@customElement("data-row")
export class DataRow extends LitElement {
  static override styles = css`
    :host {
      display: contents;
      font-family: Arial, sans-serif;
      font-size: 0.9rem;
      color: #333;
    }

    table {
      width: 100%;
      table-layout: fixed; /* Ensure fixed column widths */
    }

    td {
      padding: 0.8rem;
      text-align: left;
      vertical-align: middle;
      border: none; /* Remove borders */
      overflow: hidden; /* Prevent content overflow */
      text-overflow: ellipsis; /* Add ellipsis for overflowed text */
      white-space: nowrap; /* Prevent text wrapping */
    }

    td:nth-child(1) {
      width: 30%; /* Key column */
    }

    td:nth-child(2) {
      width: 30%; /* Value column */
    }

    td:nth-child(3) {
      width: 40%; /* Actions column */
    }

    input[type="text"] {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 20px; /* Rounded corners */
      box-sizing: border-box;
      font-size: 0.9rem;
      height: 2.5rem; /* Match height with other components */
      background-color: #f9f9f9; /* Light background */
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
    }

    .actions {
      color: white;
      background-color: #341100; /* Updated background color */
      border: none;
      border-radius: 20px; /* Rounded corners */
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 0.9rem;
      text-align: center;
    }

    .actions:hover {
      background-color: #5a2a00; /* Slightly darker shade */
    }

    .save-button {
      background-color: #341100; /* Updated background color */
    }

    .save-button:hover {
      background-color: #5a2a00; /* Slightly darker shade */
    }

    .delete-button {
      background-color: #341100; /* Updated background color */
    }

    .delete-button:hover {
      background-color: #5a2a00; /* Slightly darker shade */
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: center; /* Center align buttons */
    }
  `

  @property({ type: String }) key = ""
  @property({ type: String }) value = ""

  @state() private editing = false
  @state() private tempValue = ""

  private handleEdit() {
    this.editing = true
    this.tempValue = this.value
  }

  private handleSave() {
    this.value = this.tempValue
    this.editing = false
  }

  private handleCancel() {
    this.editing = false
  }

  private handleInputChange(e: Event) {
    this.tempValue = (e.target as HTMLInputElement).value
  }

  private handleDelete() {
    const deleteEvent = new CustomEvent("delete-row", {
      detail: { key: this.key },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(deleteEvent)
  }

  override render() {
    return html`
      <tr>
        <td>${this.key}</td>
        <td>
          ${this.editing
            ? html`<input type="text" .value=${this.tempValue} @input=${this.handleInputChange} />`
            : this.value}
        </td>
        <td>
          <div class="button-group">
            ${this.editing
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
}

declare global {
  interface HTMLElementTagNameMap {
    "data-row": DataRow
  }
}
