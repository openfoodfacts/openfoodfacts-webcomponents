import { configureLocalization } from "@lit/localize"
import { sourceLocale, targetLocales } from "./dist/locale-codes"
import { languageCode } from "../signals/app"

/**
 * Configure the localization, it will load the locale files and set the source and target locales
 */
export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale: string) => import(`./dist/locales/${locale}.ts`),
})

export const setLanguageCode = (newLanguageCode: string) => {
  if (!(targetLocales as readonly string[]).includes(newLanguageCode)) {
    // Open Food Facts can support a language before a UI translation bundle is available.
    // Keep that code for component data, but render the interface in the source locale.
    languageCode.set(newLanguageCode)
    return setLocale(sourceLocale)
  }
  // Set the language code (en, fr, ..)
  languageCode.set(newLanguageCode)
  return setLocale(newLanguageCode)
}
