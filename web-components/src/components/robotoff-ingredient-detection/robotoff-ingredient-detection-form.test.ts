import { afterEach, describe, expect, it } from "vitest"
import { render } from "lit"
import { userInfo } from "../../signals/folksonomy"
import { AnnotationAnswer, type IngredientDetectionInsight } from "../../types/robotoff"
import { RobotoffIngredientDetectionForm } from "./robotoff-ingredient-detection-form"

const insight = {
  id: "first",
  barcode: "123",
  source_image: "/first.jpg",
  data: { text: "ingredients", rotation: 0 },
} as IngredientDetectionInsight

afterEach(() => userInfo.set(null))

describe("robotoff-ingredient-detection-form", () => {
  it("passes the authenticated user ID to the image flag form", () => {
    userInfo.set({ user_id: "contributor", admin: false, moderator: false, user: true })
    const element = new RobotoffIngredientDetectionForm()
    element.insight = insight
    const container = document.createElement("div")

    render(element.render(), container)

    expect((container.querySelector("nutripatrol-flag-form") as any).userId).toBe("contributor")
  })

  it("closes the flag modal for the next insight and disables flagging while loading", () => {
    const element = new RobotoffIngredientDetectionForm()
    element.insight = insight
    ;(element as any)._isFlagModalOpen = true
    element.onInsightChange()
    element.loading = AnnotationAnswer.ACCEPT
    const container = document.createElement("div")

    render(element.render(), container)

    expect((container.querySelector("nutripatrol-flag-form") as any).open).toBe(false)
    expect((container.querySelector(".action-chip-btn") as HTMLButtonElement).disabled).toBe(true)
  })
})
