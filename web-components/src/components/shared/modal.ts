import { LitElement, html, nothing, type PropertyValues } from "lit"
import { customElement, property, query } from "lit/decorators.js"
import { MODAL } from "../../styles/modal"
import "./loader"
import { EventType } from "../../constants"
import "../icons/cross"
import { localized, msg } from "@lit/localize"

/**
 * The `modal-component` is a reusable web component that displays a modal dialog.
 * It can be used to show content in a modal overlay, with options for loading states and close functionality.
 *
 * @fires close - Dispatched when the modal is closed.
 *
 * @slot - The default slot for the modal content.
 *
 * @example
 * ```html
 * <modal-component is-open="true" is-loading="false">
 *   <p>This is the content of the modal.</p>
 * </modal-component>
 * ```
 */

@customElement("modal-component")
@localized()
class ModalComponent extends LitElement {
  static override styles = [MODAL]

  @query(".close-icon")
  private closeButton?: HTMLButtonElement

  private opener?: HTMLElement

  /**
   * Indicates whether the modal is open.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: "is-open",
  })
  isOpen = false

  /**
   * Indicates whether the modal is in a loading state.
   */
  @property({ type: Boolean, attribute: "is-loading" })
  isLoading = false

  /**
   * Closes the modal and dispatches a close event.
   */
  closeModal() {
    this.dispatchEvent(new CustomEvent(EventType.CLOSE))
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault()
      this.closeModal()
    }
  }

  override willUpdate(changedProperties: PropertyValues) {
    if (
      changedProperties.has("isOpen") &&
      this.isOpen &&
      document.activeElement instanceof HTMLElement
    ) {
      this.opener = document.activeElement
    }
  }

  override updated(changedProperties: PropertyValues) {
    if (!changedProperties.has("isOpen")) {
      return
    }
    if (this.isOpen) {
      this.closeButton?.focus()
    } else if (this.opener?.isConnected) {
      this.opener.focus()
      this.opener = undefined
    }
  }

  override render() {
    if (!this.isOpen) {
      return nothing
    }
    return html`
      <div class="overlay" @click="${this.closeModal}" aria-hidden="true"></div>
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-label=${msg("Contribution dialog")}
        aria-busy=${this.isLoading}
        @keydown=${this.onKeydown}
      >
        <div class="modal-content">
          <div class="modal-header">
            <button
              type="button"
              class="close-icon"
              @click="${this.closeModal}"
              aria-label=${msg("Close modal")}
            >
              <cross-icon></cross-icon>
            </button>
          </div>
          <div class="modal-body">
            ${this.isLoading ? html`<off-wc-loader></off-wc-loader>` : html`<slot></slot>`}
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "modal-component": ModalComponent
  }
}
