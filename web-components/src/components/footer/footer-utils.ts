import { DEFAULT_FOOTER_BASE_URL } from "./footer-defaults"

export const jsonAttributeConverter = <T>(fallback: T) => ({
  fromAttribute(value: string | null): T {
    if (value === null) {
      return fallback
    }

    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  },
  toAttribute(value: T): string {
    return JSON.stringify(value)
  },
})

export const trueByDefaultBooleanAttributeConverter = {
  fromAttribute(value: string | null): boolean {
    return value !== "false"
  },
}

export const sanitizeHref = (
  href: string,
  baseUrl: string = DEFAULT_FOOTER_BASE_URL
): string | undefined => {
  const value = href.trim()
  if (!value || value.startsWith("//")) {
    return undefined
  }

  try {
    const parsedBaseUrl = new URL(baseUrl)
    const safeBaseUrl =
      parsedBaseUrl.protocol === "http:" || parsedBaseUrl.protocol === "https:"
        ? parsedBaseUrl
        : new URL(DEFAULT_FOOTER_BASE_URL)
    const parsedHref = new URL(value, safeBaseUrl)

    if (["http:", "https:", "mailto:"].includes(parsedHref.protocol)) {
      return parsedHref.href
    }
  } catch {
    return undefined
  }

  return undefined
}
