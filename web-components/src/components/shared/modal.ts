import { LitElement, html, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { MODAL } from "../../styles/modal"
import "./loader"

@customElement("modal-component")
class ModalComponent extends LitElement {
  static override styles = [MODAL]

  @property({
    type: Boolean,
    reflect: true,
    attribute: "is-open",
  })
  isOpen = false

  @property({ type: Boolean, attribute: "is-loading" })
  isLoading = false

  override render() {
    if (!this.isOpen) {
      return nothing
    }
    return html`
      <div class="modal">
        ${this.isLoading ? html`<off-wc-loader></off-wc-loader>` : nothing}
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
