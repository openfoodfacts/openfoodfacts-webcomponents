import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the folksonomy configuration
vi.mock("../signals/folksonomy", () => ({
  folksonomyConfiguration: {
    getItem: vi.fn((key) => {
      if (key === "apiUrl") return "https://api.folksonomy.openfoodfacts.org"
      return null
    }),
  },
  userInfo: { value: null },
  userInfoLoading: { value: false },
}))

describe("Folksonomy API", () => {
  let folksonomyApi: any

  beforeEach(async () => {
    global.fetch = vi.fn()
    vi.clearAllMocks()

    // Dynamically import to avoid hoisting issues
    folksonomyApi = (await import("../api/folksonomy")).default
  })

  describe("fetchProductProperties", () => {
    it("should fetch product properties successfully", async () => {
      const mockProperties = [
        { k: "organic", v: "yes", version: 1 },
        { k: "packaging", v: "recyclable", version: 1 },
      ]

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockProperties,
      })

      const result = await folksonomyApi.fetchProductProperties("1234567890123")

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.folksonomy.openfoodfacts.org/product/1234567890123"
      )
      expect(result).toEqual(mockProperties)
    })

    it("should handle network errors", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network error"))

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow("Network error")
    })

    it("should handle HTTP error responses", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow(
        "HTTP error! status: 404"
      )
    })

    it("should handle empty product code", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      const result = await folksonomyApi.fetchProductProperties("")
      expect(result).toEqual([])
    })

    it("should handle malformed JSON responses", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON")
        },
      })

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow("Invalid JSON")
    })
  })

  describe("error handling patterns", () => {
    it("should propagate console.error calls on fetch failures", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      ;(global.fetch as any).mockRejectedValue(new Error("Connection failed"))

      try {
        await folksonomyApi.fetchProductProperties("123")
      } catch {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching product properties:",
        expect.any(Error)
      )
    })

    it("should handle timeout scenarios", async () => {
      ;(global.fetch as any).mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), 1)
          })
      )

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow("Timeout")
    })

    it("should handle server unavailable responses", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 503,
      })

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow(
        "HTTP error! status: 503"
      )
    })
  })

  describe("API URL configuration", () => {
    it("should use configured API URL from signal", async () => {
      const { folksonomyConfiguration } = await import("../signals/folksonomy")
      ;(folksonomyConfiguration.getItem as any).mockReturnValue("https://custom.api.url")
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      await folksonomyApi.fetchProductProperties("123")

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("https://custom.api.url"))
    })

    it("should handle missing API URL gracefully", async () => {
      const { folksonomyConfiguration } = await import("../signals/folksonomy")
      ;(folksonomyConfiguration.getItem as any).mockReturnValue(null)
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      await folksonomyApi.fetchProductProperties("123")

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("null/product/123"))
    })
  })

  describe("edge cases and boundary conditions", () => {
    it("should handle very long product codes", async () => {
      const longProductCode = "1".repeat(1000)

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      await folksonomyApi.fetchProductProperties(longProductCode)

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(longProductCode))
    })

    it("should handle special characters in product codes", async () => {
      const specialCode = "product/with&special%chars"

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      await folksonomyApi.fetchProductProperties(specialCode)

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(specialCode))
    })

    it("should handle null response data", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => null,
      })

      const result = await folksonomyApi.fetchProductProperties("123")
      expect(result).toBeNull()
    })

    it("should handle undefined response data", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => undefined,
      })

      const result = await folksonomyApi.fetchProductProperties("123")
      expect(result).toBeUndefined()
    })

    it("should handle response with unexpected structure", async () => {
      const weirdResponse = {
        not: "expected",
        structure: { deeply: { nested: "value" } },
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => weirdResponse,
      })

      const result = await folksonomyApi.fetchProductProperties("123")
      expect(result).toEqual(weirdResponse)
    })
  })

  describe("performance and reliability", () => {
    it("should handle concurrent requests", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [{ k: "test", v: "value", version: 1 }],
      })

      const promises = Array(10)
        .fill(0)
        .map((_, i) => folksonomyApi.fetchProductProperties(`product-${i}`))

      const results = await Promise.all(promises)

      expect(results).toHaveLength(10)
      expect(global.fetch).toHaveBeenCalledTimes(10)
      results.forEach((result) => {
        expect(result).toEqual([{ k: "test", v: "value", version: 1 }])
      })
    })

    it("should not leak memory on repeated calls", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      // Simulate many calls
      for (let i = 0; i < 100; i++) {
        await folksonomyApi.fetchProductProperties("123")
      }

      expect(global.fetch).toHaveBeenCalledTimes(100)
    })
  })
})
