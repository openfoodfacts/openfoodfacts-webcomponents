import { beforeAll, describe, expect, it, vi } from "vitest"

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

const createProductCard = (brands: string, quantity: string, imageUrl = "") => {
  const element = document.createElement("product-card") as any

  element.product = {
    code: "1234567890",
    product_name: "Test product",
    brands,
    quantity,
    image_front_small_url: imageUrl,
    product_type: "food",
  }

  document.body.appendChild(element)
  return element
}

const getBrandQuantityText = (element: any) =>
  element.shadowRoot?.querySelector(".brand-quantity p")?.textContent?.trim()

describe("product-card", () => {
  it("shows brand and quantity with a dash when both are present", async () => {
    const element = createProductCard("Brand A", "100 g")
    await element.updateComplete

    expect(getBrandQuantityText(element)).toBe("Brand A - 100 g")
    element.remove()
  })

  it("does not show a dash when quantity is missing", async () => {
    const element = createProductCard("Brand A", "")
    await element.updateComplete

    expect(getBrandQuantityText(element)).toBe("Brand A")
    element.remove()
  })

  it("does not show a dash when brand is missing", async () => {
    const element = createProductCard("", "100 g")
    await element.updateComplete

    expect(getBrandQuantityText(element)).toBe("100 g")
    element.remove()
  })

  it("shows a spinner until the product image has loaded", async () => {
    const element = createProductCard("Brand A", "100 g", "https://example.com/product.jpg")
    await element.updateComplete

    const image = element.shadowRoot?.querySelector(".product-image") as HTMLImageElement
    expect(element.shadowRoot?.querySelector(".image-wrapper .loading-ring")).not.toBeNull()
    expect(image.classList.contains("image-loading")).toBe(true)

    image.dispatchEvent(new Event("load"))
    await element.updateComplete

    expect(element.shadowRoot?.querySelector(".image-wrapper .loading-ring")).toBeNull()
    expect(image.classList.contains("image-loading")).toBe(false)
    element.remove()
  })

  it("shows the placeholder when the product image fails to load", async () => {
    const element = createProductCard("Brand A", "100 g", "https://example.com/product.jpg")
    await element.updateComplete

    const image = element.shadowRoot?.querySelector(".product-image") as HTMLImageElement
    image.dispatchEvent(new Event("error"))
    await element.updateComplete

    expect(element.shadowRoot?.querySelector(".image-wrapper .loading-ring")).toBeNull()
    expect(element.shadowRoot?.querySelector(".product-image")).toBeNull()
    expect(element.shadowRoot?.querySelector(".placeholder-image")).not.toBeNull()
    element.remove()
  })
})
