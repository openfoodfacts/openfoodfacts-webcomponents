import { LitElement } from "lit"
import { Constructor } from "."
import { property } from "lit/decorators.js"
import { languageCode } from "../signals/app"

/**
 * Interface for the LanguageCodesMixin.
 */
export interface LanguageCodesMixinInterface {
  languageCodes?: string[]
  _languageCodes: string[]
}

/**
 * A mixin that provides language code functionality to components.
 * It includes a languageCodes property and a getter for the language codes.
 * @mixin LanguageCodesMixin
 */
export const LanguageCodesMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<LanguageCodesMixinInterface> & T => {
  class LanguageCodesMixin extends superClass {
    /**
     * The language codes for the component.
     * @type {string[] | undefined}
     */
    @property({ type: Array, attribute: "language-codes", reflect: true })
    languageCodes?: string[]

    /**
     * Gets the language codes, defaulting to the current locale if not set.
     * @returns {string[]} The language codes.
     */
    get _languageCodes() {
      return this.languageCodes || [languageCode.get()]
    }
  }

  return LanguageCodesMixin as Constructor<LanguageCodesMixinInterface> & T
}
