import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { waitUntil } from "@open-wc/testing-helpers"
import type { FolksonomyPropertyEditor } from "./folksonomy-property-editor"
import folksonomyApi from "../../api/folksonomy"

beforeAll(async () => {
  await import("./folksonomy-property-editor")
})

beforeEach(() => {
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

describe("folksonomy-property-editor", () => {
  it("renders property title and custom call-to-action button", async () => {
    const element = document.createElement("folksonomy-property-editor") as FolksonomyPropertyEditor
    element.property = "unfixable"
    element.productCode = "3017620422003"
    element.title = "Data Quality Flag"
    element.callToAction = "Mark as unfixable"
    document.body.appendChild(element)

    await element.updateComplete

    const shadow = element.shadowRoot!
    const titleEl = shadow.querySelector(".title")
    expect(titleEl?.textContent?.trim()).toBe("Data Quality Flag")

    const ctaBtn = shadow.querySelector(".cta-btn")
    expect(ctaBtn?.textContent?.trim()).toBe("Mark as unfixable")
  })

  it("renders pills for boolean accepted values and updates selection", async () => {
    const element = document.createElement("folksonomy-property-editor") as FolksonomyPropertyEditor
    element.property = "unfixable"
    element.productCode = "3017620422003"
    element.acceptedValues = ["yes", "no"]
    document.body.appendChild(element)

    await element.updateComplete

    const shadow = element.shadowRoot!
    const pills = shadow.querySelectorAll(".pill-btn")
    expect(pills.length).toBe(2)
    expect(pills[0].textContent?.trim()).toBe("yes")
    expect(pills[1].textContent?.trim()).toBe("no")

    // Click "yes"
    ;(pills[0] as HTMLButtonElement).click()
    await element.updateComplete

    expect(pills[0].classList.contains("active")).toBe(true)
  })

  it("renders text input when no accepted-values are passed", async () => {
    const element = document.createElement("folksonomy-property-editor") as FolksonomyPropertyEditor
    element.property = "region"
    element.productCode = "3017620422003"
    document.body.appendChild(element)

    await element.updateComplete

    const shadow = element.shadowRoot!
    const textInput = shadow.querySelector('input[type="text"]')
    expect(textInput).not.toBeNull()
  })

  it("calls addProductProperty on save and dispatches property-saved event", async () => {
    vi.spyOn(folksonomyApi, "addProductProperty").mockResolvedValueOnce({
      key: "unfixable",
      value: "yes",
      version: 1,
    })

    const element = document.createElement("folksonomy-property-editor") as FolksonomyPropertyEditor
    element.property = "unfixable"
    element.productCode = "3017620422003"
    element.acceptedValues = ["yes", "no"]
    document.body.appendChild(element)

    await element.updateComplete

    const shadow = element.shadowRoot!
    const pills = shadow.querySelectorAll(".pill-btn")
    ;(pills[0] as HTMLButtonElement).click()
    await element.updateComplete

    const savedListener = vi.fn()
    element.addEventListener("property-saved", savedListener)

    const ctaBtn = shadow.querySelector(".cta-btn") as HTMLButtonElement
    ctaBtn.click()

    await waitUntil(() => savedListener.mock.calls.length > 0, "property-saved event")

    expect(folksonomyApi.addProductProperty).toHaveBeenCalledWith(
      "3017620422003",
      "unfixable",
      "yes",
      1
    )
    expect(savedListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          property: "unfixable",
          value: "yes",
          version: 1,
          productCode: "3017620422003",
        },
      })
    )
  })
})
