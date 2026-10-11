import { beforeAll, describe, expect, it, vi } from "vitest"
import { elementUpdated, fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import type { ProductCard } from "./product-card"

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })

  await import("./product-card")
})

const createProductCard = async (brands: string, quantity: string, imageUrl = "") => {
  const element = await fixture<ProductCard>(html`<product-card></product-card>`)
  element.product = {
    code: "1234567890",
    product_name: "Test product",
    brands,
    quantity,
    image_front_small_url: imageUrl,
    product_type: "food",
  }

  await elementUpdated(element)
  return element
}

const getBrandQuantityText = (element: ProductCard) =>
  element.shadowRoot?.querySelector(".brand-quantity p")?.textContent?.trim()

describe("product-card", () => {
  it.each([
    { brands: "Brand A", quantity: "100 g", expected: "Brand A - 100 g" },
    { brands: "Brand A", quantity: "", expected: "Brand A" },
    { brands: "", quantity: "100 g", expected: "100 g" },
  ])("formats brand and quantity: $expected", async ({ brands, quantity, expected }) => {
    const element = await createProductCard(brands, quantity)

    expect(getBrandQuantityText(element)).toBe(expected)
  })

  it("shows a spinner until the product image has loaded", async () => {
    const element = await createProductCard("Brand A", "100 g", "https://example.com/product.jpg")

    const image = element.shadowRoot?.querySelector(".product-image") as HTMLImageElement
    expect(element.shadowRoot?.querySelector(".image-wrapper .loading-ring")).not.toBeNull()
    expect(image.classList.contains("image-loading")).toBe(true)

    image.dispatchEvent(new Event("load"))
    await elementUpdated(element)

    expect(element.shadowRoot?.querySelector(".image-wrapper .loading-ring")).toBeNull()
    expect(image.classList.contains("image-loading")).toBe(false)
  })

  it("shows the placeholder when the product image fails to load", async () => {
    const element = await createProductCard("Brand A", "100 g", "https://example.com/product.jpg")

    const image = element.shadowRoot?.querySelector(".product-image") as HTMLImageElement
    image.dispatchEvent(new Event("error"))
    await elementUpdated(element)

    expect(element.shadowRoot?.querySelector(".image-wrapper .loading-ring")).toBeNull()
    expect(element.shadowRoot?.querySelector(".product-image")).toBeNull()
    expect(element.shadowRoot?.querySelector(".placeholder-image")).not.toBeNull()
  })
})
