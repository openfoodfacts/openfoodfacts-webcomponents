import { beforeEach, describe, expect, it, vi } from "vitest"
import robotoff from "../../api/robotoff"
import { EventState, EventType } from "../../constants"
import "./robotoff-question"
import type { RobotoffQuestion } from "./robotoff-question"

const mockQuestions = [
  {
    barcode: "123456",
    server_type: "off",
    type: "category",
    value: "Snack",
    question: "Is this product of category:",
    insight_id: "insight-1",
    insight_type: "category",
    value_tag: "en:snacks",
    source_image_url: "https://example.org/img1.jpg",
  },
  {
    barcode: "123456",
    server_type: "off",
    type: "label",
    value: "Organic",
    question: "Does this product have label:",
    insight_id: "insight-2",
    insight_type: "label",
    value_tag: "en:organic",
    source_image_url: "https://example.org/img2.jpg",
  },
]

describe("robotoff-question", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  it("renders questions and shows progress for multiple questions", async () => {
    vi.spyOn(robotoff, "questionsByProductCode").mockResolvedValue({
      status: "found",
      questions: mockQuestions,
    })

    const el = document.createElement("robotoff-question") as RobotoffQuestion
    el.setAttribute("product-code", "123456")
    el.setAttribute("variant", "inline")
    document.body.appendChild(el)

    await el.updateComplete
    // Wait for the task to complete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await el.updateComplete

    const shadow = el.shadowRoot!
    expect(el.isInline).toBe(true)

    // Progress indicator should show Question 1 of 2
    const progress = shadow.querySelector(".question-progress")
    expect(progress).not.toBeNull()
    expect(progress?.textContent).toContain("Question 1 of 2")

    // Question form should be rendered
    const form = shadow.querySelector("robotoff-question-form") as any
    expect(form).not.toBeNull()
    expect(form.question.insight_id).toBe("insight-1")
  })

  it("handles question answering and advances seamlessly to next question", async () => {
    vi.spyOn(robotoff, "questionsByProductCode").mockResolvedValue({
      status: "found",
      questions: mockQuestions,
    })
    vi.spyOn(robotoff, "annotateQuestion").mockResolvedValue({ status: "updated" })

    const el = document.createElement("robotoff-question") as RobotoffQuestion
    el.setAttribute("product-code", "123456")
    document.body.appendChild(el)

    await el.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await el.updateComplete

    const shadow = el.shadowRoot!
    const form = shadow.querySelector("robotoff-question-form") as any
    expect(form.question.insight_id).toBe("insight-1")

    // Simulate answering first question
    form.dispatchEvent(
      new CustomEvent(EventType.SUBMIT, {
        bubbles: true,
        composed: true,
        detail: { value: 1 },
      })
    )

    await el.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 20))
    await el.updateComplete

    // Progress should now be Question 2 of 2
    const progress = shadow.querySelector(".question-progress")
    expect(progress?.textContent).toContain("Question 2 of 2")

    // Form should now have insight-2
    const updatedForm = shadow.querySelector("robotoff-question-form") as any
    expect(updatedForm.question.insight_id).toBe("insight-2")
  })

  it("triggers reload when all questions are answered and reload-on-finish is enabled", async () => {
    vi.spyOn(robotoff, "questionsByProductCode").mockResolvedValue({
      status: "found",
      questions: [mockQuestions[0]],
    })

    const el = document.createElement("robotoff-question") as RobotoffQuestion
    el.setAttribute("product-code", "123456")
    el.setAttribute("reload-on-finish", "")
    el.reloadDelay = 10

    const reloadSpy = vi.spyOn(el, "triggerReload").mockImplementation(() => {})
    document.body.appendChild(el)

    await el.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await el.updateComplete

    expect(el.shouldReloadOnFinish).toBe(true)

    let finishedEventFired = false
    el.addEventListener(EventType.QUESTION_STATE, ((event: CustomEvent) => {
      if (event.detail.state === EventState.FINISHED) {
        finishedEventFired = true
      }
    }) as EventListener)

    const form = el.shadowRoot!.querySelector("robotoff-question-form") as any
    form.dispatchEvent(
      new CustomEvent(EventType.SUBMIT, {
        bubbles: true,
        composed: true,
        detail: { value: 1 },
      })
    )

    await el.updateComplete
    expect(finishedEventFired).toBe(true)

    // Wait for reloadDelay
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(reloadSpy).toHaveBeenCalled()

    // Reload message should be displayed
    const message = el.shadowRoot!.querySelector(".message")
    expect(message?.textContent).toContain("Reloading page to update score...")
  })
})
