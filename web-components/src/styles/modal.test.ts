import { describe, expect, it } from "vitest"
import { MODAL } from "./modal"

describe("modal styles", () => {
  it("uses a dark shell and visible close control when dark mode is preferred", () => {
    expect(MODAL.cssText).toContain("@media (prefers-color-scheme: dark)")
    expect(MODAL.cssText).toContain("background: var(--off-modal-background-dark, #181a1b)")
    expect(MODAL.cssText).toContain("color: var(--off-modal-text-dark, #f3f3f3)")
  })
})
