import { signal } from "@lit-labs/signals"
import { SignalMap } from "../utils/signals"
import { fetchNutrientsOrder } from "../api/openfoodfacts"
import type { NutrientOrderRequest } from "../types/openfoodfacts"

export type NutrientsOrder = Record<string, { index: number; displayInEditForm: boolean }>
export const DEFAULT_OPENFOODFACTS_API_URL = "https://world.openfoodfacts.org"

/**
 * Store the loading state of the taxonomies to avoid multiple requests.
 */
const nutrientsOrderPromises = new SignalMap<Promise<any>>({})

// this enable changing open food facts URL globally
export const openfoodfactsApiUrl = signal(DEFAULT_OPENFOODFACTS_API_URL)

/**
 * Nutrients order by country code
 */
export const nutrientsOrderByCountryCode = new SignalMap<NutrientsOrder>({})

/**
 * Insert nutrient at index in NutrientsOrder if it's not already there
 *
 * @return {number} the next index
 */
const setOrderOfNutrient = (
  obj: NutrientsOrder,
  index: number,
  nutrient: NutrientOrderRequest
): number => {
  if (obj.hasOwnProperty(nutrient.id)) {
    return index
  }
  // set the order of the nutrient (the index
  obj[nutrient.id] = {
    index,
    displayInEditForm: nutrient.display_in_edit_form,
  }
  index++
  // if the nutrient has sub nutrients, set their order too recursively
  if (nutrient.nutrients) {
    for (const subNutrient of nutrient.nutrients) {
      index = setOrderOfNutrient(obj, index, subNutrient)
    }
  }
  return index
}

/**
 * Use Open Food Facts API to build an index of nutrients in the right order
 */
export const fetchNutrientsOrderByCountryCode = async (countryCode: string) => {
  // check if the nutrients order is already in the cache
  const nutrientsOrderPromise = nutrientsOrderPromises.getItem(countryCode)
  if (nutrientsOrderPromise) {
    // wait for the nutrients order to be loaded
    await nutrientsOrderPromise
    return
  }
  const request = fetchNutrientsOrder({ cc: countryCode })
  let index = 0
  nutrientsOrderPromises.setItem(countryCode, request)
  const data = await request

  const value: NutrientsOrder = {}
  data.nutrients.forEach((nutrient) => {
    index = setOrderOfNutrient(value, index, nutrient)
  })
  nutrientsOrderByCountryCode.setItem(countryCode, value)
  return value
}

export const sortKeysByNutrientsOrder = (countryCode: string, keys: string[]) => {
  const nutrientsOrder = nutrientsOrderByCountryCode.getItem(countryCode)
  if (!nutrientsOrder) {
    return keys
  }
  // sort the keys based on the nutrients order, lower index first
  return keys.sort((a, b) => {
    const aIndex = nutrientsOrder[a]?.index ?? Infinity
    const bIndex = nutrientsOrder[b]?.index ?? Infinity
    return aIndex - bIndex
  })
}
