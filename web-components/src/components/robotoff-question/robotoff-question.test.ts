import { describe, expect, it } from "vitest"
import { render, type TemplateResult } from "lit"
import { RobotoffQuestion } from "./robotoff-question"

type TestableRobotoffQuestion = {
  hasAnswered: boolean
  renderMessage: () => TemplateResult
}

describe("RobotoffQuestion", () => {
  it("uses the message style for the post-answer prompt", () => {
    const question = new RobotoffQuestion() as unknown as TestableRobotoffQuestion
    question.hasAnswered = true

    const container = document.createElement("div")
    render(question.renderMessage(), container)

    expect(container.querySelector(".message")?.textContent).toBe(
      "Thanks for your help! Can you assist with another question?"
    )
  })
})
