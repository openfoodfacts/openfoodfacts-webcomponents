import { msg } from "@lit/localize"
import { LitElement, html } from "lit-element"
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

  static override styles = [MODAL, ...getButtonClasses([ButtonType.Danger, ButtonType.Chocolate])]

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
      <div class="modal">
        <h2>Confirm Delete</h2>
        <p>${msg("Are you sure you want to delete this item?")}</p>
        <div class="modal-buttons">
          <button type="button" class="button chocolate-button" @click="${this.handleCancel}">
            ${msg("Cancel")}
          </button>
          <button class="button danger-button" @click="${this.handleDelete}">
            ${msg("Delete")}
          </button>
        </div>
      </div>
    `
  }
}
