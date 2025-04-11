import { msg } from "@lit/localize"
import { LitElement, html, css } from "lit-element"
import { customElement, state } from "lit/decorators.js"

/**
 * @customElement("delete-modal")
 * @lit
 * @element delete-modal
 * @description A modal dialog for confirming deletion of an item.
 */
@customElement("delete-modal")
export class DeleteModal extends LitElement {
  @state() open = true

  static override styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }
    modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      z-index: 1000;
      width: 90%;
      max-width: 300px;
      animation: fadeIn 0.3s ease-in-out;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999;
      animation: fadeIn 0.3s ease-in-out;
    }
    button {
      padding: 0.8rem;
      background-color: #d9534f;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    button:hover {
      background-color: #c9302c;
    }
    button.cancel {
      background-color: #ccc;
      color: #333;
    }
    button.cancel:hover {
      background-color: #bbb;
    }
    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
      text-align: center;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `

  private handleDelete(event: Event) {
    event.preventDefault()
    this.dispatchEvent(
      new CustomEvent("confirm-delete", {
        bubbles: true,
        composed: true,
      })
    )
    this.open = false
  }

  private handleCancel(event: Event) {
    event.preventDefault()
    this.open = false
  }

  override render() {
    if (!this.open) {
      return null
    }

    return html`
      <div class="overlay" @click="${this.handleCancel}"></div>
      <modal>
        <h2>Confirm Delete</h2>
        <p>${msg("Are you sure you want to delete this item?")}</p>
        <div style="display: flex; justify-content: space-between;">
          <button @click="${this.handleDelete}">${msg("Delete")}</button>
          <button type="button" class="cancel" @click="${this.handleCancel}">
            ${msg("Cancel")}
          </button>
        </div>
      </modal>
    `
  }
}
