import { LitElement } from "lit"
import type { Constructor } from "."
import { property } from "lit/decorators.js"
import { countryCode } from "../signals/app"

/**
 * Interface for the CountryCodeMixin.
 */
export interface CountryCodeMixinInterface {
  countryCode?: string
  _countryCode: string
}

/**
 * A mixin that provides country code functionality to components.
 * It includes a countryCode property and a getter for the country code.
 * @mixin CountryCodesMixin
 */
export const CountryCodeMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<CountryCodeMixinInterface> & T => {
  class CountryCodeMixin extends superClass {
    /**
     * The country code for the component.
     * @type {string | undefined}
     */
    @property({ type: String, attribute: "country-codes", reflect: true })
    countryCode?: string

    /**
     * Gets the country code, defaulting to the current locale if not set.
     * @returns {string} The country code.
     */
    get _countryCode() {
      return this.countryCode || countryCode.get()
    }
  }

  return CountryCodeMixin as Constructor<CountryCodeMixinInterface> & T
}
