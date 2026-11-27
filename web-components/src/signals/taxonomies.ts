import type { NutrientTaxonomy } from "../types/taxonomies"
import { SignalMap } from "../utils/signals"
import taxonomies from "../api/taxonomies"
import { Computed } from "@lit-labs/signals"

/**
 * In-flight or completed request for the nutrients taxonomies.
 * Shared between callers so that only one request is made at a time,
 * and cleared on failure so that a later call can retry.
 */
let nutrientsTaxonomiesPromise: Promise<void> | undefined

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
 * Fetch the nutrients taxonomies and store them in the signal.
 * Concurrent calls share the same request and resolve once the taxonomies are stored.
 * If the request fails, the error is rethrown and the next call retries.
 */
export const fetchNutrientsTaxonomies = (): Promise<void> => {
  if (!nutrientsTaxonomiesPromise) {
    nutrientsTaxonomiesPromise = taxonomies
      .nutrientsTaxonomies()
      .then((response) => {
        Object.entries(response).forEach(([key, value]) => {
          const id = key.replace("zz:", "")
          nutrientTaxonomyById.setItem(id, { ...value, id })
        })
      })
      .catch((error) => {
        nutrientsTaxonomiesPromise = undefined
        throw error
      })
  }
  return nutrientsTaxonomiesPromise
}
