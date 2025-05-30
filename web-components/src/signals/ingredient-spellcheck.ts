import { SignalMap } from "../utils/signals"
import robotoff from "../api/robotoff"
import { InsightType, IngredientSpellcheckInsight, InsightsRequestParams } from "../types/robotoff"

export const ingredientSpellcheckInsights = new SignalMap<IngredientSpellcheckInsight>({})

export async function fetchSpellcheckInsights(
  productCode?: string,
  requestParams: InsightsRequestParams = {}
): Promise<IngredientSpellcheckInsight[]> {
  let result
  const params: InsightsRequestParams = {
    ...requestParams,
    insight_types: InsightType.ingredient_spellcheck,
    annotated: false,
  }
  if (productCode) {
    params["barcode"] = productCode
  }
  try {
    result = await robotoff.insights<IngredientSpellcheckInsight>(params)
    result.insights.forEach((insight: IngredientSpellcheckInsight) => {
      ingredientSpellcheckInsights.setItem(insight.id, insight)
    })
  } catch (error) {
    console.error("Error fetching spellcheck insights:", error)
    return []
  }
  return result.insights
}
