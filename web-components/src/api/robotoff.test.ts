import { describe, it, expect, vi, beforeEach } from "vitest"
import robotoff from "../api/robotoff"
import { AnnotationAnswer } from "../types/robotoff"

// Mock dependencies
vi.mock("../signals/robotoff", () => ({
  robotoffConfiguration: {
    getItem: vi.fn((key) => {
      if (key === "apiUrl") return "https://robotoff.openfoodfacts.org/api/v1"
      if (key === "dryRun") return false
      return null
    }),
  },
}))

vi.mock("../signals/app", () => ({
  languageCode: {
    get: vi.fn(() => "en"),
  },
}))

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })

const lastRequest = () => (global.fetch as any).mock.calls.at(-1)[0] as Request
const lastRequestOptions = () => (global.fetch as any).mock.calls.at(-1)[1]

describe("Robotoff API", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ status: "saved" }))
    vi.clearAllMocks()
  })

  describe("questionsByProductCode", () => {
    it("should fetch questions for product code", async () => {
      const mockQuestions = {
        questions: [
          {
            id: "question-1",
            barcode: "1234567890123",
            text: "Is this product gluten-free?",
            value: "yes",
          },
        ],
      }

      ;(global.fetch as any).mockResolvedValue(jsonResponse(mockQuestions))

      const result = await robotoff.questionsByProductCode("1234567890123")

      expect(lastRequest().url).toBe(
        "https://robotoff.openfoodfacts.org/api/v1/questions/1234567890123?lang=en"
      )
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
      expect(result).toEqual(mockQuestions)
    })

    it("should use provided language parameter", async () => {
      ;(global.fetch as any).mockResolvedValue(jsonResponse({ questions: [] }))

      await robotoff.questionsByProductCode("123", { lang: "fr" })

      expect(lastRequest().url).toBe(
        "https://robotoff.openfoodfacts.org/api/v1/questions/123?lang=fr"
      )
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
    })

    it("should handle additional parameters", async () => {
      ;(global.fetch as any).mockResolvedValue(jsonResponse({ questions: [] }))

      await robotoff.questionsByProductCode("123", {
        count: 10,
        insight_types: "ingredient",
      })

      expect(lastRequest().url).toContain("count=10")
      expect(lastRequest().url).toContain("insight_types=ingredient")
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
    })

    it("should handle network errors gracefully", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network failure"))

      await expect(robotoff.questionsByProductCode("123")).rejects.toThrow("Network failure")
    })

    it("should handle malformed JSON responses", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        text: async () => {
          throw new Error("Invalid JSON")
        },
      })

      await expect(robotoff.questionsByProductCode("123")).rejects.toThrow("Invalid JSON")
    })
  })

  describe("insights", () => {
    it("should fetch insights with default parameters", async () => {
      const mockInsights = {
        insights: [
          {
            id: "insight-1",
            type: "nutrient_extraction",
            barcode: "1234567890123",
          },
        ],
      }

      ;(global.fetch as any).mockResolvedValue(jsonResponse(mockInsights))

      const result = await robotoff.insights()

      expect(lastRequest().url).toBe("https://robotoff.openfoodfacts.org/api/v1/insights")
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
      expect(result).toEqual(mockInsights)
    })

    it("should handle request parameters", async () => {
      ;(global.fetch as any).mockResolvedValue(jsonResponse({ insights: [] }))

      await robotoff.insights({
        barcode: "123",
        insight_types: "nutrient_extraction",
        count: 25,
        annotated: false,
      })

      expect(lastRequest().url).toContain("barcode=123")
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
    })

    it("should handle comma-separated parameters correctly", async () => {
      ;(global.fetch as any).mockResolvedValue(jsonResponse({ insights: [] }))

      await robotoff.insights({
        insight_types: "nutrient_extraction,ingredient_spellcheck",
      })

      expect(lastRequest().url).toContain(
        "insight_types=nutrient_extraction%2Cingredient_spellcheck"
      )
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
    })
  })

  describe("fetchRobotoffContributionMessageInsights", () => {
    it("should fetch multiple insight types for contribution message", async () => {
      const mockResponse = {
        insights: [
          { id: "1", type: "nutrient_extraction" },
          { id: "2", type: "ingredient_spellcheck" },
          { id: "3", type: "ingredient_detection" },
        ],
      }

      ;(global.fetch as any).mockResolvedValue(jsonResponse(mockResponse))

      const result = await robotoff.fetchRobotoffContributionMessageInsights({
        barcode: "123",
      })

      expect(lastRequest().url).toContain("annotated=false")
      expect(lastRequest().url).toContain("insight_types=")
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
      expect(result).toEqual(mockResponse.insights)
    })

    it("should override annotated parameter", async () => {
      ;(global.fetch as any).mockResolvedValue(jsonResponse({ insights: [] }))

      await robotoff.fetchRobotoffContributionMessageInsights({
        annotated: true, // Should be overridden to false
      })

      expect(lastRequest().url).toContain("annotated=false")
      expect(lastRequestOptions()).toEqual({ credentials: "include" })
    })
  })

  describe("annotation methods", () => {
    describe("annotateQuestion", () => {
      it("should annotate question with correct parameters", async () => {
        await robotoff.annotateQuestion("insight-123", AnnotationAnswer.ACCEPT)

        expect(lastRequest().url).toBe(
          "https://robotoff.openfoodfacts.org/api/v1/insights/annotate"
        )
        expect(lastRequest().method).toBe("POST")
        expect(lastRequestOptions()).toEqual({ credentials: "include" })
        await expect(lastRequest().text()).resolves.toBe("insight_id=insight-123&annotation=1")
      })
    })

    describe("annotateNutrients", () => {
      it("should annotate nutrients with data", async () => {
        const nutrientData = {
          serving_size: null,
          nutrients: { energy: { value: "100", unit: "kJ" } },
          nutrition_data_per: "100g",
        }
        await robotoff.annotateNutrients("insight-123", AnnotationAnswer.ACCEPT, nutrientData)

        await expect(lastRequest().text()).resolves.toBe(
          `insight_id=insight-123&annotation=1&data=${encodeURIComponent(JSON.stringify(nutrientData))}`
        )
      })
    })

    describe("annotateIngredientSpellcheck", () => {
      it("should annotate ingredient spellcheck with correction", async () => {
        await robotoff.annotateIngredientSpellcheck(
          "insight-123",
          AnnotationAnswer.ACCEPT,
          "corrected ingredient"
        )

        await expect(lastRequest().text()).resolves.toBe(
          "insight_id=insight-123&annotation=1&data=%7B%22annotation%22%3A%22corrected+ingredient%22%7D"
        )
      })

      it("should handle missing correction", async () => {
        await robotoff.annotateIngredientSpellcheck("insight-123", AnnotationAnswer.REFUSE)

        await expect(lastRequest().text()).resolves.toBe("insight_id=insight-123&annotation=0")
      })
    })

    describe("annotateIngredientDetection", () => {
      it("should annotate ingredient detection with data", async () => {
        const detectionData = {
          annotation: "salt, sugar",
          bounding_box: [0, 0, 1, 1] as [number, number, number, number],
          rotation: 0,
        }
        await robotoff.annotateIngredientDetection(
          "insight-123",
          AnnotationAnswer.ACCEPT,
          detectionData
        )

        await expect(lastRequest().text()).resolves.toBe(
          `insight_id=insight-123&annotation=1&data=${encodeURIComponent(JSON.stringify(detectionData)).replaceAll("%20", "+")}`
        )
      })
    })
  })

  describe("dry run mode", () => {
    it("should log instead of making request in dry run mode", async () => {
      const { robotoffConfiguration } = await import("../signals/robotoff")
      ;(robotoffConfiguration.getItem as any).mockImplementation((key: string) => {
        if (key === "apiUrl") return "https://robotoff.openfoodfacts.org/api/v1"
        if (key === "dryRun") return true
        return null
      })

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

      const result = await robotoff.annotateQuestion("insight-123", AnnotationAnswer.ACCEPT)

      expect(consoleSpy).toHaveBeenCalledWith("Annotated :", {
        insight_id: "insight-123",
        annotation: AnnotationAnswer.ACCEPT,
      })
      expect(result).toBeUndefined()
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe("error handling", () => {
    it("should propagate fetch errors", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Connection timeout"))

      await expect(robotoff.questionsByProductCode("123")).rejects.toThrow("Connection timeout")
    })

    it("should handle malformed API responses", async () => {
      ;(global.fetch as any).mockResolvedValue(jsonResponse(null))

      const result = await robotoff.questionsByProductCode("123")
      expect(result).toBeNull()
    })
  })
})
