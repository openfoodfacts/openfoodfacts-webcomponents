import { getLocale } from "../localization"

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
