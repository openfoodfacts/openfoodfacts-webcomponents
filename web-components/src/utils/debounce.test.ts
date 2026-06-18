import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { createDebounce } from "./debounce"

describe("createDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should create debounce utility with debounce method", () => {
    const mockFn = vi.fn()
    const debouncer = createDebounce(100)

    debouncer.debounce(mockFn)
    debouncer.debounce(mockFn)

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it("should provide clear method to cancel pending execution", () => {
    const mockFn = vi.fn()
    const debouncer = createDebounce(100)

    debouncer.debounce(mockFn)
    debouncer.clear()

    vi.advanceTimersByTime(100)

    expect(mockFn).not.toHaveBeenCalled()
  })

  it("should cancel even during the wait period", () => {
    const mockFn = vi.fn()
    const debouncer = createDebounce(100)

    debouncer.debounce(mockFn)
    vi.advanceTimersByTime(50)
    debouncer.clear()

    vi.advanceTimersByTime(50)

    expect(mockFn).not.toHaveBeenCalled()
  })
})
