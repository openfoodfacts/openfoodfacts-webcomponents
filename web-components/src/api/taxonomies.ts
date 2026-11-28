import OpenFoodFacts from "@openfoodfacts/openfoodfacts-nodejs"

/**
 * Taxonomies API
 */
export type PackagingTaxonomy = "packaging_shapes" | "packaging_materials"

export interface PackagingSuggestionsOptions {
  taxonomy: PackagingTaxonomy
  text: string
  language: string
  country: string
  apiUrl: string
}

export async function fetchPackagingSuggestions({
  taxonomy,
  text,
  language,
  country,
  apiUrl,
}: PackagingSuggestionsOptions): Promise<string[]> {
  const openFoodFacts = new OpenFoodFacts(fetch, { host: apiUrl })

  const { data, response, error } = await openFoodFacts.apiv3.getTaxonomySuggestions({
    tagtype: taxonomy,
    string: text,
    lc: language,
    cc: country,
    limit: "50",
  })

  if (!response.ok || error) {
    throw new Error(`Could not load packaging suggestions (HTTP ${response.status})`)
  }

  if (
    !data ||
    data.status === "failure" ||
    data.status === "success_with_errors" ||
    !Array.isArray(data.suggestions) ||
    !data.suggestions.every((suggestion) => typeof suggestion === "string")
  ) {
    throw new Error("Invalid packaging suggestions response")
  }

  return data.suggestions
}
export default {
  /**
   * Get the nutrients taxonomies
   */
  async nutrientsTaxonomies() {
    const openFoodFacts = new OpenFoodFacts(fetch)
    return await openFoodFacts.getNutrients()
  },
}
