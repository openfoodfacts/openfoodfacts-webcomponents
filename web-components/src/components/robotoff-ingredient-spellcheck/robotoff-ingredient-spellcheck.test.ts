import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { fetchProduct } from "../../api/openfoodfacts"
import { ingredientSpellcheckInsights } from "../../signals/ingredient-spellcheck"
import type { BaseProductResponse, ImageIngredientsProductType } from "../../types/openfoodfacts"
import type { IngredientSpellcheckInsight } from "../../types/robotoff"
import type { RobotoffIngredientSpellcheck } from "./robotoff-ingredient-spellcheck"

vi.mock("../../api/openfoodfacts", () => ({ fetchProduct: vi.fn() }))

beforeAll(async () => {
  await import("./robotoff-ingredient-spellcheck")
})

const insight = (id: string): IngredientSpellcheckInsight =>
  ({ id, barcode: id, data: { lang: "en" } }) as IngredientSpellcheckInsight

const component = () =>
  document.createElement("robotoff-ingredient-spellcheck") as RobotoffIngredientSpellcheck

const productResponse = (
  imageUrl: string,
  name: string
): BaseProductResponse<ImageIngredientsProductType> => ({
  code: "123",
  status: 1,
  status_verbose: "product found",
  product: { schema_version: 1, image_ingredients_url: imageUrl, product_name: name },
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe("robotoff-ingredient-spellcheck", () => {
  it("does not replace the current product image with a slower previous request", async () => {
    const first = insight("first")
    const second = insight("second")
    ingredientSpellcheckInsights.setItem(first.id, first)
    ingredientSpellcheckInsights.setItem(second.id, second)

    let resolveFirst: (value: BaseProductResponse<ImageIngredientsProductType>) => void
    const firstProduct = new Promise<BaseProductResponse<ImageIngredientsProductType>>(
      (resolve) => {
        resolveFirst = resolve
      }
    )
    vi.mocked(fetchProduct)
      .mockReturnValueOnce(firstProduct as never)
      .mockResolvedValueOnce(productResponse("second.jpg", "Second product") as never)

    const element = component()
    ;(element as unknown as { _insightIds: string[] })._insightIds = [first.id, second.id]
    const firstRequest = element.updateIngredientsImageUrl(first)
    ;(element as unknown as { _currentIndex: number })._currentIndex = 1
    await element.updateIngredientsImageUrl(second)
    resolveFirst!(productResponse("first.jpg", "First product"))
    await firstRequest

    expect((element as unknown as { productData: unknown }).productData).toEqual({
      imageUrl: "second.jpg",
      name: "Second product",
    })
  })

  it("keeps the correction available when the product image request fails", async () => {
    const current = insight("current")
    ingredientSpellcheckInsights.setItem(current.id, current)
    vi.mocked(fetchProduct).mockRejectedValueOnce(new Error("Product API unavailable"))
    vi.spyOn(console, "error").mockImplementation(() => {})

    const element = component()
    ;(element as unknown as { _insightIds: string[] })._insightIds = [current.id]
    await element.updateIngredientsImageUrl(current)

    expect((element as unknown as { productData: unknown }).productData).toEqual({})
  })
})
