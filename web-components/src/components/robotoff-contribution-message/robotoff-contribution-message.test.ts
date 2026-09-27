import { beforeEach, describe, expect, it, vi } from "vitest"
import robotoff from "../../api/robotoff"
import "./robotoff-contribution-message"
import type { RobotoffContributionMessage } from "./robotoff-contribution-message"
import { InsightType } from "../../types/robotoff"

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
]

describe("robotoff-contribution-message", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ""
  })

  it("renders default modal pre-warning variant with button", async () => {
    vi.spyOn(robotoff, "questionsByProductCode").mockResolvedValue({
      status: "found",
      questions: mockQuestions,
    })

    const el = document.createElement(
      "robotoff-contribution-message"
    ) as RobotoffContributionMessage
    el.setAttribute("product-code", "123456")
    document.body.appendChild(el)

    await el.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await el.updateComplete

    const shadow = el.shadowRoot!
    expect(el.isInline).toBe(false)

    // Pre-warning prompt should be rendered
    const text = shadow.querySelector(".container p")?.textContent
    expect(text).toContain(
      "Hey! You can help us improve the product information by answering the following parts:"
    )

    // Button should say "Answer questions about the product."
    const button = shadow.querySelector("button")
    expect(button?.textContent).toContain("Answer questions about the product.")

    // Modal should be present in shadow DOM
    const modal = shadow.querySelector("robotoff-modal")
    expect(modal).not.toBeNull()
  })

  it("renders inline variant directly without pre-warning prompt", async () => {
    vi.spyOn(robotoff, "questionsByProductCode").mockResolvedValue({
      status: "found",
      questions: mockQuestions,
    })

    const el = document.createElement(
      "robotoff-contribution-message"
    ) as RobotoffContributionMessage
    el.setAttribute("product-code", "123456")
    el.setAttribute("variant", "inline")
    el.setAttribute("reload-on-finish", "")
    document.body.appendChild(el)

    await el.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await el.updateComplete

    const shadow = el.shadowRoot!
    expect(el.isInline).toBe(true)
    expect(el.shouldReloadOnFinish).toBe(true)

    // Pre-warning prompt should NOT be rendered
    const prewarning = shadow.querySelector(".container p")
    expect(prewarning).toBeNull()

    // Inline robotoff-question element should be rendered
    const questionEl = shadow.querySelector("robotoff-question") as any
    expect(questionEl).not.toBeNull()
    expect(questionEl.getAttribute("variant")).toBe("inline")
    expect(questionEl.hasAttribute("reload-on-finish")).toBe(true)
  })

  it("renders inline variant with shorthand inline attribute", async () => {
    vi.spyOn(robotoff, "questionsByProductCode").mockResolvedValue({
      status: "found",
      questions: mockQuestions,
    })

    const el = document.createElement(
      "robotoff-contribution-message"
    ) as RobotoffContributionMessage
    el.setAttribute("product-code", "123456")
    el.setAttribute("inline", "")
    document.body.appendChild(el)

    await el.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await el.updateComplete

    expect(el.isInline).toBe(true)
    const shadow = el.shadowRoot!
    const questionEl = shadow.querySelector("robotoff-question")
    expect(questionEl).not.toBeNull()
  })

  it("renders other contributions below inline questions when logged in", async () => {
    vi.spyOn(robotoff, "questionsByProductCode").mockResolvedValue({
      status: "found",
      questions: mockQuestions,
    })
    vi.spyOn(robotoff, "fetchRobotoffContributionMessageInsights").mockResolvedValue([
      { type: InsightType.ingredient_spellcheck } as any,
    ])

    const el = document.createElement(
      "robotoff-contribution-message"
    ) as RobotoffContributionMessage
    el.setAttribute("product-code", "123456")
    el.setAttribute("variant", "inline")
    el.setAttribute("is-logged-in", "")
    document.body.appendChild(el)

    await el.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 50))
    await el.updateComplete

    const shadow = el.shadowRoot!
    // Question should be inline
    expect(shadow.querySelector("robotoff-question")).not.toBeNull()

    // Other contributions section should be rendered below
    const other = shadow.querySelector(".other-contributions")
    expect(other).not.toBeNull()
    expect(other?.textContent).toContain("You can also help us improve other parts:")
    expect(other?.textContent).toContain("Help us correct the spelling of ingredients.")
  })
})
