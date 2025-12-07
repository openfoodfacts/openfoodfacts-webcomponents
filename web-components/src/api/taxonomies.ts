import OpenFoodFacts from "@openfoodfacts/openfoodfacts-nodejs"

/**
 * Taxonomies API
 */
export default {
  /**
   * Get the nutrients taxonomies
   */
  async nutrientsTaxonomies() {
    const openFoodFacts = new OpenFoodFacts(fetch)
    return await openFoodFacts.getNutrients()
  },
}
