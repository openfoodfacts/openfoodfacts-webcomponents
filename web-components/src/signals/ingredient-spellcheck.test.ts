import { describe, expect, it, vi } from "vitest"
import robotoff from "../api/robotoff"
import { fetchSpellcheckInsights } from "./ingredient-spellcheck"

vi.mock("../api/robotoff", () => ({
  default: { insights: vi.fn() },
}))

describe("fetchSpellcheckInsights", () => {
  it("preserves an API failure instead of treating it as an empty insight list", async () => {
    vi.mocked(robotoff.insights).mockRejectedValueOnce(new Error("Robotoff unavailable"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(fetchSpellcheckInsights("123")).rejects.toThrow("Robotoff unavailable")
  })
})
