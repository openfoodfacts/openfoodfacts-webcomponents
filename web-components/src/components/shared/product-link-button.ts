import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { msg } from "@lit/localize"
import { openfoodfactsApiUrl } from "../../signals/openfoodfacts"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import "../icons/external-link"

/**
 * A button component that displays as a link with a link icon.
 * Takes a product-code property and generates the appropriate link.
 */
@customElement("product-link-button")
export class ProductLinkButton extends LitElement {
  static override styles = [
    getButtonClasses([ButtonType.LINK]),
    css`
      :host {
        display: inline-block;
      }
    `,
  ]

  /**
   * The product code to link to
   */
  @property({ type: String, attribute: "product-code", reflect: true })
  productCode: string | undefined

  get productUrl() {
    return `${openfoodfactsApiUrl.get()}/product/${this.productCode}`
  }

  override render() {
    if (!this.productCode) {
      console.error("Product code is required")
      return nothing
    }

    return html`
      <a href="${this.productUrl}" target="_blank" rel="noopener noreferrer">
        <button class="link-button button with-icon small">
          <external-link-icon></external-link-icon>
          <span>${msg("View Product")}</span>
        </button>
      </a>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "product-link-button": ProductLinkButton
  }
}
