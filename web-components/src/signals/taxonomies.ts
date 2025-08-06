import { NutrientTaxonomy } from "../types/taxonomies"
import { SignalMap } from "../utils/signals"
import { LoadingState } from "../constants"
import taxonomies from "../api/taxonomies"
import { Computed } from "@lit-labs/signals"

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
export const nutrientTaxonomyById = new SignalMap<NutrientTaxonomy>({})

/**
 * Nutrient taxonomies
 */
export const nutrientTaxonomies = new Computed(() => {
  const nutrientTaxonomyObj = nutrientTaxonomyById.get()
  return Object.values(nutrientTaxonomyObj)
})

/**
 * Load the taxonomies if they are not already loaded.
 * @returns
 */
export const getTaxonomyNameByLang = (taxonomy: NutrientTaxonomy, lang: string) => {
  if (!taxonomy) {
    return ""
  }
  if (lang in taxonomy.name && taxonomy.name[lang]) {
    return taxonomy.name[lang]
  }
  return taxonomy.name["en"] || ""
}

/**
 * Get the name of a taxonomy by its id and lang.
 * If the lang is not available, it returns the english name.
 * If the id is not available, it returns an empty string.
 */
export const getTaxonomyNameByIdAndLang = (id: string, lang: string) => {
  const taxonomy = nutrientTaxonomyById.getItem(id)
  return getTaxonomyNameByLang(taxonomy, lang)
}

/**
 * Get the unit of a taxonomy by its id.
 * If the id is not available, it returns undefined.
 */
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
    const id = key.replace("zz:", "")
    nutrientTaxonomyById.setItem(id, { ...value, id })
  })
  isLoading.setItem("nutrients", LoadingState.LOADED)
}
