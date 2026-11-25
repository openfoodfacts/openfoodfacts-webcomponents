// @vitest-environment node
import { describe, expect, it, vi } from "vitest"

describe("darkModeListener", () => {
  it("can be imported during server-side rendering", async () => {
    vi.resetModules()

    const { darkModeListener } = await import("./dark-mode-listener")
    const callback = vi.fn()
    darkModeListener.subscribe(callback)

    expect(darkModeListener.darkMode).toBe(false)
    expect(callback).toHaveBeenCalledWith(false)
  })
})
