import { describe, expect, it, vi } from "vitest"
import { createDebounce } from "./debounce"

describe("createDebounce", () => {
  it("should create debounce utility with debounce method", async () => {
    const mockFn = vi.fn()
    const debouncer = createDebounce(100)

    debouncer.debounce(mockFn)
    debouncer.debounce(mockFn)

    expect(mockFn).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it("should provide clear method to cancel pending execution", async () => {
    const mockFn = vi.fn()
    const debouncer = createDebounce(100)

    debouncer.debounce(mockFn)
    debouncer.clear()

    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(mockFn).not.toHaveBeenCalled()
  })
})
