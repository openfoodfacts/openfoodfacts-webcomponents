import { Computed } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import { Insight, InsightAnnotationAnswer, InsightAnnotatationData } from "../types/robotoff"
import { SignalMap } from "../utils/signals"

export const insightById = new SignalMap<Insight>({})
export const insightIdByProductCode = new SignalMap<string | null>({})

export const insight = (productCode: string) => {
  return new Computed(
    () =>
      insightIdByProductCode.getItem(productCode) &&
      insightById.getItem(insightIdByProductCode.getItem(productCode) as string)
  )
}

export const fetchIncompleteNutrientsInsightsByProductCode = (productCode: string) => {
  return robotoff
    .insights({
      barcode: productCode,
      insight_types: "nutrient_extraction",
      campaigns: "incomplete-nutrition",
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

export const annotateNutrients = async (data: InsightAnnotationAnswer) => {
  return await robotoff.annotateNutrients(data)
}
