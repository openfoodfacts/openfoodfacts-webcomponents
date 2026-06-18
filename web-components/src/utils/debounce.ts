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
