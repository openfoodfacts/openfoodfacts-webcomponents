import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { elementUpdated, fixture, fixtureCleanup } from "@open-wc/testing/pure"
import { html } from "lit"

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
  const element = await fixture<any>(html`<product-card></product-card>`)
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

const getBrandQuantityText = (element: any) =>
  element.shadowRoot?.querySelector(".brand-quantity p")?.textContent?.trim()

afterEach(() => {
  fixtureCleanup()
})

describe("product-card", () => {
  it("shows brand and quantity with a dash when both are present", async () => {
    const element = await createProductCard("Brand A", "100 g")

    expect(getBrandQuantityText(element)).toBe("Brand A - 100 g")
  })

  it("does not show a dash when quantity is missing", async () => {
    const element = await createProductCard("Brand A", "")

    expect(getBrandQuantityText(element)).toBe("Brand A")
  })

  it("does not show a dash when brand is missing", async () => {
    const element = await createProductCard("", "100 g")

    expect(getBrandQuantityText(element)).toBe("100 g")
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
