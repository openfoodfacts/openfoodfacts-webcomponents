import { SignalMap } from "../utils/signals"
import robotoff from "../api/robotoff"
import { InsightType, IngredientsInsight } from "../types/robotoff"

export const ingredientSpellcheckInsights = new SignalMap<IngredientsInsight>({})
export const ingredientSpellcheckInsightsIdsByProductCode = new SignalMap<string[]>({})

export const getIngredientSpellcheckInsightsByProductCode = (productCode: string) => {
  const insightIds = ingredientSpellcheckInsightsIdsByProductCode.getItem(productCode)
  return insightIds?.map((id) => ingredientSpellcheckInsights.getItem(id))
}

export async function fetchSpellcheckInsightsByProductCode(productCode: string) {
  try {
    ingredientSpellcheckInsightsIdsByProductCode.setItem(productCode, [])

    const data = await robotoff.insights<IngredientsInsight>({
      barcode: productCode,
      insight_types: InsightType.ingredient_spellcheck,
      annotated: false,
    })
    const insightIds: string[] = []
    data.insights.forEach((insight: IngredientsInsight) => {
      ingredientSpellcheckInsights.setItem(insight.id, insight)
      insightIds.push(insight.id)
    })
    ingredientSpellcheckInsightsIdsByProductCode.setItem(productCode, insightIds)
  } catch (error) {
    console.error("Error fetching spellcheck insights:", error)
  }
}

export async function fetchSpellcheckInsights(): Promise<IngredientsInsight[]> {
  let result
  try {
    result = await robotoff.insights<IngredientsInsight>({
      insight_types: InsightType.ingredient_spellcheck,
      annotated: false,
    })
    // data.insights.forEach((insight: IngredientsInsight) => {
    //   ingredientSpellcheckInsights.setItem(insight.id, insight)
    // })
  } catch (error) {
    console.error("Error fetching spellcheck insights:", error)
    return []
  }
  return result.insights
}
