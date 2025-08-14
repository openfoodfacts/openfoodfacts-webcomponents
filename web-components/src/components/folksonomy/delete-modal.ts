import { msg } from "@lit/localize"
import { LitElement, html, css } from "lit-element"
import { customElement, state } from "lit/decorators.js"
import { getButtonClasses, ButtonType } from "../../styles/buttons"
import { MODAL } from "../../styles/modal"

/**
 * @customElement("delete-modal")
 * @lit
 * @element delete-modal
 * @description A modal dialog for confirming deletion of an item.
 */
@customElement("delete-modal")
export class DeleteModal extends LitElement {
  @state() open = true

  static override styles = [
    MODAL,
    ...getButtonClasses([ButtonType.Danger, ButtonType.Chocolate]),
    css`
      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        padding: 24px;
        min-width: 400px;
        max-width: 500px;
        box-shadow:
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
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
          transform: translate(-50%, -50%) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      .modal-title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 24px 0;
        text-align: center;
        margin-bottom: 12px;
      }

      .modal-content {
        margin-bottom: 12px;
      }

      .modal-message {
        font-size: 16px;
        color: #6b7280;
        line-height: 1.5;
        margin: 0;
      }

      .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 90px;
      }

      .button:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .chocolate-button {
        background: #341100;
        border: 1px solid #341100;
        color: white;
      }

      .danger-button {
        border: 1px solid #ff5252;
        background: #ff5252;
        color: white;
      }

      @media (max-width: 480px) {
        .modal {
          min-width: 320px;
          margin: 16px;
          padding: 24px;
        }

        .modal-buttons {
          flex-direction: column-reverse;
        }

        .button {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ]

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

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.handleCancel(event)
    }
  }

  override connectedCallback() {
    super.connectedCallback()
    document.addEventListener("keydown", this.handleKeyDown.bind(this))
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener("keydown", this.handleKeyDown.bind(this))
  }

  override render() {
    if (!this.open) {
      return null
    }

    return html`
      <div class="overlay" @click="${this.handleCancel}"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" class="modal-title">${msg("Confirm Delete")}</h2>
        <div class="modal-content">
          <p class="modal-message">
            ${msg("Are you sure you want to delete this item? This action cannot be undone.")}
          </p>
        </div>
        <div class="modal-buttons">
          <button
            type="button"
            class="button chocolate-button"
            @click="${this.handleCancel}"
            aria-label="${msg("Cancel deletion")}"
          >
            ${msg("Cancel")}
          </button>
          <button
            class="button danger-button"
            @click="${this.handleDelete}"
            aria-label="${msg("Confirm deletion")}"
          >
            ${msg("Delete")}
          </button>
        </div>
      </div>
    `
  }
}
