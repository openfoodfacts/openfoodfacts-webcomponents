import DOMPurify from "dompurify"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"

export const paramToString = (value: any): string => {
  if (isNullOrUndefined(value)) {
    return ""
  }
  if (Array.isArray(value)) {
    return value.join(",")
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return value.toString()
}

export const paramsToUrl = (params: Record<string, any>) => {
  const paramsToStringRecord = Object.entries(params).reduce(
    (acc, [key, value]) => {
      acc[key] = paramToString(value)
      return acc
    },
    {} as Record<string, string>
  )
  return new URLSearchParams(paramsToStringRecord).toString()
}

export const addParamsToUrl = (url: string, params: Record<string, any>) => {
  if (url.includes("?")) {
    return `${url}&${paramsToUrl(params)}`
  }
  return `${url}?${paramsToUrl(params)}`
}

// Function to delay the execution of a function
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const isNullOrUndefined = (value: any) => value === null || value === undefined

// Function to sanitize HTML and return it as unsafeHTML for Lit rendering
// It allow to dynamically create HTML elements with a specific tag name and be sure it's safe
export const sanitizeHtml = (html: string) => unsafeHTML(DOMPurify.sanitize(html))
