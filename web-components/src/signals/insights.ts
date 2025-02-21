import { Computed } from "@lit-labs/signals"
import robotoff from "../api/robotoff"
import { Insight } from "../types/robotoff"
import { SignalMap } from "../utils/signals"

export const insightById = new SignalMap<Insight>({})
export const insightIdsByProductCode = new SignalMap<string[]>({})

export const insights = (productCode: string) => {
  return new Computed(
    () => insightIdsByProductCode.getItem(productCode)?.map((id) => insightById.getItem(id)) ?? []
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
      response.insights.forEach((insight) => {
        insightById.setItem(insight.id, insight)
      })
      insightIdsByProductCode.setItem(
        productCode,
        response.insights.map((insight) => insight.id)
      )
    })
}
