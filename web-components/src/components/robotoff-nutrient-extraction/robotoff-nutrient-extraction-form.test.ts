import { beforeAll, describe, expect, it } from "vitest"
import { elementUpdated, fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import type { NutrientsInsight } from "../../types/robotoff"
import type { RobotoffNutrientExtractionForm } from "./robotoff-nutrient-extraction-form"

beforeAll(async () => {
  await import("./robotoff-nutrient-extraction-form")
})

const createInsight = (id: string) =>
  ({
    id,
    data: { entities: { postprocessed: [] }, nutrients: { salt_100g: { value: "", unit: "g" } } },
  }) as unknown as NutrientsInsight

const getInput = (element: RobotoffNutrientExtractionForm, name: string) =>
  element.shadowRoot!.querySelector<HTMLInputElement>(`input[name='${name}']`)!

const getServingSizeInput = (element: RobotoffNutrientExtractionForm) =>
  getInput(element, "serving_size")

const showInsight = async (element: RobotoffNutrientExtractionForm, id: string) => {
  element.insight = createInsight(id)
  element.onUpdateInsight()
  await elementUpdated(element)
}

describe("robotoff-nutrient-extraction-form", () => {
  it("resets the serving size typed for the previous product", async () => {
    const element = await fixture<RobotoffNutrientExtractionForm>(
      html`<robotoff-nutrient-extraction-form
        .insight=${createInsight("first-product")}
      ></robotoff-nutrient-extraction-form>`
    )
    getServingSizeInput(element).value = "30 g"

    await showInsight(element, "second-product")

    expect(getServingSizeInput(element).value).toBe("")
  })

  it("resets the nutrient values typed for the previous product", async () => {
    const element = await fixture<RobotoffNutrientExtractionForm>(
      html`<robotoff-nutrient-extraction-form
        .insight=${createInsight("first-product")}
      ></robotoff-nutrient-extraction-form>`
    )
    getInput(element, "salt_100g").value = "1.2"

    await showInsight(element, "second-product")

    expect(getInput(element, "salt_100g").value).toBe("")
  })

  it("keeps the serving size typed for the current product when re-rendering", async () => {
    const element = await fixture<RobotoffNutrientExtractionForm>(
      html`<robotoff-nutrient-extraction-form
        .insight=${createInsight("first-product")}
      ></robotoff-nutrient-extraction-form>`
    )
    getServingSizeInput(element).value = "30 g"

    element.requestUpdate()
    await elementUpdated(element)

    expect(getServingSizeInput(element).value).toBe("30 g")
  })
})
