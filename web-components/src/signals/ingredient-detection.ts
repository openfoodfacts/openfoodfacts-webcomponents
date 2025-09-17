import robotoff from "../api/robotoff"
import {
  type IngredientDetectionInsight,
  type InsightsRequestParams,
  InsightType,
} from "../types/robotoff"
import { SignalMap } from "../utils/signals"

export const ingredientDetectionInsights = new SignalMap<IngredientDetectionInsight>({})

export const fetchIngredientsDetectionInsights = async (
  productCode?: string,
  requestParams: InsightsRequestParams = {}
) => {
  const params: InsightsRequestParams = {
    ...requestParams,
    insight_types: InsightType.ingredient_detection,
    annotated: false,
  }
  if (productCode) {
    params["barcode"] = productCode
  }
  const response = await robotoff.insights<IngredientDetectionInsight>(params)

  response.insights.forEach((insight) => {
    ingredientDetectionInsights.setItem(insight.id, insight)
  })

  return response.insights
}
