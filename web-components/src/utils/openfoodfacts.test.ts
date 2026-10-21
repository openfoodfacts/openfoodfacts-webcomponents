import { describe, expect, it } from "vitest"
import { getOriginalImageId } from "./openfoodfacts"

describe("getOriginalImageId", () => {
  it("extracts the original image ID from a Robotoff source image", () => {
    expect(getOriginalImageId("/890/149/100/2165/2.jpg")).toBe("2")
  })

  it("does not mistake a selected or derived image for an original upload", () => {
    expect(getOriginalImageId("/890/149/100/2165/nutrition_en.3.400.jpg")).toBeUndefined()
  })
})
