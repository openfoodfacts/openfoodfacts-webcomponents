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
  vi.spyOn(folksonomyApi, "fetchProductProperties").mockResolvedValue([])
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
    const pillsGroup = shadow.querySelector(".pills-container")
    expect(pillsGroup?.getAttribute("role")).toBe("group")
    expect(pillsGroup?.getAttribute("aria-label")).toBe("unfixable")

    const pills = shadow.querySelectorAll(".pill-btn")
    expect(pills.length).toBe(2)
    expect(pills[0].textContent?.trim()).toBe("yes")
    expect(pills[1].textContent?.trim()).toBe("no")
    expect(pills[0].getAttribute("aria-pressed")).toBe("false")

    // Click "yes"
    ;(pills[0] as HTMLButtonElement).click()
    await element.updateComplete

    expect(pills[0].classList.contains("active")).toBe(true)
    expect(pills[0].getAttribute("aria-pressed")).toBe("true")
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

  it("calls updateProductProperty when existing property is present", async () => {
    vi.spyOn(folksonomyApi, "fetchProductProperties").mockResolvedValueOnce([
      {
        k: "unfixable",
        v: "yes",
        version: 1,
        owner: "test",
        product: "3017620422003",
        editor: "test",
        last_edit: new Date().toISOString(),
        comment: "",
      },
    ])
    vi.spyOn(folksonomyApi, "updateProductProperty").mockResolvedValueOnce({
      key: "unfixable",
      value: "no",
      version: 2,
    })

    const element = document.createElement("folksonomy-property-editor") as FolksonomyPropertyEditor
    element.property = "unfixable"
    element.productCode = "3017620422003"
    element.acceptedValues = ["yes", "no"]
    document.body.appendChild(element)

    const shadow = element.shadowRoot!
    await waitUntil(
      () => shadow.querySelector(".existing-badge")?.textContent?.includes("yes"),
      "loaded existing property"
    )
    await element.updateComplete

    const pills = shadow.querySelectorAll(".pill-btn")
    ;(pills[1] as HTMLButtonElement).click()
    await element.updateComplete

    const savedListener = vi.fn()
    element.addEventListener("property-saved", savedListener)

    const ctaBtn = shadow.querySelector(".cta-btn") as HTMLButtonElement
    ctaBtn.click()

    await waitUntil(() => savedListener.mock.calls.length > 0, "property-saved event")

    expect(folksonomyApi.updateProductProperty).toHaveBeenCalledWith(
      "3017620422003",
      "unfixable",
      "no",
      1
    )
    expect(savedListener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          property: "unfixable",
          value: "no",
          version: 2,
          productCode: "3017620422003",
        },
      })
    )
  })

  it("displays lookup error and retry button when lookup fails, and recovers on retry", async () => {
    vi.spyOn(folksonomyApi, "fetchProductProperties")
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValueOnce([
        {
          k: "unfixable",
          v: "yes",
          version: 1,
          owner: "test",
          product: "3017620422003",
          editor: "test",
          last_edit: new Date().toISOString(),
          comment: "",
        },
      ])

    const element = document.createElement("folksonomy-property-editor") as FolksonomyPropertyEditor
    element.property = "unfixable"
    element.productCode = "3017620422003"
    element.acceptedValues = ["yes", "no"]
    document.body.appendChild(element)

    const shadow = element.shadowRoot!
    await waitUntil(() => shadow.querySelector(".lookup-error") !== null, "lookup-error visible")

    const ctaBtn = shadow.querySelector(".cta-btn") as HTMLButtonElement
    expect(ctaBtn.disabled).toBe(true)

    const retryBtn = shadow.querySelector(".retry-btn") as HTMLButtonElement
    expect(retryBtn).not.toBeNull()
    retryBtn.click()

    await waitUntil(
      () => shadow.querySelector(".existing-badge")?.textContent?.includes("yes"),
      "recovered after retry"
    )
    expect(shadow.querySelector(".lookup-error")).toBeNull()
  })
})
