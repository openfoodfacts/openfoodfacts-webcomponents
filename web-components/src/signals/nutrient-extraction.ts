import { Computed } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import {
  NutrientsInsight,
  InsightAnnotationAnswer,
  InsightType,
  InsightsRequestParams,
  AnnotationAnswer,
  NutrientsAnnotationData,
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
 * Annotate an insight with data
 * @param data
 */
export const annotateNutrientsWithData = async (annotation: InsightAnnotationAnswer) => {
  const servingSize = annotation.data["serving_size"]?.value ?? null
  // Clone the nutrients object to avoid mutating the original annotation.data
  const clonedData = { ...annotation.data }
  delete clonedData["serving_size"]
  const data: NutrientsAnnotationData = {
    nutrients: clonedData,
    nutrition_data_per: annotation.type,
    serving_size: servingSize,
  }
  return await robotoff.annotateNutrients(
    annotation.insightId,
    AnnotationAnswer.ACCEPT_AND_ADD_DATA,
    data
  )
}

/**
 * Annotate an insight with annotation answer
 * @param insightId
 */
export const annotateNutrientWithoutData = async (
  insightId: string,
  annotation: AnnotationAnswer
) => {
  return await robotoff.annotateNutrients(insightId, annotation)
}
