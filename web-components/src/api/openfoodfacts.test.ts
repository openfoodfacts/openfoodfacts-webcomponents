import { describe, it, expect, vi, beforeEach } from "vitest"
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
    global.fetch = vi.fn()
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

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockProduct,
      })

      const result = await fetchProduct("1234567890123", { 
        fields: "code,product_name" 
      })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://world.openfoodfacts.org/api/v2/product/1234567890123/?fields=code%2Cproduct_name"
      )
      expect(result).toEqual(mockProduct)
    })

    it("should throw error on failed response", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(
        fetchProduct("1234567890123", { fields: "code" })
      ).rejects.toThrow("Failed to fetch product data")
    })

    it("should handle network errors", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network error"))

      await expect(
        fetchProduct("1234567890123", { fields: "code" })
      ).rejects.toThrow("Network error")
    })

    it("should properly encode parameters", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ status: "found" }),
      })

      await fetchProduct("1234567890123", {
        fields: "code,product_name",
        lc: "fr",
      })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://world.openfoodfacts.org/api/v2/product/1234567890123/?fields=code%2Cproduct_name&lc=fr"
      )
    })

    it("should handle special characters in product code", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ status: "found" }),
      })

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

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

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
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
      })

      await expect(
        fetchNutrientsOrder({ cc: "fr", lc: "fr" })
      ).rejects.toThrow("Failed to fetch nutrients order")
    })

    it("should handle missing parameters", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ nutrients: [] }),
      })

      await fetchNutrientsOrder({})
      
      expect(global.fetch).toHaveBeenCalledWith(
        "https://world.openfoodfacts.org/cgi/nutrients.pl?"
      )
    })

    it("should handle JSON parsing errors", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON")
        },
      })

      await expect(
        fetchNutrientsOrder({ cc: "fr" })
      ).rejects.toThrow("Invalid JSON")
    })
  })

  describe("API URL configuration", () => {
    it("should use configured API URL", async () => {
      const mockApiUrl = "https://custom.openfoodfacts.org"
      ;(openfoodfactsApiUrl.get as any).mockReturnValue(mockApiUrl)
      
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ status: "found" }),
      })

      await fetchProduct("123", { fields: "code" })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(mockApiUrl)
      )
    })

    it("should handle URL building errors", () => {
      // Test edge case where API URL might be malformed
      ;(openfoodfactsApiUrl.get as any).mockReturnValue("")
      
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ status: "found" }),
      })

      return expect(
        fetchProduct("123", { fields: "code" })
      ).resolves.not.toThrow()
    })
  })
})