import { beforeAll, describe, expect, it, vi } from "vitest"
import type { RobotoffQuestion } from "./robotoff-question"

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })

  await import("./robotoff-question")
})

describe("robotoff-question", () => {
  it("reflects an explicit theme mode for host-page styling", async () => {
    const element = document.createElement("robotoff-question") as RobotoffQuestion
    element.theme = "dark"
    document.body.appendChild(element)
    await element.updateComplete

    expect(element.getAttribute("theme")).toBe("dark")
    element.remove()
  })
})
