import { NutrientsTaxonomiesResponse } from "../types/taxonomies"

const BASE_API_URL = "https://static.openfoodfacts.org/data/taxonomies"

export default {
  async nutrientsTaxonomies() {
    const response = await fetch(`${BASE_API_URL}/nutrients.json`)
    return (await response.json()) as NutrientsTaxonomiesResponse
  },
}
