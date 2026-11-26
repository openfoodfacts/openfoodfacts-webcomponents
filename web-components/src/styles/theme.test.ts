import { describe, expect, it } from "vitest"
import { SHARED_THEME } from "./theme"

describe("shared theme", () => {
  it("sets native control color schemes for each mode", () => {
    expect(SHARED_THEME.cssText).toContain(':host([theme="dark"]) {\n    color-scheme: dark;')
    expect(SHARED_THEME.cssText).toContain(
      ':host([theme="auto"]),\n  :host(:not([theme])) {\n    color-scheme: light dark;'
    )
  })
})
