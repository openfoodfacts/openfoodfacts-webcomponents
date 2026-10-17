import { fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import { beforeAll, describe, expect, it } from "vitest"
import type { ProductLinkButton } from "./product-link-button"

beforeAll(async () => {
  await import("./product-link-button")
})

describe("product-link-button", () => {
  it("renders one secure link instead of nesting a button inside it", async () => {
    const element = await fixture<ProductLinkButton>(
      html`<product-link-button product-code="1234567890123"></product-link-button>`
    )
    const link = element.shadowRoot!.querySelector<HTMLAnchorElement>("a")

    expect(link?.href).toBe("https://world.openfoodfacts.org/product/1234567890123")
    expect(link?.target).toBe("_blank")
    expect(link?.rel).toBe("noopener noreferrer")
    expect(link?.querySelector("button")).toBeNull()
  })
})
