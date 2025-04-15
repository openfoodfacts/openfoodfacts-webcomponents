import { Computed } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import { NutrientsInsight, InsightAnnotationAnswer, InsightType } from "../types/robotoff"
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
export const fetchInsightsByProductCode = (productCode: string) => {
  return robotoff
    .insights<NutrientsInsight>({
      barcode: productCode,
      insight_types: InsightType.nutrient_extraction,
      // Add this to filter out already annotated insights
      annotated: false,
    })
    .then((response) => {
      if (response.insights?.length === 0) {
        insightIdByProductCode.setItem(productCode, null)
        return
      }
      if (response.insights?.length > 1) {
        alert("More than one insight found")
      }

      const insight = response.insights[0]
      insightById.setItem(insight.id, insight)

      insightIdByProductCode.setItem(productCode, insight.id)
    })
}

/**
 * Annotate an insight
 * @param data
 */
export const annotateNutrients = async (data: InsightAnnotationAnswer) => {
  return await robotoff.annotateNutrients(data)
}
