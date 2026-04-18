import { beforeEach, describe, expect, it, vi } from "vitest"
import robotoff from "../api/robotoff"
import {
  annotateNutrientsWithData,
  annotateNutrientWithoutData,
  fetchNutrientInsights,
  insightById,
  insightIdByProductCode,
} from "./nutrient-extraction"
import { AnnotationAnswer, InsightAnnotationSize, InsightType } from "../types/robotoff"

vi.mock("../api/robotoff", () => ({
  default: {
    insights: vi.fn(),
    annotateNutrients: vi.fn(),
  },
}))

describe("Nutrient extraction signals", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    insightById.set({})
    insightIdByProductCode.set({})
  })

  it("returns full insights response and stores insight mappings", async () => {
    const response = {
      count: 2,
      status: "success",
      insights: [
        { id: "insight-1", barcode: "1111111111111" },
        { id: "insight-2", barcode: "2222222222222" },
      ],
    }

    vi.mocked(robotoff.insights).mockResolvedValue(response as any)

    const result = await fetchNutrientInsights("1111111111111", {
      count: 10,
      page: 2,
      countries: "fr",
    })

    expect(robotoff.insights).toHaveBeenCalledWith({
      count: 10,
      page: 2,
      countries: "fr",
      barcode: "1111111111111",
      insight_types: InsightType.nutrient_extraction,
      annotated: false,
    })
    expect(result).toEqual(response)
    expect(insightById.getItem("insight-1")).toEqual(response.insights[0])
    expect(insightById.getItem("insight-2")).toEqual(response.insights[1])
    expect(insightIdByProductCode.getItem("1111111111111")).toBe("insight-1")
    expect(insightIdByProductCode.getItem("2222222222222")).toBe("insight-2")
  })

  it("initializes product mapping to null when no insight is returned", async () => {
    vi.mocked(robotoff.insights).mockResolvedValue({
      count: 0,
      status: "success",
      insights: [],
    } as any)

    await fetchNutrientInsights("3333333333333")

    expect(insightIdByProductCode.getItem("3333333333333")).toBeNull()
  })

  it("annotateNutrientsWithData sends cleaned payload", async () => {
    vi.mocked(robotoff.annotateNutrients).mockResolvedValue({ status: "saved" } as any)

    await annotateNutrientsWithData({
      insightId: "insight-42",
      type: InsightAnnotationSize.CENTGRAMS,
      data: {
        proteins: { value: "10", unit: "g" },
        serving_size: { value: "25", unit: null },
      },
    })

    expect(robotoff.annotateNutrients).toHaveBeenCalledWith(
      "insight-42",
      AnnotationAnswer.ACCEPT_AND_ADD_DATA,
      {
        serving_size: "25",
        nutrition_data_per: InsightAnnotationSize.CENTGRAMS,
        nutrients: {
          proteins: { value: "10", unit: "g" },
        },
      }
    )
  })

  it("annotateNutrientWithoutData forwards insight id and annotation", async () => {
    vi.mocked(robotoff.annotateNutrients).mockResolvedValue({ status: "saved" } as any)

    await annotateNutrientWithoutData("insight-99", AnnotationAnswer.SKIP)

    expect(robotoff.annotateNutrients).toHaveBeenCalledWith("insight-99", AnnotationAnswer.SKIP)
  })
})
