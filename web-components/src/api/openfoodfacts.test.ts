import { describe, it, expect, vi, beforeEach } from "vitest"
import { jsonResponse } from "../test/helpers"
import { fetchProduct, fetchNutrientsOrder } from "../api/openfoodfacts"
import { openfoodfactsApiUrl } from "../signals/openfoodfacts"

// Mock the signal
vi.mock("../signals/openfoodfacts", () => ({
  openfoodfactsApiUrl: {
    get: vi.fn(() => "https://world.openfoodfacts.org"),
  },
}))

describe("OpenFoodFacts API", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>())
    vi.mocked(openfoodfactsApiUrl.get).mockReturnValue("https://world.openfoodfacts.org")
  })

  describe("fetchProduct", () => {
    it("should fetch product successfully", async () => {
      const mockProduct = {
        status: "found",
        product: {
          code: "1234567890123",
          product_name: "Test Product",
        },
      }

      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(mockProduct))

      const result = await fetchProduct("1234567890123", {
        fields: "code,product_name",
      })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://world.openfoodfacts.org/api/v2/product/1234567890123/?fields=code%2Cproduct_name"
      )
      expect(result).toEqual(mockProduct)
    })

    it("should throw error on failed response", async () => {
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(null, 404))

      await expect(fetchProduct("1234567890123", { fields: "code" })).rejects.toThrow(
        "Failed to fetch product data"
      )
    })

    it("should handle network errors", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"))

      await expect(fetchProduct("1234567890123", { fields: "code" })).rejects.toThrow(
        "Network error"
      )
    })

    it("should properly encode parameters", async () => {
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse({ status: "found" }))

      await fetchProduct("1234567890123", {
        fields: "code,product_name",
        lc: "fr",
      })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://world.openfoodfacts.org/api/v2/product/1234567890123/?fields=code%2Cproduct_name&lc=fr"
      )
    })

    it("should handle special characters in product code", async () => {
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse({ status: "found" }))

      const productCode = "test/product&code"
      await fetchProduct(productCode, { fields: "code" })

      expect(global.fetch).toHaveBeenCalledWith(
        `https://world.openfoodfacts.org/api/v2/product/${productCode}/?fields=code`
      )
    })
  })

  describe("fetchNutrientsOrder", () => {
    it("should fetch nutrients order successfully", async () => {
      const mockResponse = {
        nutrients: [
          { id: "energy", name: "Energy", unit: "kJ" },
          { id: "fat", name: "Fat", unit: "g" },
        ],
      }

      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(mockResponse))

      const result = await fetchNutrientsOrder({
        cc: "fr",
        lc: "fr",
      })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://world.openfoodfacts.org/cgi/nutrients.pl?cc=fr&lc=fr"
      )
      expect(result).toEqual(mockResponse)
    })

    it("should throw error on failed response", async () => {
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(null, 500))

      await expect(fetchNutrientsOrder({ cc: "fr", lc: "fr" })).rejects.toThrow(
        "Failed to fetch nutrients order"
      )
    })

    it("should handle missing parameters", async () => {
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse({ nutrients: [] }))

      await fetchNutrientsOrder({})

      expect(global.fetch).toHaveBeenCalledWith("https://world.openfoodfacts.org/cgi/nutrients.pl?")
    })

    it("should handle JSON parsing errors", async () => {
      const malformedResponse = new Response("not JSON")
      vi.spyOn(malformedResponse, "json").mockRejectedValue(new Error("Invalid JSON"))
      vi.mocked(global.fetch).mockResolvedValue(malformedResponse)

      await expect(fetchNutrientsOrder({ cc: "fr" })).rejects.toThrow("Invalid JSON")
    })
  })

  describe("API URL configuration", () => {
    it("should use configured API URL", async () => {
      const mockApiUrl = "https://custom.openfoodfacts.org"
      vi.mocked(openfoodfactsApiUrl.get).mockReturnValue(mockApiUrl)
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse({ status: "found" }))

      await fetchProduct("123", { fields: "code" })

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(mockApiUrl))
    })

    it("should handle URL building errors", () => {
      // Test edge case where API URL might be malformed
      vi.mocked(openfoodfactsApiUrl.get).mockReturnValue("")
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse({ status: "found" }))

      return expect(fetchProduct("123", { fields: "code" })).resolves.not.toThrow()
    })
  })
})
