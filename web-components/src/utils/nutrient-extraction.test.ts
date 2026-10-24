import { describe, it, expect, beforeEach } from "vitest"
import { getPossibleUnits } from "./nutrient-extraction"
import { nutrientTaxonomyById } from "../signals/taxonomies"

describe("getPossibleUnits", () => {
  beforeEach(() => {
    nutrientTaxonomyById.set({
      "vitamin-c": {
        id: "vitamin-c",
        name: { en: "Vitamin C" },
        unit: { en: "mg" },
        unit_ca: { en: "% DV" },
        dv_value: { en: "60" },
      },
      cocoa: { id: "cocoa", name: { en: "Cocoa" }, unit: { en: "%" } },
    })
  })

  it("returns the forced unit for energy", () => {
    expect(getPossibleUnits("energy-kcal")).toEqual(["kcal"])
  })

  it("adds % DV when the taxonomy defines a daily value", () => {
    expect(getPossibleUnits("vitamin-c")).toEqual(["g", "mg", "µg", "% DV"])
  })

  it("allows changing a % DV unit back to a mass unit", () => {
    expect(getPossibleUnits("vitamin-c", "% DV")).toEqual(["g", "mg", "µg", "% DV"])
  })

  it("keeps the current unit when the taxonomy does not know it", () => {
    expect(getPossibleUnits("vitamin-c", "%D")).toEqual(["g", "mg", "µg", "%D", "% DV"])
  })

  it("does not add mass units to non mass nutrients", () => {
    expect(getPossibleUnits("cocoa")).toEqual(["%"])
  })

  it("returns no unit for unknown nutrients", () => {
    expect(getPossibleUnits("unknown")).toEqual([])
  })
})
