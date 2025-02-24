export type NutrientTaxonomy = {
  unit: {
    en: string
  }
  name: Record<string, string> & {
    en: string
  }
  wikidata: {
    en: string
  }
}
export type NutrientsTaxonomiesResponse = Record<string, NutrientTaxonomy>
