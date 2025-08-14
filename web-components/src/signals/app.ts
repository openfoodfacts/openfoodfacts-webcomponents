import { signal } from "@lit-labs/signals"
import {
  DEFAULT_ASSETS_IMAGES_PATH,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_LANGUAGE_CODE,
} from "../constants"

export const assetsImagesPath = signal(DEFAULT_ASSETS_IMAGES_PATH)

export const getImageUrl = (fileName: string) => {
  return `${assetsImagesPath.get()}/${fileName}`
}

export const countryCode = signal(DEFAULT_COUNTRY_CODE)

/**
 * The language code of the app.
 * We add it instead of using getLocale because it is not reactive and it have a delay.
 * The delay can create double task fetch with the old and the new language code.
 */
export const languageCode = signal(DEFAULT_LANGUAGE_CODE)
