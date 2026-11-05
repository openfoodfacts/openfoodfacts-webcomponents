import { beforeAll, describe, expect, it } from "vitest"
import { EventState } from "../../constants"
import type { RobotoffModal } from "./robotoff-modal"

beforeAll(async () => {
  await import("./robotoff-modal")
})

const createModal = async () => {
  const element = document.createElement("robotoff-modal") as RobotoffModal
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

describe("robotoff-modal", () => {
  it("keeps the contribution form available and announces an annotation failure", async () => {
    const element = await createModal()

    element.onStateChange(
      new CustomEvent("nutrient-state", { detail: { state: EventState.ERROR } })
    )
    await element.updateComplete

    expect(element.shadowRoot?.querySelector("[role=alert]")?.textContent).toContain(
      "We could not save your answer. Please try again."
    )
    expect(element.shadowRoot?.querySelector(".is-hidden")).toBeNull()
    element.remove()
  })
})
