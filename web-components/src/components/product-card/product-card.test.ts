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

  it("offers the larger front image for high-density displays", async () => {
    const element = await createProductCard("Brand A", "100 g", "https://example.com/small.jpg")
    element.product = { ...element.product, image_front_url: "https://example.com/large.jpg" }
    await elementUpdated(element)

    const image = element.shadowRoot?.querySelector(".product-image") as HTMLImageElement
    expect(image.getAttribute("src")).toBe("https://example.com/small.jpg")
    expect(image.getAttribute("srcset")).toBe(
      "https://example.com/small.jpg 1x, https://example.com/large.jpg 2x"
    )
  })

  it("defaults to lazy loading and auto decoding and allows overrides", async () => {
    const element = await createProductCard("Brand A", "100 g", "https://example.com/product.jpg")
    const image = element.shadowRoot?.querySelector(".product-image") as HTMLImageElement

    expect(image.getAttribute("loading")).toBe("lazy")
    expect(image.getAttribute("decoding")).toBe("auto")

    element.setAttribute("image-loading", "eager")
    element.setAttribute("image-decoding", "sync")
    await elementUpdated(element)

    expect(image.getAttribute("loading")).toBe("eager")
    expect(image.getAttribute("decoding")).toBe("sync")

    element.setAttribute("image-loading", "lazy")
    await elementUpdated(element)

    expect(image.getAttribute("loading")).toBe("lazy")
  })

  it("uses the larger front image when no small image is provided", async () => {
    const element = await createProductCard("Brand A", "100 g")
    element.product = { ...element.product, image_front_url: "https://example.com/large.jpg" }
    await elementUpdated(element)

    const image = element.shadowRoot?.querySelector(".product-image") as HTMLImageElement
    expect(image.getAttribute("src")).toBe("https://example.com/large.jpg")
    expect(image.hasAttribute("srcset")).toBe(false)
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
