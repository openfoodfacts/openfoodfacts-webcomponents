import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { msg } from "@lit/localize"
import { openfoodfactsApiUrl } from "../../signals/openfoodfacts"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import "../icons/external-link"
import { darkModeListener } from "../../utils/dark-mode-listener"
import { classMap } from "lit/directives/class-map.js"

/**
 * A button component that displays as a link with a link icon.
 * Takes a product-code property and generates the appropriate link.
 */
@customElement("product-link-button")
export class ProductLinkButton extends LitElement {
  isDarkMode = darkModeListener.darkMode

  private _darkModeCb = (isDark: boolean) => {
    this.isDarkMode = isDark
    this.requestUpdate()
  }

  override connectedCallback() {
    super.connectedCallback()
    darkModeListener.subscribe(this._darkModeCb)
  }

  override disconnectedCallback() {
    darkModeListener.unsubscribe(this._darkModeCb)
    super.disconnectedCallback()
  }
  static override styles = [
    getButtonClasses([ButtonType.LINK]),
    css`
      :host {
        display: inline-block;
      }
      .dark-mode {
        color: #f9f7f5;
      }

      .dark-mode h2,
      .dark-mode p,
      .dark-mode button {
        color: #f9f7f5;
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
    const rootClasses = { "dark-mode": this.isDarkMode }
    return html`
      <section class=${classMap(rootClasses)}>
        <a href="${this.productUrl}" target="_blank" rel="noopener noreferrer">
          <button class="link-button button with-icon small">
            <external-link-icon></external-link-icon>
            <span>${msg("View Product")}</span>
          </button>
        </a>
      </section>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "product-link-button": ProductLinkButton
  }
}
