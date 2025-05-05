import { LitElement, html, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { MODAL } from "../../styles/modal"

@customElement("modal-component")
class ModalComponent extends LitElement {
  static override styles = [MODAL]

  @property({
    type: Boolean,
    reflect: true,
    attribute: "is-open",
  })
  isOpen = false

  override render() {
    if (!this.isOpen) {
      return nothing
    }
    return html`
      <div class="modal">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "modal-component": ModalComponent
  }
}
