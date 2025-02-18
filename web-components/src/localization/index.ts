import { configureLocalization } from "@lit/localize"
import { sourceLocale, targetLocales } from "./generated/locale-codes"
import { delay } from "../utils"

/**
 * Get the browser locale, it will keep only the language part
 */
export const getBrowserLocale = () => {
  return (navigator.language || navigator.languages[0]).split("-")[0]
}
/**
 * Configure the localization, it will load the locale files and set the source and target locales
 */
export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale: string) => import(`./localization/locales/${locale}.js`),
})

// Wait for the locale to be set
export let isLocaleSet = false

/**
 * Get the locale and delay if it is not set yet
 */
export const getLocaleAfterInit = async (): Promise<string> => {
  // Delay to wait for the locale to be set
  if (!isLocaleSet) {
    await delay(100)
  }
  return getLocale()
}
;(async () => {
  try {
    // Defer first render until our initial locale is ready, to avoid a flash of
    // the wrong locale.
    // It sets the locale to the browser locale
    await setLocale(getBrowserLocale())
    isLocaleSet = true
  } catch (e) {
    // Either the URL locale code was invalid, or there was a problem loading
    // the locale module.
    console.error(`Error loading locale: ${(e as Error).message}`)
  }
})()
