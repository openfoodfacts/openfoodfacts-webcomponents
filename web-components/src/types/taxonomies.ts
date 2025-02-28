export type NutrientTaxonomy = {
  id: string
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
