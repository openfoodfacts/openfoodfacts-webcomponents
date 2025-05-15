import { Computed } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import {
  NutrientsInsight,
  InsightAnnotationAnswer,
  InsightType,
  InsightsRequestParams,
} from "../types/robotoff"
import { SignalMap } from "../utils/signals"

/**
 * Nutrients insights by insight id
 */
export const insightById = new SignalMap<NutrientsInsight>({})

/**
 * Nutrients insights id by product code
 */
export const insightIdByProductCode = new SignalMap<string | null>({})

/**
 * Get the insight for a given product code
 * @param productCode
 * @returns {Computed<NutrientsInsight | undefined>}
 */
export const insight = (productCode: string) => {
  return new Computed<NutrientsInsight | undefined>(() => {
    const insightId = insightIdByProductCode.getItem(productCode)
    if (!insightId) {
      return undefined
    }
    return insightById.getItem(insightId)
  })
}

/**
 * Fetch the incomplete nutrients insights for a given product code
 * @param productCode
 */
export const fetchNutrientInsights = async (
  productCode?: string,
  requestParams: InsightsRequestParams = {}
): Promise<NutrientsInsight[]> => {
  const params: InsightsRequestParams = {
    ...requestParams,
    insight_types: InsightType.nutrient_extraction,
    annotated: false,
  }
  if (productCode) {
    params["barcode"] = productCode
    insightIdByProductCode.setItem(productCode, null)
  }
  const response = await robotoff.insights<NutrientsInsight>(params)

  response.insights.forEach((insight) => {
    insightById.setItem(insight.id, insight)
    insightIdByProductCode.setItem(insight.barcode, insight.id)
  })

  return response.insights
}

/**
 * Annotate an insight
 * @param data
 */
export const annotateNutrients = async (data: InsightAnnotationAnswer) => {
  return await robotoff.annotateNutrients(data)
}
