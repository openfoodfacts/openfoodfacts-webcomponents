import { beforeAll, describe, expect, it } from "vitest"
import type { FolksonomyProperties } from "./folksonomy-properties"
import type { FolksonomyPropertyProducts } from "./folksonomy-property-products"

beforeAll(async () => {
  await Promise.all([import("./folksonomy-properties"), import("./folksonomy-property-products")])
})

describe("folksonomy routes", () => {
  it("keeps special property names, values, and product codes within one URL segment", () => {
    const properties = document.createElement("folksonomy-properties") as FolksonomyProperties
    const propertyProducts = document.createElement(
      "folksonomy-property-products"
    ) as FolksonomyPropertyProducts
    propertyProducts.propertyName = "origin/region #1"

    expect(
      (properties as unknown as { getPropertyUrl: (name: string) => string }).getPropertyUrl(
        "origin/region #1"
      )
    ).toBe("/property/origin%2Fregion%20%231")
    expect(
      (
        properties as unknown as { getDocumentationUrl: (name: string) => string }
      ).getDocumentationUrl("origin/region #1")
    ).toBe("https://wiki.openfoodfacts.org/Folksonomy/Property/origin%2Fregion%20%231")
    expect(
      (propertyProducts as unknown as { getProductUrl: (code: string) => string }).getProductUrl(
        "product/with#fragment"
      )
    ).toBe("/product/product%2Fwith%23fragment")
    expect(
      (
        propertyProducts as unknown as { getPropertyValueUrl: (value: string) => string }
      ).getPropertyValueUrl("fresh & dried")
    ).toBe("/property/origin%2Fregion%20%231/value/fresh%20%26%20dried")
  })
})
