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
    return value.map((item) => encodeURIComponent(item)).join(",")
  }
  if (typeof value === "object") {
    value = JSON.stringify(value)
  } else {
    value = value.toString()
  }
  return encodeURIComponent(value)
}

/**
 * Converts a record of params to a URLSearchParams string.
 * @param params
 * @returns string - the URLSearchParams string
 */
export const paramsToUrl = (params: Record<string, any>) => {
  const paramsToStringRecord = Object.entries(params).reduce((acc, [key, value]) => {
    if (acc) {
      acc += "&"
    }
    acc += `${key}=${paramToString(value)}`
    return acc
  }, "")
  return paramsToStringRecord
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

/**
 * Given a key with dot inside representing nested objects,
 * create inner object and set value on leaf node
 *
 * @example: setValueAndParentsObjectIfNotExists({}, "a.b.c", 3) will create {a: {b: {c: 3}}}
 */
export const setValueAndParentsObjectIfNotExists = (
  obj: Record<string, any>,
  key: string,
  value: any
) => {
  const keys = key.split(".")
  const lastKey = keys.pop() as string
  let lastObject: Record<string, any> = {}

  keys.reduce((acc, key) => {
    if (!acc[key]) {
      acc[key] = {}
    }
    lastObject = acc[key]
    return acc[key]
  }, obj)

  lastObject[lastKey] = value
  return obj
}

/**
 * Generates a random ID.
 * @returns string - a random ID
 */
export const randomIdGenerator = () => Math.random().toString(36).substring(2, 15)

/**
 * Initializes a debounce function.
 * @param callback - the function to debounce
 * @returns () => void - the debounced function
 */
export const initDebounce = (callback: () => any, debounceTime: number = 500) => {
  let timeout: number | undefined
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback()
    }, debounceTime)
  }
}

/**
 * Creates a debounce utility that can be used with class methods
 * @param debounceTime - the delay in milliseconds
 * @returns object with debounce method and clear method
 */
export const createDebounce = (debounceTime: number = 500) => {
  let timeout: number | null = null

  return {
    debounce: (callback: () => void) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = window.setTimeout(() => {
        callback()
        timeout = null
      }, debounceTime)
    },
    clear: () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    },
  }
}

/**
 * Downloads data as a CSV file
 * @param rows - array of arrays representing the CSV rows
 * @param filename - the filename for the download (without extension)
 * @param headers - array of header strings
 */
export const downloadCSV = (rows: Array<Array<any>>, filename: string, headers: Array<string>) => {
  if (rows.length === 0) {
    return
  }

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  const today = new Date().toISOString().split("T")[0]
  const finalFilename = `${filename}_${today}.csv`

  link.setAttribute("href", url)
  link.setAttribute("download", finalFilename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Removes useless zeros from a string.
 * @param value - the string to remove zeros from
 * @returns string - the string without useless zeros
 * @example removeUselessZeros("1.000") => "1"
 * @example removeUselessZeros("1.001") => "1.001"
 * @example removeUselessZeros("1.0010") => "1,001"
 */
export const removeUselessZeros = (value: string) => {
  return value.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1")
}

/**
 * Triggers a form submit event.
 * @param form - the form to submit
 */
export const triggerSubmit = (form: HTMLFormElement) => {
  form.requestSubmit()
}

/**
 * Returns the rotation between 0 and 360.
 * @param rotation - the rotation to normalize
 * @returns number - the normalized rotation
 */
export const normalizeRotation = (rotation: number) => {
  return (rotation % 360) + (rotation < 0 ? 360 : 0)
}

export const OpenFoodFactsSlackLink = "https://openfoodfacts.slack.com"
export const FolksnomyEngineDocumentationLink = "https://wiki.openfoodfacts.org/Folksonomy_Engine"
export const FolksnomyEnginePropertyLink = "https://wiki.openfoodfacts.org/Folksonomy/Property"
