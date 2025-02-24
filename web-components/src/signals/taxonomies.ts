import { NutrientTaxonomy } from "../types/taxonomies"
import { SignalMap } from "../utils/signals"
import { LoadingState } from "../constants"
import taxonomies from "../api/taxonomies"
import { State } from "@lit-labs/signals"

const isLoading = new SignalMap<LoadingState>({
  nutrients: LoadingState.NOT_LOADED,
})
const nutrientTaxonomyById = new SignalMap<NutrientTaxonomy>({})

export const getTaxonomyNameByIdAndLang = (id: string, lang: string) => {
  const taxonomy = nutrientTaxonomyById.getItem(id)
  if (!taxonomy) {
    return ""
  }
  if (lang in taxonomy.name) {
    return taxonomy.name[lang]
  }
  return taxonomy.name["en"]
}

export const fetchNutrientsTaxonomies = async () => {
  if (isLoading.getItem("nutrients") != LoadingState.NOT_LOADED) {
    return
  }
  isLoading.setItem("nutrients", LoadingState.LOADING)
  const response = await taxonomies.nutrientsTaxonomies()

  Object.entries(response).forEach(([key, value]) => {
    nutrientTaxonomyById.setItem(key.replace("zz:", ""), value)
  })
  isLoading.setItem("nutrients", LoadingState.LOADED)
}
