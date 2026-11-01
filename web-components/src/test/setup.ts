import { afterEach, vi } from "vitest"
import { fixtureCleanup } from "@open-wc/testing/pure"

afterEach(() => {
  fixtureCleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
