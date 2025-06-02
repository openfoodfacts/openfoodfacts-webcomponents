import { LitElement } from "lit"
import { Constructor } from "."
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
 * It includes a countryCode property and a getter for the country codes.
 * @mixin CountryCodesMixin
 */
export const CountryCodeMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<CountryCodeMixinInterface> & T => {
  class CountryCodeMixin extends superClass {
    /**
     * The country codes for the component.
     * @type {string[] | undefined}
     */
    @property({ type: Array, attribute: "country-codes", reflect: true })
    countryCode?: string

    /**
     * Gets the country codes, defaulting to the current locale if not set.
     * @returns {string[]} The country codes.
     */
    get _countryCode() {
      return this.countryCode || countryCode.get()
    }
  }

  return CountryCodeMixin as Constructor<CountryCodeMixinInterface> & T
}
