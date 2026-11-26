import type { LocalizedString, Nutrient } from "@openfoodfacts/openfoodfacts-nodejs"

// TODO: move this type to the SDK
export type NutrientTaxonomy = Nutrient & {
  id: string
  // Daily values, when defined the nutrient can be expressed in "% DV"
  dv_value?: LocalizedString
  dv_2016_value?: LocalizedString
  // Country specific units, e.g. unit_ca: { en: "% DV" }
  [countryUnit: `unit_${string}`]: LocalizedString | undefined
}
export type NutrientsTaxonomiesResponse = Record<string, NutrientTaxonomy>
