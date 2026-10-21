import { afterEach, describe, expect, it, vi } from "vitest"
import { mobileAndTabletCheck } from "./breakpoints"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("mobileAndTabletCheck", () => {
  it("returns false when rendered without browser globals", () => {
    vi.stubGlobal("navigator", undefined)

    expect(mobileAndTabletCheck()).toBe(false)
  })
})
