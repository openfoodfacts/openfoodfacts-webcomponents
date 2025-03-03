import { NutrientsTaxonomiesResponse } from "../types/taxonomies"

const BASE_API_URL = "https://static.openfoodfacts.org/data/taxonomies"

/**
 * Taxonomies API
 */
export default {
  /**
   * Get the nutrients taxonomies
   * @returns {Promise<NutrientsTaxonomiesResponse>}
   */
  async nutrientsTaxonomies() {
    const response = await fetch(`${BASE_API_URL}/nutrients.json`)
    return (await response.json()) as NutrientsTaxonomiesResponse
  },
}
