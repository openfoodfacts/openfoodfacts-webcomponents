import { describe, it, expect, beforeEach, vi } from "vitest"

vi.mock("../api/taxonomies", () => ({
  default: { nutrientsTaxonomies: vi.fn() },
}))

const response = {
  "zz:energy-kcal": { name: { en: "Energy (kcal)" }, unit: { en: "kcal" } },
}

// The taxonomies module keeps its cache at module level, so it is re-imported for each test.
const load = async () => {
  vi.resetModules()
  const api = (await import("../api/taxonomies")).default
  const signals = await import("./taxonomies")
  return { nutrientsTaxonomies: vi.mocked(api.nutrientsTaxonomies), ...signals }
}

describe("fetchNutrientsTaxonomies", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("stores the taxonomies by id without the zz: prefix", async () => {
    const { nutrientsTaxonomies, fetchNutrientsTaxonomies, nutrientTaxonomyById } = await load()
    nutrientsTaxonomies.mockResolvedValue(response as never)

    await fetchNutrientsTaxonomies()

    expect(nutrientTaxonomyById.getItem("energy-kcal")).toMatchObject({
      id: "energy-kcal",
      unit: { en: "kcal" },
    })
  })

  it("shares one request between concurrent calls and resolves both after loading", async () => {
    const { nutrientsTaxonomies, fetchNutrientsTaxonomies, getTaxonomyUnitById } = await load()
    let resolveRequest: (value: typeof response) => void = () => {}
    nutrientsTaxonomies.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }) as never
    )

    const first = fetchNutrientsTaxonomies()
    let secondSettled = false
    const second = fetchNutrientsTaxonomies().then(() => {
      secondSettled = true
    })

    // The second call must wait for the pending request instead of returning early.
    await Promise.resolve()
    expect(secondSettled).toBe(false)

    resolveRequest(response)
    await Promise.all([first, second])

    expect(getTaxonomyUnitById("energy-kcal")).toBe("kcal")
    expect(nutrientsTaxonomies).toHaveBeenCalledTimes(1)
  })

  it("does not fetch again once loaded", async () => {
    const { nutrientsTaxonomies, fetchNutrientsTaxonomies } = await load()
    nutrientsTaxonomies.mockResolvedValue(response as never)

    await fetchNutrientsTaxonomies()
    await fetchNutrientsTaxonomies()

    expect(nutrientsTaxonomies).toHaveBeenCalledTimes(1)
  })

  it("rejects on failure and retries on the next call", async () => {
    const { nutrientsTaxonomies, fetchNutrientsTaxonomies, getTaxonomyUnitById } = await load()
    nutrientsTaxonomies
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(response as never)

    await expect(fetchNutrientsTaxonomies()).rejects.toThrow("network")
    await fetchNutrientsTaxonomies()

    expect(nutrientsTaxonomies).toHaveBeenCalledTimes(2)
    expect(getTaxonomyUnitById("energy-kcal")).toBe("kcal")
  })
})
