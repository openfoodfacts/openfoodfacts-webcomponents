import type { ReactiveControllerHost } from "lit"

export type DebouncedCallback<TArgs extends unknown[] = []> = ((...args: TArgs) => void) & {
  cancel: () => void
}

export type DebounceOptions = {
  /** Delay in milliseconds before the callback runs after the last call. */
  wait?: number
}

/**
 * Debounce a callback, retaining only the latest call and its arguments.
 * `options.wait` is measured in milliseconds and defaults to 500 ms.
 */
export const debounce = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => unknown,
  options: DebounceOptions = {}
): DebouncedCallback<TArgs> => {
  const { wait = 500 } = options
  let timeout: ReturnType<typeof setTimeout> | undefined

  const debounced = ((...args: TArgs) => {
    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      timeout = undefined
      callback(...args)
    }, wait)
  }) as DebouncedCallback<TArgs>

  debounced.cancel = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout)
      timeout = undefined
    }
  }

  return debounced
}

/**
 * Debounce a callback and cancel pending work when its Lit host disconnects.
 * The same debounced callback remains usable if the host reconnects.
 * `options.wait` is measured in milliseconds and defaults to 500 ms.
 */
export const debounceForLit = <TArgs extends unknown[]>(
  host: ReactiveControllerHost,
  callback: (...args: TArgs) => unknown,
  options: DebounceOptions = {}
): DebouncedCallback<TArgs> => {
  const debounced = debounce(callback, options)
  host.addController({
    hostDisconnected: debounced.cancel,
  })
  return debounced
}
