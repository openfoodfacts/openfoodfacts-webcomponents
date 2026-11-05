import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { jsonResponse } from "../test/helpers"

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
  let folksonomyApi: typeof import("../api/folksonomy").default

  beforeEach(async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>())
    vi.clearAllMocks()

    // Dynamically import to avoid hoisting issues
    folksonomyApi = (await import("../api/folksonomy")).default
    const { folksonomyConfiguration } = await import("../signals/folksonomy")
    vi.mocked(folksonomyConfiguration.getItem).mockImplementation((key) =>
      key === "apiUrl" ? "https://api.folksonomy.openfoodfacts.org" : (null as unknown as string)
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("authentication storage", () => {
    it("continues authenticated edits when storage is unavailable", async () => {
      vi.stubGlobal("localStorage", undefined)
      vi.mocked(global.fetch)
        .mockResolvedValueOnce(jsonResponse({ access_token: "temporary-token" }))
        .mockResolvedValueOnce(jsonResponse({}))

      await expect(
        folksonomyApi.replaceValue({ property: "labels", old_value: "old", new_value: "new" })
      ).resolves.toEqual({ success: true })

      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "https://api.folksonomy.openfoodfacts.org/admin/value/replace",
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: "Bearer temporary-token" }),
        })
      )
    })
  })

  describe("fetchProductProperties", () => {
    it("should fetch product properties successfully", async () => {
      const mockProperties = [
        { k: "organic", v: "yes", version: 1 },
        { k: "packaging", v: "recyclable", version: 1 },
      ]

      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(mockProperties))

      const result = await folksonomyApi.fetchProductProperties("1234567890123")

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.folksonomy.openfoodfacts.org/product/1234567890123"
      )
      expect(result).toEqual(mockProperties)
    })

    it("should handle network errors", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"))

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow("Network error")
    })

    it("should handle HTTP error responses", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(null, 404))

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow(
        "HTTP error! status: 404"
      )
    })

    it("should handle empty product code", async () => {
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse([]))

      const result = await folksonomyApi.fetchProductProperties("")
      expect(result).toEqual([])
    })

    it("should handle malformed JSON responses", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      const malformedResponse = new Response("not JSON")
      vi.spyOn(malformedResponse, "json").mockRejectedValue(new Error("Invalid JSON"))
      vi.mocked(global.fetch).mockResolvedValue(malformedResponse)

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow("Invalid JSON")
    })
  })

  describe("error handling patterns", () => {
    it("should propagate console.error calls on fetch failures", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      vi.mocked(global.fetch).mockRejectedValue(new Error("Connection failed"))

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
      vi.spyOn(console, "error").mockImplementation(() => {})
      vi.mocked(global.fetch).mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), 1)
          })
      )

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow("Timeout")
    })

    it("should handle server unavailable responses", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(null, 503))

      await expect(folksonomyApi.fetchProductProperties("123")).rejects.toThrow(
        "HTTP error! status: 503"
      )
    })
  })

  describe("API URL configuration", () => {
    it("should use configured API URL from signal", async () => {
      const { folksonomyConfiguration } = await import("../signals/folksonomy")
      vi.mocked(folksonomyConfiguration.getItem).mockReturnValue("https://custom.api.url")
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse([]))

      await folksonomyApi.fetchProductProperties("123")

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("https://custom.api.url"))
    })

    it("should handle missing API URL gracefully", async () => {
      const { folksonomyConfiguration } = await import("../signals/folksonomy")
      vi.mocked(folksonomyConfiguration.getItem).mockReturnValue(null as unknown as string)
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse([]))

      await folksonomyApi.fetchProductProperties("123")

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("null/product/123"))
    })
  })

  describe("edge cases and boundary conditions", () => {
    it("should handle very long product codes", async () => {
      const longProductCode = "1".repeat(1000)

      vi.mocked(global.fetch).mockResolvedValue(jsonResponse([]))

      await folksonomyApi.fetchProductProperties(longProductCode)

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(longProductCode))
    })

    it("should handle special characters in product codes", async () => {
      const specialCode = "product/with&special%chars"

      vi.mocked(global.fetch).mockResolvedValue(jsonResponse([]))

      await folksonomyApi.fetchProductProperties(specialCode)

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(specialCode))
    })

    it("should handle null response data", async () => {
      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(null))

      const result = await folksonomyApi.fetchProductProperties("123")
      expect(result).toBeNull()
    })

    it("should handle undefined response data", async () => {
      const undefinedResponse = new Response(null)
      vi.spyOn(undefinedResponse, "json").mockResolvedValue(undefined)
      vi.mocked(global.fetch).mockResolvedValue(undefinedResponse)

      const result = await folksonomyApi.fetchProductProperties("123")
      expect(result).toBeUndefined()
    })

    it("should handle response with unexpected structure", async () => {
      const weirdResponse = {
        not: "expected",
        structure: { deeply: { nested: "value" } },
      }

      vi.mocked(global.fetch).mockResolvedValue(jsonResponse(weirdResponse))

      const result = await folksonomyApi.fetchProductProperties("123")
      expect(result).toEqual(weirdResponse)
    })
  })

  describe("performance and reliability", () => {
    it("should handle concurrent requests", async () => {
      vi.mocked(global.fetch).mockImplementation(async () =>
        jsonResponse([{ k: "test", v: "value", version: 1 }])
      )

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

    it("handles repeated calls", async () => {
      vi.mocked(global.fetch).mockImplementation(async () => jsonResponse([]))

      // Simulate many calls
      for (let i = 0; i < 100; i++) {
        await folksonomyApi.fetchProductProperties("123")
      }

      expect(global.fetch).toHaveBeenCalledTimes(100)
    })
  })
})
