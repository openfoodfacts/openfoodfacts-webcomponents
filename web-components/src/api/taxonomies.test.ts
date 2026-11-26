import { beforeEach, describe, expect, it, vi } from "vitest"
import { jsonResponse } from "../test/helpers"
import { fetchPackagingSuggestions } from "./taxonomies"

const options = {
  taxonomy: "packaging_shapes" as const,
  text: "bou",
  language: "fr",
  country: "fr",
  apiUrl: "https://example.test",
}

describe("fetchPackagingSuggestions", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>())
  })

  it("requests suggestions using the configured server, language and country", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        status: "success",
        suggestions: ["Bouteille", "Bouchon"],
      })
    )

    const result = await fetchPackagingSuggestions(options)

    expect(result).toEqual(["Bouteille", "Bouchon"])

    const request = vi.mocked(fetch).mock.calls[0][0]
    const url = new URL(request instanceof Request ? request.url : request.toString())

    expect(url.origin).toBe("https://example.test")
    expect(url.pathname).toBe("/api/v3/taxonomy_suggestions")
    expect(url.searchParams.get("tagtype")).toBe("packaging_shapes")
    expect(url.searchParams.get("string")).toBe("bou")
    expect(url.searchParams.get("lc")).toBe("fr")
    expect(url.searchParams.get("cc")).toBe("fr")
    expect(url.searchParams.get("limit")).toBe("50")
  })

  it("supports material suggestions and an empty result", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ status: "success", suggestions: [] }))

    const result = await fetchPackagingSuggestions({
      ...options,
      taxonomy: "packaging_materials",
      text: "plast",
    })

    expect(result).toEqual([])

    const request = vi.mocked(fetch).mock.calls[0][0]
    const url = new URL(request instanceof Request ? request.url : request.toString())

    expect(url.searchParams.get("tagtype")).toBe("packaging_materials")
    expect(url.searchParams.get("string")).toBe("plast")
  })

  it("reports an HTTP error", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: "server error" }, 500))

    await expect(fetchPackagingSuggestions(options)).rejects.toThrow(
      "Could not load packaging suggestions"
    )
  })

  it("reports a failed API result", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ status: "failure", suggestions: [] }))

    await expect(fetchPackagingSuggestions(options)).rejects.toThrow(
      "Invalid packaging suggestions response"
    )
  })

  it("rejects a response without a valid list of strings", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ status: "success", suggestions: ["Bottle", 42] })
    )

    await expect(fetchPackagingSuggestions(options)).rejects.toThrow(
      "Invalid packaging suggestions response"
    )
  })

  it("propagates network errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"))

    await expect(fetchPackagingSuggestions(options)).rejects.toThrow("Network error")
  })
})
