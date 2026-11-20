import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { msg, localized } from "@lit/localize"
import { openfoodfactsApiUrl } from "../../signals/openfoodfacts"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import "../icons/external-link"

/**
 * A button component that displays as a link with a link icon.
 * Takes a product-code property and generates the appropriate link.
 */
@localized()
@customElement("product-link-button")
export class ProductLinkButton extends LitElement {
  static override styles = [
    getButtonClasses([ButtonType.LINK]),
    css`
      :host {
        display: inline-block;
      }
      a.button.with-icon {
        display: inline-flex;
        color: inherit;
        text-decoration: none;
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
      <a
        class="link-button button with-icon small"
        href="${this.productUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <external-link-icon aria-hidden="true"></external-link-icon>
        <span>${msg("View Product")}</span>
      </a>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "product-link-button": ProductLinkButton
  }
}
