import { describe, expect, it } from "vitest"
import { DEFAULT_FOOTER_BASE_URL } from "./footer-defaults"
import {
  jsonAttributeConverter,
  sanitizeHref,
  trueByDefaultBooleanAttributeConverter,
} from "./footer-utils"

describe("sanitizeHref", () => {
  it.each([
    ["https://example.org/page", "https://example.org/page"],
    ["http://example.org/page", "http://example.org/page"],
    ["mailto:hello@example.org", "mailto:hello@example.org"],
    ["/about", `${DEFAULT_FOOTER_BASE_URL}about`],
  ])("allows safe href %s", (href, expected) => {
    expect(sanitizeHref(href)).toBe(expected)
  })

  it.each(["javascript:alert(1)", "data:text/html,unsafe", "//example.org/page"])(
    "rejects unsafe href %s",
    (href) => {
      expect(sanitizeHref(href)).toBeUndefined()
    }
  )
})

describe("jsonAttributeConverter", () => {
  it("uses the fallback when the attribute is invalid JSON", () => {
    const fallback = [{ label: "Default", href: "/" }]
    const converter = jsonAttributeConverter(fallback)

    expect(converter.fromAttribute("{")).toBe(fallback)
  })
})

describe("trueByDefaultBooleanAttributeConverter", () => {
  it("only disables the feature for the false string", () => {
    expect(trueByDefaultBooleanAttributeConverter.fromAttribute(null)).toBe(true)
    expect(trueByDefaultBooleanAttributeConverter.fromAttribute("")).toBe(true)
    expect(trueByDefaultBooleanAttributeConverter.fromAttribute("false")).toBe(false)
  })
})
