import { configureLocalization } from "@lit/localize"
import { sourceLocale, targetLocales } from "./dist/locale-codes"
import { languageCode } from "../signals/app"

/**
 * Configure the localization, it will load the locale files and set the source and target locales
 */
export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale: string) => import("./dist/locales/" + locale + ".ts"),
})

export const setLanguageCode = (newLanguageCode: string) => {
  if (!targetLocales.includes(newLanguageCode as any)) {
    throw new Error(`Invalid language code: ${newLanguageCode}`)
  }
  // Set the language code (en, fr, ..)
  setLocale(newLanguageCode)
  languageCode.set(newLanguageCode)
}
