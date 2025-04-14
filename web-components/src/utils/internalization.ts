import { getLocale } from "../localization"

/**
 *
 * @param quantity number of items
 * @param translations object with singular and plural translations
 * @param languageCode language code to use for the translation
 * @returns the translation for the given quantity and language code
 * @example
 * getTranslationsByQuantity(1, { singular: "item", plural: "items" }, "en") // returns "item"
 */
export const getTranslationsByQuantity = (
  quantity: number,
  translations: { singular: string; plural: string },
  languageCode?: string
) => {
  if (!languageCode) {
    languageCode = getLocale()
  }
  if (quantity === 1) {
    return translations.singular
  }
  if (languageCode === "fr" && !quantity) {
    return translations.singular
  }
  return translations.plural
}
