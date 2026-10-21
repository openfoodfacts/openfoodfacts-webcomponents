import { beforeAll, describe, expect, it } from "vitest"
import { render } from "lit"
import type { NutrientsInsight } from "../../types/robotoff"
import { languageCode } from "../../signals/app"

beforeAll(async () => {
  await import("./robotoff-nutrient-extraction")
})

describe("robotoff-nutrient-extraction", () => {
  it("shows the upload date for the exact source image being annotated", async () => {
    languageCode.set("en")
    const { RobotoffNutrientExtraction } = await import("./robotoff-nutrient-extraction")
    const element = new RobotoffNutrientExtraction()
    ;(element as unknown as { nutrimentsData: unknown }).nutrimentsData = {
      images: { "2": { uploaded_t: 1733342447 } },
    }
    const container = document.createElement("div")

    render(
      element.renderImage({ source_image: "/920/347/004/8140/2.jpg" } as NutrientsInsight),
      container
    )

    const date = container.querySelector("time")
    expect(date?.getAttribute("datetime")).toBe("2024-12-04T20:00:47.000Z")
    expect(date?.textContent).toContain("Photo uploaded on")
  })
})
