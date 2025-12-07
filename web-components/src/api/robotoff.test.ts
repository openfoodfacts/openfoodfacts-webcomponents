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

vi.mock("@openfoodfacts/openfoodfacts-nodejs", () => ({
  Robotoff: vi.fn().mockImplementation(() => ({
    annotate: vi.fn().mockResolvedValue({ status: "saved" }),
  })),
}))

describe("Robotoff API", () => {
  beforeEach(() => {
    global.fetch = vi.fn()
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

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockQuestions,
      })

      const result = await robotoff.questionsByProductCode("1234567890123")

      expect(global.fetch).toHaveBeenCalledWith(
        "https://robotoff.openfoodfacts.org/api/v1/questions/1234567890123?lang=en",
        { credentials: "include" }
      )
      expect(result).toEqual(mockQuestions)
    })

    it("should use provided language parameter", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await robotoff.questionsByProductCode("123", { lang: "fr" })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://robotoff.openfoodfacts.org/api/v1/questions/123?lang=fr",
        { credentials: "include" }
      )
    })

    it("should handle additional parameters", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ questions: [] }),
      })

      await robotoff.questionsByProductCode("123", {
        count: 10,
        page: 2,
        insight_types: ["ingredient"],
      })

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("count=10"), {
        credentials: "include",
      })
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("page=2"), {
        credentials: "include",
      })
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("insight_types=ingredient"),
        {
          credentials: "include",
        }
      )
    })

    it("should handle network errors gracefully", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network failure"))

      await expect(robotoff.questionsByProductCode("123")).rejects.toThrow("Network failure")
    })

    it("should handle malformed JSON responses", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
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

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockInsights,
      })

      const result = await robotoff.insights()

      expect(global.fetch).toHaveBeenCalledWith(
        "https://robotoff.openfoodfacts.org/api/v1/insights?",
        { credentials: "include" }
      )
      expect(result).toEqual(mockInsights)
    })

    it("should handle request parameters", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ insights: [] }),
      })

      await robotoff.insights({
        barcode: "123",
        insight_types: ["nutrient_extraction"],
        count: 25,
        annotated: false,
      })

      const expectedUrl = expect.stringContaining("barcode=123")
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, { credentials: "include" })
    })

    it("should handle array parameters correctly", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ insights: [] }),
      })

      await robotoff.insights({
        insight_types: ["nutrient_extraction", "ingredient_spellcheck"],
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("insight_types=nutrient_extraction,ingredient_spellcheck"),
        { credentials: "include" }
      )
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

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await robotoff.fetchRobotoffContributionMessageInsights({
        barcode: "123",
      })

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("annotated=false"), {
        credentials: "include",
      })
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("insight_types="), {
        credentials: "include",
      })
      expect(result).toEqual(mockResponse.insights)
    })

    it("should override annotated parameter", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ insights: [] }),
      })

      await robotoff.fetchRobotoffContributionMessageInsights({
        annotated: true, // Should be overridden to false
      })

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("annotated=false"), {
        credentials: "include",
      })
    })
  })

  describe("annotation methods", () => {
    describe("annotateQuestion", () => {
      it("should annotate question with correct parameters", async () => {
        const mockRobotoff = {
          annotate: vi.fn().mockResolvedValue({ status: "saved" }),
        }

        // Mock the Robotoff constructor
        const { Robotoff } = await import("@openfoodfacts/openfoodfacts-nodejs")
        ;(Robotoff as any).mockImplementation(() => mockRobotoff)

        await robotoff.annotateQuestion("insight-123", AnnotationAnswer.ACCEPT)

        expect(mockRobotoff.annotate).toHaveBeenCalledWith({
          insight_id: "insight-123",
          annotation: AnnotationAnswer.ACCEPT,
        })
      })
    })

    describe("annotateNutrients", () => {
      it("should annotate nutrients with data", async () => {
        const mockRobotoff = {
          annotate: vi.fn().mockResolvedValue({ status: "saved" }),
        }

        const { Robotoff } = await import("@openfoodfacts/openfoodfacts-nodejs")
        ;(Robotoff as any).mockImplementation(() => mockRobotoff)

        const nutrientData = { nutrient: "energy", value: "100", unit: "kJ" }
        await robotoff.annotateNutrients("insight-123", AnnotationAnswer.ACCEPT, nutrientData)

        expect(mockRobotoff.annotate).toHaveBeenCalledWith({
          insight_id: "insight-123",
          annotation: AnnotationAnswer.ACCEPT,
          data: nutrientData,
        })
      })
    })

    describe("annotateIngredientSpellcheck", () => {
      it("should annotate ingredient spellcheck with correction", async () => {
        const mockRobotoff = {
          annotate: vi.fn().mockResolvedValue({ status: "saved" }),
        }

        const { Robotoff } = await import("@openfoodfacts/openfoodfacts-nodejs")
        ;(Robotoff as any).mockImplementation(() => mockRobotoff)

        await robotoff.annotateIngredientSpellcheck(
          "insight-123",
          AnnotationAnswer.ACCEPT,
          "corrected ingredient"
        )

        expect(mockRobotoff.annotate).toHaveBeenCalledWith({
          insight_id: "insight-123",
          annotation: AnnotationAnswer.ACCEPT,
          data: { annotation: "corrected ingredient" },
        })
      })

      it("should handle missing correction", async () => {
        const mockRobotoff = {
          annotate: vi.fn().mockResolvedValue({ status: "saved" }),
        }

        const { Robotoff } = await import("@openfoodfacts/openfoodfacts-nodejs")
        ;(Robotoff as any).mockImplementation(() => mockRobotoff)

        await robotoff.annotateIngredientSpellcheck("insight-123", AnnotationAnswer.REFUSE)

        expect(mockRobotoff.annotate).toHaveBeenCalledWith({
          insight_id: "insight-123",
          annotation: AnnotationAnswer.REFUSE,
        })

        expect(mockRobotoff.annotate).not.toHaveBeenCalledWith(
          expect.objectContaining({ data: { annotation: "" } })
        )
      })
    })

    describe("annotateIngredientDetection", () => {
      it("should annotate ingredient detection with data", async () => {
        const mockRobotoff = {
          annotate: vi.fn().mockResolvedValue({ status: "saved" }),
        }

        const { Robotoff } = await import("@openfoodfacts/openfoodfacts-nodejs")
        ;(Robotoff as any).mockImplementation(() => mockRobotoff)

        const detectionData = { ingredients: ["salt", "sugar"] }
        await robotoff.annotateIngredientDetection(
          "insight-123",
          AnnotationAnswer.ACCEPT,
          detectionData
        )

        expect(mockRobotoff.annotate).toHaveBeenCalledWith({
          insight_id: "insight-123",
          annotation: AnnotationAnswer.ACCEPT,
          data: detectionData,
        })
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

      const result = await robotoff.annotate("test=data")

      expect(consoleSpy).toHaveBeenCalledWith(
        "Annotated :",
        "https://robotoff.openfoodfacts.org/api/v1/insights/annotate",
        "test=data"
      )
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
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => null,
      })

      const result = await robotoff.questionsByProductCode("123")
      expect(result).toBeNull()
    })
  })
})
