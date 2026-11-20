import { describe, expect, it } from "vitest"
import { getPossibleUnits, Unit } from "./nutrient-extraction"

describe("getPossibleUnits", () => {
  it("allows the percentage unit alongside mass units", () => {
    expect(getPossibleUnits("fat", Unit.GRAMS)).toEqual([
      Unit.GRAMS,
      Unit.MILIGRAMS,
      Unit.MICROGRAMS,
      Unit.PERCENT,
    ])
  })

  it("keeps energy nutrient units fixed", () => {
    expect(getPossibleUnits("energy-kcal", Unit.PERCENT)).toEqual([Unit.KILOCALORIES])
  })
})
