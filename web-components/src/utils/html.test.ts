import { html, render } from "lit"
import { afterEach, describe, expect, it } from "vitest"
import { sanitizeHtml } from "./html"

describe("sanitizeHtml", () => {
  let container: HTMLDivElement | undefined

  afterEach(() => {
    container?.remove()
    container = undefined
  })

  const renderSanitizedHtml = (value: string) => {
    container = document.createElement("div")
    document.body.append(container)
    render(html`${sanitizeHtml(value)}`, container)
    return container
  }

  it("removes executable elements and event handlers from third-party HTML", () => {
    const result = renderSanitizedHtml(
      '<img src="product.jpg" onerror="alert(1)"><script>alert(1)</script>'
    )

    expect(result.querySelector("script")).toBeNull()
    expect(result.querySelector("img")?.getAttribute("onerror")).toBeNull()
  })

  it("removes unsafe URLs from third-party HTML", () => {
    const result = renderSanitizedHtml('<a href="javascript:alert(1)">Learn more</a>')

    expect(result.querySelector("a")?.getAttribute("href")).toBeNull()
  })
})
