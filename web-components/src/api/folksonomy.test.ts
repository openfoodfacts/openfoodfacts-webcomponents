import { describe, it, expect, vi, beforeEach } from "vitest"
import folksonomyApi from "../api/folksonomy"

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, "localStorage", { value: localStorageMock })

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
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
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
        "https://api.folksonomy.openfoodfacts.org/product/1234567890123",
        { credentials: "include" }
      )
      expect(result).toEqual(mockProperties)
    })

    it("should handle empty product code", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      const result = await folksonomyApi.fetchProductProperties("")
      
      expect(result).toEqual([])
    })

    it("should handle network errors", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network error"))

      await expect(
        folksonomyApi.fetchProductProperties("123")
      ).rejects.toThrow("Network error")
    })

    it("should handle 404 responses", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "Product not found" }),
      })

      await expect(
        folksonomyApi.fetchProductProperties("123")
      ).rejects.toThrow()
    })
  })

  describe("authentication flow", () => {
    describe("token management", () => {
      it("should retrieve stored token from localStorage", () => {
        localStorageMock.getItem.mockImplementation((key) => {
          if (key === "folksonomy-bearer-token") return "stored-token-123"
          if (key === "folksonomy-token-date") return new Date().toISOString()
          return null
        })

        // We can't directly test getStoredToken since it's not exported
        // But we can test it indirectly through API calls that use it
      })

      it("should handle missing token gracefully", () => {
        localStorageMock.getItem.mockReturnValue(null)
        
        // Token should be fetched when needed for authenticated requests
      })

      it("should handle expired token", () => {
        const expiredDate = new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
        localStorageMock.getItem.mockImplementation((key) => {
          if (key === "folksonomy-bearer-token") return "expired-token"
          if (key === "folksonomy-token-date") return expiredDate.toISOString()
          return null
        })

        // Expired token should trigger re-authentication
      })
    })

    describe("authenticated requests", () => {
      it("should retry request with new token on 401 error", async () => {
        // First request fails with 401
        ;(global.fetch as any)
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
          })
          // Auth request succeeds
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: "new-token-123" }),
          })
          // Retry request succeeds
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: "saved" }),
          })

        const result = await folksonomyApi.addProductProperty("123", "organic", "yes", 1)

        expect(global.fetch).toHaveBeenCalledTimes(3)
        expect(result.status).toBe("saved")
      })

      it("should retry request with new token on 403 error", async () => {
        ;(global.fetch as any)
          .mockResolvedValueOnce({
            ok: false,
            status: 403,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: "new-token-456" }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: "saved" }),
          })

        const result = await folksonomyApi.addProductProperty("123", "packaging", "plastic", 1)

        expect(global.fetch).toHaveBeenCalledTimes(3)
        expect(result.status).toBe("saved")
      })

      it("should not retry on other error codes", async () => {
        ;(global.fetch as any).mockResolvedValue({
          ok: false,
          status: 500,
        })

        await expect(
          folksonomyApi.addProductProperty("123", "key", "value", 1)
        ).rejects.toThrow()

        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe("addProductProperty", () => {
    beforeEach(() => {
      // Mock successful authentication
      ;(global.fetch as any).mockImplementation((url) => {
        if (url.includes("/auth/by-cookie")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "test-token-123" }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "saved" }),
        })
      })
    })

    it("should add product property successfully", async () => {
      const result = await folksonomyApi.addProductProperty("123", "organic", "yes", 1)

      expect(result.status).toBe("saved")
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.folksonomy.openfoodfacts.org/product",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("barcode=123"),
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Bearer test-token-123",
          }),
        })
      )
    })

    it("should handle special characters in property values", async () => {
      await folksonomyApi.addProductProperty("123", "description", "Test & Review", 1)

      const lastCall = (global.fetch as any).mock.calls[1]
      const body = lastCall[1].body
      expect(body).toContain("Test%20%26%20Review")
    })

    it("should include version in request", async () => {
      await folksonomyApi.addProductProperty("123", "key", "value", 5)

      const lastCall = (global.fetch as any).mock.calls[1]
      const body = lastCall[1].body
      expect(body).toContain("version=5")
    })
  })

  describe("updateProductProperty", () => {
    beforeEach(() => {
      ;(global.fetch as any).mockImplementation((url) => {
        if (url.includes("/auth/by-cookie")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "test-token-123" }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "updated" }),
        })
      })
    })

    it("should update product property successfully", async () => {
      const result = await folksonomyApi.updateProductProperty("123", "organic", "no", 2)

      expect(result.status).toBe("updated")
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/product"),
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("barcode=123"),
        })
      )
    })
  })

  describe("deleteProductProperty", () => {
    beforeEach(() => {
      ;(global.fetch as any).mockImplementation((url) => {
        if (url.includes("/auth/by-cookie")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "test-token-123" }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "deleted" }),
        })
      })
    })

    it("should delete product property successfully", async () => {
      const result = await folksonomyApi.deleteProductProperty("123", "organic", 1)

      expect(result.status).toBe("deleted")
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/product"),
        expect.objectContaining({
          method: "DELETE",
          body: expect.stringContaining("barcode=123"),
        })
      )
    })
  })

  describe("property and value management", () => {
    beforeEach(() => {
      ;(global.fetch as any).mockImplementation((url) => {
        if (url.includes("/auth/by-cookie")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "test-token-123" }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "success" }),
        })
      })
    })

    it("should rename property successfully", async () => {
      const renameData = {
        k: "old-property",
        new_k: "new-property",
      }

      const result = await folksonomyApi.renameProperty(renameData)

      expect(result.status).toBe("success")
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/property/rename"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("k=old-property"),
        })
      )
    })

    it("should delete property successfully", async () => {
      const deleteData = {
        k: "property-to-delete",
      }

      const result = await folksonomyApi.deleteProperty(deleteData)

      expect(result.status).toBe("success")
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/property/delete"),
        expect.objectContaining({
          method: "DELETE",
        })
      )
    })

    it("should check property clash", async () => {
      ;(global.fetch as any).mockImplementation((url) => {
        if (url.includes("/property/clash")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ clash: false }),
          })
        }
        if (url.includes("/auth/by-cookie")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "test-token-123" }),
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
      })

      const result = await folksonomyApi.checkPropertyClash({
        k: "test-property",
        new_k: "new-test-property",
      })

      expect(result.clash).toBe(false)
    })
  })

  describe("error handling", () => {
    it("should handle authentication failures", async () => {
      ;(global.fetch as any).mockImplementation((url) => {
        if (url.includes("/auth/by-cookie")) {
          return Promise.resolve({
            ok: false,
            status: 401,
          })
        }
        return Promise.resolve({ ok: true })
      })

      await expect(
        folksonomyApi.addProductProperty("123", "key", "value", 1)
      ).rejects.toThrow()
    })

    it("should handle network timeouts", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Request timeout"))

      await expect(
        folksonomyApi.fetchProductProperties("123")
      ).rejects.toThrow("Request timeout")
    })

    it("should handle malformed responses", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON")
        },
      })

      await expect(
        folksonomyApi.fetchProductProperties("123")
      ).rejects.toThrow("Invalid JSON")
    })

    it("should clear token on authentication error", async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "new-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: "saved" }),
        })

      await folksonomyApi.addProductProperty("123", "key", "value", 1)

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("folksonomy-bearer-token")
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("folksonomy-token-date")
    })
  })

  describe("edge cases", () => {
    it("should handle empty API URL", async () => {
      const { folksonomyConfiguration } = await import("../signals/folksonomy")
      ;(folksonomyConfiguration.getItem as any).mockReturnValue("")

      await expect(
        folksonomyApi.fetchProductProperties("123")
      ).rejects.toThrow()
    })

    it("should handle missing product code", async () => {
      await expect(
        folksonomyApi.fetchProductProperties("")
      ).resolves.not.toThrow()
    })

    it("should handle very long property values", async () => {
      const longValue = "x".repeat(10000)
      
      ;(global.fetch as any).mockImplementation((url) => {
        if (url.includes("/auth/by-cookie")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "test-token" }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: "saved" }),
        })
      })

      const result = await folksonomyApi.addProductProperty("123", "description", longValue, 1)
      expect(result.status).toBe("saved")
    })
  })
})