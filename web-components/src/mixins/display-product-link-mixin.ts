import { html, LitElement, nothing, type TemplateResult } from "lit"
import type { Constructor } from "."
import { property } from "lit/decorators.js"
import "../components/shared/product-link-button"

/**
 * Interface for the DisplayProductLinkMixin.
 */
export interface DisplayProductLinkMixinInterface {
  displayProductLink?: boolean

  renderProductLink(productCode: string): TemplateResult | typeof nothing
}

/**
 * A mixin that provides display product link functionality to components.
 * It includes a displayProductLink property and a getter for the display product link value.
 * @mixin DisplayProductLinkMixin
 */
export const DisplayProductLinkMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<DisplayProductLinkMixinInterface> & T => {
  class DisplayProductLinkMixin extends superClass {
    /**
     * Whether to display the product link.
     * @type {boolean | undefined}
     */
    @property({ type: Boolean, attribute: "display-product-link", reflect: true })
    displayProductLink: boolean = false

    renderProductLink(productCode: string) {
      if (!this.displayProductLink) {
        return nothing
      }
      return html`<product-link-button product-code="${productCode}"></product-link-button>`
    }
  }

  return DisplayProductLinkMixin as Constructor<DisplayProductLinkMixinInterface> & T
}
