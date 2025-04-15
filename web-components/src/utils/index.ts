/**
 * Converts a value to a string.
 * If the value is an array, it will be joined with a comma.
 * If the value is an object, it will be stringified with JSON.stringify
 * If the value is null or undefined, it will return an empty string.
 * @param value
 * @returns string - the string representation of the value
 */
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

/**
 * Converts a record of params to a URLSearchParams string.
 * @param params
 * @returns string - the URLSearchParams string
 */
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

/**
 * Adds params to a URL.
 * If the URL already has params, it will append the new params with an &.
 * @param url
 * @param params
 * @returns string - the url with the params appended
 */
export const addParamsToUrl = (url: string, params: Record<string, any>) => {
  if (url.includes("?")) {
    return `${url}&${paramsToUrl(params)}`
  }
  return `${url}?${paramsToUrl(params)}`
}

// Function to delay the execution of a function
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

/**
 * Checks if a value is null or undefined.
 * @param value
 * @returns boolean - true if the value is null or undefined, false otherwise
 */
export const isNullOrUndefined = (value: any) => value === null || value === undefined
