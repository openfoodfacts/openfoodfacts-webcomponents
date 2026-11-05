import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { fixture, html } from "@open-wc/testing/pure"
import { elementUpdated, waitUntil } from "@open-wc/testing-helpers"
import { fetchQuestionsByProductCode } from "../../signals/questions"
import robotoff from "../../api/robotoff"
import type { RobotoffContributionMessage } from "./robotoff-contribution-message"

vi.mock("../../signals/questions", () => ({ fetchQuestionsByProductCode: vi.fn() }))
vi.mock("../../api/robotoff", () => ({
  default: { fetchRobotoffContributionMessageInsights: vi.fn() },
}))

beforeAll(async () => {
  await import("./robotoff-contribution-message")
})

beforeEach(() => {
  vi.mocked(fetchQuestionsByProductCode).mockResolvedValue([])
  vi.mocked(robotoff.fetchRobotoffContributionMessageInsights).mockResolvedValue([])
})

describe("robotoff-contribution-message", () => {
  it("loads signed-in contribution prompts after the user logs in", async () => {
    const element = await fixture<RobotoffContributionMessage>(
      html`<robotoff-contribution-message product-code="123"></robotoff-contribution-message>`
    )
    await waitUntil(() => vi.mocked(fetchQuestionsByProductCode).mock.calls.length > 0)

    expect(robotoff.fetchRobotoffContributionMessageInsights).not.toHaveBeenCalled()
    vi.clearAllMocks()

    element.isLoggedIn = true
    await elementUpdated(element)
    await waitUntil(
      () => vi.mocked(robotoff.fetchRobotoffContributionMessageInsights).mock.calls.length > 0
    )

    expect(robotoff.fetchRobotoffContributionMessageInsights).toHaveBeenCalledWith({
      barcode: "123",
      lc: "en",
    })
  })
})
