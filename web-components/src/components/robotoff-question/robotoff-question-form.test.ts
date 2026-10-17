import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { AnnotationAnswer, type Question } from "../../types/robotoff"
import { answerQuestion } from "../../signals/questions"
import type { RobotoffQuestionForm } from "./robotoff-question-form"

vi.mock("../../signals/questions", () => ({
  answerQuestion: vi.fn(),
}))

beforeAll(async () => {
  await import("./robotoff-question-form")
})

afterEach(() => {
  document.body.innerHTML = ""
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const question: Question = {
  barcode: "123",
  server_type: "api",
  type: "question",
  value: "value",
  question: "Is this correct?",
  insight_id: "insight-id",
  insight_type: "question",
  value_tag: "value",
  source_image_url: "",
}

const createForm = async () => {
  const element = document.createElement("robotoff-question-form") as RobotoffQuestionForm
  element.question = question
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

describe("robotoff-question-form", () => {
  it("restores the answer controls and explains a failed annotation", async () => {
    vi.useFakeTimers()
    vi.mocked(answerQuestion).mockRejectedValueOnce(new Error("Robotoff unavailable"))
    vi.spyOn(console, "error").mockImplementation(() => {})
    const element = await createForm()
    const annotate = (
      element as unknown as {
        _annotateProduct: (event: Event, value: AnnotationAnswer) => Promise<void>
      }
    )._annotateProduct

    const submission = annotate(new Event("click"), AnnotationAnswer.ACCEPT)
    await vi.runAllTimersAsync()
    await submission
    await element.updateComplete

    expect(answerQuestion).toHaveBeenCalledWith("insight-id", AnnotationAnswer.ACCEPT)
    expect(element.shadowRoot?.querySelector("[role=alert]")?.textContent).toContain(
      "We could not save your answer. Please try again."
    )
    expect(element.shadowRoot?.querySelector("loading-button")?.hasAttribute("disabled")).toBe(
      false
    )
  })
})
