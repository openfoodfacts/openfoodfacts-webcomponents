import {Nutrient} from "@openfoodfacts/openfoodfacts-nodejs";

export type NutrientTaxonomy = Nutrient & { id: string }
export type NutrientsTaxonomiesResponse = Record<string, NutrientTaxonomy>
