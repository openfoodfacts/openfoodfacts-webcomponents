import type { NutrientTaxonomy } from "../types/taxonomies"
import { SignalMap } from "../utils/signals"
import { LoadingState } from "../constants"
import taxonomies from "../api/taxonomies"
import { Computed } from "@lit-labs/signals"

/**
 * Unit used to express a nutrient as a percentage of its daily value.
 */
export const DAILY_VALUE_UNIT = "% DV"

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
export const getTaxonomyNameByLang = (node: NutrientTaxonomy, lang: string) => {
  if (!node) {
    console.warn("getTaxonomyNameByLang called with undefined taxonomy", { taxonomy: node })
    return ""
  }

  return (
    node.name[lang] ||
    node.name["en"] ||
    node.name["xx"] ||
    (console.warn("No name found for taxonomy", { taxonomy: node, lang }), "")
  )
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
  return taxonomy?.unit?.en
}

/**
 * Get all the units allowed by the taxonomy of a nutrient:
 * its default unit, its country specific units (e.g. unit_ca) and "% DV" if it has a daily value.
 * If the id is not available, it returns an empty array.
 */
export const getTaxonomyUnitsById = (id: string): string[] => {
  const taxonomy = nutrientTaxonomyById.getItem(id)
  if (!taxonomy) {
    return []
  }
  const units = [taxonomy.unit?.en]
  Object.entries(taxonomy).forEach(([key, value]) => {
    if (key.startsWith("unit_")) {
      units.push((value as NutrientTaxonomy[`unit_${string}`])?.en)
    }
  })
  if (taxonomy.dv_value || taxonomy.dv_2016_value) {
    units.push(DAILY_VALUE_UNIT)
  }
  return [...new Set(units.filter((unit): unit is string => !!unit))]
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
