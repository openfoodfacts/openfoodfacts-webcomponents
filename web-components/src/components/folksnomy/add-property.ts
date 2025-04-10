import { LitElement, html, css } from "lit"
import { customElement, state } from "lit/decorators.js"

/**
 * AddProperty Component
 * @element add-property
 * Allows users to input a new property and value.
 */
@customElement("add-property")
export class AddProperty extends LitElement {
  static override styles = css`
    :host {
      font-family: Arial, sans-serif;
      font-size: 0.9rem;
      color: #333;
      display: block;
      width: 100%; /* Match table width */
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .input-group input:nth-child(1) {
      width: 30%; /* Match Property column width */
    }

    .input-group input:nth-child(2) {
      width: 30%; /* Match Value column width */
    }

    .button-container {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: center; /* Center align buttons */
      width: 40%; /* Match Actions column width */
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 20px; /* Rounded corners */
      font-size: 0.9rem;
      height: 1.8rem; /* Match height with table rows */
    }

    input:focus {
      outline: none;
    }

    button {
      padding: 0.5rem 1rem;
      background-color: #341100; /* Updated background color */
      color: white;
      border: none;
      border-radius: 20px; /* Rounded corners */
      cursor: pointer;
      font-size: 0.9rem;
      height: 2.5rem; /* Match height with input fields */
      width: 100%; /* Full width */
    }

    button:hover {
      background-color: #5a2a00; /* Slightly darker shade */
    }

    .create-button {
      width: auto;
    }
  `

  @state() private key = ""
  @state() private value = ""

  override render() {
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
          <button @click=${this.addProperty} class="create-button">Create</button>
        </div>
      </div>
    `
  }

  private addProperty() {
    if (this.key && this.value) {
      this.dispatchEvent(
        new CustomEvent("add-property", {
          detail: { key: this.key, value: this.value },
          bubbles: true,
          composed: true,
        })
      )
      this.key = ""
      this.value = ""
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "add-property": AddProperty
  }
}
