import { beforeAll, describe, expect, it, vi } from "vitest"
import type { NutriPatrolFlagForm } from "./nutripatrol-flag-form"

beforeAll(async () => {
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    writable: true,
    value: vi.fn(),
  })

  await import("./nutripatrol-flag-form")
})

describe("nutripatrol-flag-form", () => {
  it("reflects an explicit theme mode for host-page styling", async () => {
    const element = document.createElement("nutripatrol-flag-form") as NutriPatrolFlagForm
    element.theme = "dark"
    document.body.appendChild(element)
    await element.updateComplete

    expect(element.getAttribute("theme")).toBe("dark")
    element.remove()
  })
})
