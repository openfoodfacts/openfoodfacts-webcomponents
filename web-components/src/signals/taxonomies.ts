import { NutrientTaxonomy } from "../types/taxonomies"
import { SignalMap } from "../utils/signals"
import { LoadingState } from "../constants"
import taxonomies from "../api/taxonomies"

/**
 * Store the loading state of the taxonomies to avoid multiple requests.
 */
const isLoading = new SignalMap<LoadingState>({
  nutrients: LoadingState.NOT_LOADED,
})

/**
 * Store the taxonomies by id.
 *
 */
const nutrientTaxonomyById = new SignalMap<NutrientTaxonomy>({})

/**
 * Get the name of a taxonomy by its id and lang.
 * If the lang is not available, it returns the english name.
 * If the id is not available, it returns an empty string.
 */
export const getTaxonomyNameByIdAndLang = (id: string, lang: string) => {
  const taxonomy = nutrientTaxonomyById.getItem(id)
  if (!taxonomy) {
    return ""
  }
  if (lang in taxonomy.name) {
    return taxonomy.name[lang]
  }
  return taxonomy.name["en"]
}

export const getTaxonomyUnitById = (id: string): string | undefined => {
  const taxonomy = nutrientTaxonomyById.getItem(id)
  if (!taxonomy) {
    return
  }
  return taxonomy.unit.en
}

/**
 * Fetch the nutrients taxonomies and store them in the signal.
k
 */
export const fetchNutrientsTaxonomies = async () => {
  if (isLoading.getItem("nutrients") != LoadingState.NOT_LOADED) {
    return
  }
  isLoading.setItem("nutrients", LoadingState.LOADING)
  const response = await taxonomies.nutrientsTaxonomies()

  Object.entries(response).forEach(([key, value]) => {
    nutrientTaxonomyById.setItem(key.replace("zz:", ""), value)
  })
  isLoading.setItem("nutrients", LoadingState.LOADED)
}
