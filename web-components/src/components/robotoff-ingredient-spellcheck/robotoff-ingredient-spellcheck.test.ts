import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "lit"
import { fetchProduct, unselectProductImage } from "../../api/openfoodfacts"
import robotoff from "../../api/robotoff"
import { EventState, EventType } from "../../constants"
import { ingredientSpellcheckInsights } from "../../signals/ingredient-spellcheck"
import type {
  RobotoffIngredientsStateEventDetail,
  TextCorrectorEvent,
} from "../../types/ingredient-spellcheck"
import { AnnotationAnswer, type IngredientSpellcheckInsight } from "../../types/robotoff"
import { RobotoffIngredientSpellcheck } from "./robotoff-ingredient-spellcheck"

vi.mock("../../api/openfoodfacts", () => ({
  fetchProduct: vi.fn(),
  unselectProductImage: vi.fn(),
}))
vi.mock("../../api/robotoff", () => ({
  default: { annotateIngredientSpellcheck: vi.fn() },
}))

const firstInsight = {
  id: "first",
  barcode: "123",
  source_image: "raw-ingredient-image-id",
  data: { lang: "fr" },
} as IngredientSpellcheckInsight
const secondInsight = {
  id: "second",
  barcode: "456",
  source_image: "another-raw-id",
  data: { lang: "en" },
} as IngredientSpellcheckInsight

function makeElement(insights = [firstInsight]) {
  const element = new RobotoffIngredientSpellcheck()
  for (const insight of insights) {
    ingredientSpellcheckInsights.setItem(insight.id, insight)
  }
  ;(element as any)._insightIds = insights.map((insight) => insight.id)
  vi.spyOn(element, "showToast")
  return element
}

function collectStates(element: RobotoffIngredientSpellcheck) {
  const states: RobotoffIngredientsStateEventDetail[] = []
  element.addEventListener(EventType.INGREDIENT_SPELLCHECK_STATE, (event) => {
    states.push((event as CustomEvent<RobotoffIngredientsStateEventDetail>).detail)
  })
  return states
}

function pendingRequest<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.mocked(fetchProduct).mockReset()
  vi.mocked(unselectProductImage).mockReset()
  vi.mocked(robotoff.annotateIngredientSpellcheck).mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("robotoff-ingredient-spellcheck", () => {
  it("flags the source image ID rather than an ID derived from the product image URL", () => {
    const element = makeElement()
    ;(element as any).productData = { imageUrl: "https://example.com/ingredients_fr.400.jpg" }
    const container = document.createElement("div")

    render(element.renderImage(), container)

    expect((container.querySelector("nutripatrol-flag-form") as any).imageId).toBe(
      firstInsight.source_image
    )
  })

  it("caches a stale fetch without replacing the current insight's product data", async () => {
    const element = makeElement([firstInsight, secondInsight])
    const oldRequest = pendingRequest<{
      product: { image_ingredients_url: string; product_name: string }
    }>()
    vi.mocked(fetchProduct).mockReturnValueOnce(oldRequest.promise as never)

    const fetchOld = element.updateIngredientsImageUrl(firstInsight)
    ;(element as any)._currentIndex = 1
    ;(element as any).productData = { imageUrl: "current.jpg" }
    oldRequest.resolve({ product: { image_ingredients_url: "old.jpg", product_name: "Old" } })
    await fetchOld

    expect((element as any).productData.imageUrl).toBe("current.jpg")
    expect((element as any)._productDataCache.get(firstInsight.barcode).imageUrl).toBe("old.jpg")
  })

  it("does not clear the current insight's product data when a stale fetch fails", async () => {
    const element = makeElement([firstInsight, secondInsight])
    const oldRequest = pendingRequest<never>()
    vi.mocked(fetchProduct).mockReturnValueOnce(oldRequest.promise)

    const fetchOld = element.updateIngredientsImageUrl(firstInsight)
    ;(element as any)._currentIndex = 1
    ;(element as any).productData = { imageUrl: "current.jpg" }
    oldRequest.reject(new Error("fetch failed"))
    await fetchOld

    expect((element as any).productData.imageUrl).toBe("current.jpg")
  })

  it("advances optimistically but waits for annotation success before reporting completion", async () => {
    const element = makeElement()
    const states = collectStates(element)
    const request = pendingRequest<never>()
    vi.mocked(robotoff.annotateIngredientSpellcheck).mockReturnValueOnce(request.promise)

    element.submitAnnotation({
      detail: { annotation: AnnotationAnswer.ACCEPT },
    } as TextCorrectorEvent)

    expect(element.allInsightsAreAnswered).toBe(true)
    expect(states).toEqual([])
    expect(element.showToast).not.toHaveBeenCalled()
    request.resolve(undefined as never)
    await vi.waitFor(() => expect(states).toHaveLength(2))

    expect(states.map(({ state }) => state)).toEqual([EventState.ANNOTATED, EventState.FINISHED])
    expect(states[1].insightId).toBe(firstInsight.id)
    expect(element.showToast).toHaveBeenCalledWith("Correction saved!")
  })

  it("reports an error without completion when annotation fails", async () => {
    const element = makeElement()
    const states = collectStates(element)
    vi.mocked(robotoff.annotateIngredientSpellcheck).mockRejectedValueOnce(new Error("failed"))

    element.submitAnnotation({
      detail: { annotation: AnnotationAnswer.SKIP },
    } as TextCorrectorEvent)
    await vi.waitFor(() => expect(states).toHaveLength(1))

    expect(states[0]).toMatchObject({ state: EventState.ERROR, insightId: firstInsight.id })
    expect(element.showToast).toHaveBeenCalledWith("Error saving annotation", 4000)
    expect(element.showToast).not.toHaveBeenCalledWith("Skipped")
  })

  it("requires confirmation before unselecting an image", async () => {
    const element = makeElement()
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false)
    )

    await element.onUnselectImage()

    expect(unselectProductImage).not.toHaveBeenCalled()
    expect(robotoff.annotateIngredientSpellcheck).not.toHaveBeenCalled()
    expect(element.allInsightsAreAnswered).toBe(false)
  })

  it("invalidates image data and reports a successful skip before completion", async () => {
    const element = makeElement()
    const states = collectStates(element)
    ;(element as any)._productDataCache.set(firstInsight.barcode, { imageUrl: "stale.jpg" })
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true)
    )
    vi.mocked(unselectProductImage).mockResolvedValueOnce({} as never)
    vi.mocked(robotoff.annotateIngredientSpellcheck).mockResolvedValueOnce({} as never)

    await element.onUnselectImage()

    expect(unselectProductImage).toHaveBeenCalledWith(firstInsight.barcode, "ingredients_fr")
    expect((element as any)._productDataCache.has(firstInsight.barcode)).toBe(false)
    expect(robotoff.annotateIngredientSpellcheck).toHaveBeenCalledWith(
      firstInsight.id,
      AnnotationAnswer.SKIP
    )
    expect(states.map(({ state }) => state)).toEqual([EventState.ANNOTATED, EventState.FINISHED])
    expect(states[1].insightId).toBe(firstInsight.id)
  })

  it("catches skip annotation failures without reporting completion", async () => {
    const element = makeElement()
    const states = collectStates(element)
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true)
    )
    vi.mocked(unselectProductImage).mockResolvedValueOnce({} as never)
    vi.mocked(robotoff.annotateIngredientSpellcheck).mockRejectedValueOnce(new Error("failed"))

    await element.onUnselectImage()

    expect(console.error).toHaveBeenCalledWith("Failed to submit annotation:", expect.any(Error))
    expect(states.map(({ state }) => state)).toEqual([EventState.ERROR])
  })

  it("does not finish on a delayed skip for an earlier insight", async () => {
    const element = makeElement([firstInsight, secondInsight])
    const states = collectStates(element)
    const firstRequest = pendingRequest<never>()
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true)
    )
    vi.mocked(unselectProductImage).mockResolvedValueOnce({} as never)
    vi.mocked(fetchProduct).mockResolvedValueOnce({ product: {} } as never)
    vi.mocked(robotoff.annotateIngredientSpellcheck)
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce({} as never)

    const skipFirst = element.onUnselectImage()
    await vi.waitFor(() =>
      expect(robotoff.annotateIngredientSpellcheck).toHaveBeenCalledWith(
        firstInsight.id,
        AnnotationAnswer.SKIP
      )
    )
    element.submitAnnotation({
      detail: { annotation: AnnotationAnswer.ACCEPT },
    } as TextCorrectorEvent)
    await vi.waitFor(() =>
      expect(states.some(({ state }) => state === EventState.FINISHED)).toBe(true)
    )
    firstRequest.resolve(undefined as never)
    await skipFirst

    expect(states.filter(({ state }) => state === EventState.FINISHED)).toEqual([
      expect.objectContaining({ insightId: secondInsight.id }),
    ])
  })
})
