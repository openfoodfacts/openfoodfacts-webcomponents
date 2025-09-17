import type { Nutrient } from "@openfoodfacts/openfoodfacts-nodejs"

// TODO: move this type to the SDK
export type NutrientTaxonomy = Nutrient & { id: string }
export type NutrientsTaxonomiesResponse = Record<string, NutrientTaxonomy>
