import { afterEach, describe, expect, it } from "vitest"
import type { NutrientsInsight } from "../../types/robotoff"
import { RobotoffNutrientExtractionForm } from "./robotoff-nutrient-extraction-form"

const createInsight = (nutrientKey: string): NutrientsInsight =>
  ({
    id: "insight-id",
    barcode: "1234567890123",
    data: {
      nutrients: {
        [nutrientKey]: {
          entity: nutrientKey,
          value: "12",
          unit: "g",
          start: 0,
          end: 2,
        },
      },
    },
  }) as NutrientsInsight

describe("RobotoffNutrientExtractionForm", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("rebuilds its nutrient rows when the parent supplies the next insight", async () => {
    const form = document.createElement(
      "robotoff-nutrient-extraction-form"
    ) as RobotoffNutrientExtractionForm
    form.insight = createInsight("fat_100g")
    document.body.append(form)
    await form.updateComplete
    await form.updateComplete

    expect(form.shadowRoot!.querySelector('input[name="fat_100g"]')).not.toBeNull()
    const toggleButton = form.shadowRoot!.querySelector<HTMLButtonElement>(
      ".toggle-nutrient-button-wrapper button"
    )!
    expect(toggleButton.getAttribute("aria-label")).toBe("Hide nutrient")

    toggleButton.click()
    await form.updateComplete
    expect(toggleButton.getAttribute("aria-label")).toBe("Show nutrient")

    form.insight = createInsight("salt_100g")
    await form.updateComplete
    await form.updateComplete

    expect(form.shadowRoot!.querySelector('input[name="fat_100g"]')).toBeNull()
    expect(form.shadowRoot!.querySelector('input[name="salt_100g"]')).not.toBeNull()
  })
})
