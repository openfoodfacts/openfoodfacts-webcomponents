import { describe, expect, it, vi } from "vitest"
import { elementUpdated, fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import { fetchPackagingSuggestions } from "../../api/taxonomies"
import { countryCode, languageCode } from "../../signals/app"
import { openfoodfactsApiUrl } from "../../signals/openfoodfacts"
import type { AutocompleteInput } from "../shared/autocomplete-input"
import { PackagingInput } from "./packaging-input"

vi.mock("../../api/taxonomies", () => ({
  fetchPackagingSuggestions: vi.fn(),
}))

describe("packaging input taxonomy search", () => {
  it.each(["shape", "material"])("waits for composition to end in %s", async (field) => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{}]
    await elementUpdated(editor)
    const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
      `[data-taxonomy-field="${field}"]`
    )!
    await elementUpdated(autocomplete)
    const input = autocomplete.shadowRoot!.querySelector("input")!
    const change = vi.fn()
    editor.addEventListener("packaging-change", change)
    vi.mocked(fetchPackagingSuggestions).mockReset().mockResolvedValue([])
    vi.useFakeTimers()
    try {
      input.value = "b"
      input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
      input.dispatchEvent(
        new CompositionEvent("compositionstart", { bubbles: true, composed: true })
      )
      input.value = "bo"
      input.dispatchEvent(
        new InputEvent("input", { bubbles: true, composed: true, isComposing: true })
      )
      await vi.advanceTimersByTimeAsync(500)
      expect(fetchPackagingSuggestions).not.toHaveBeenCalled()
      input.value = "bottle"
      input.dispatchEvent(
        new InputEvent("input", { bubbles: true, composed: true, isComposing: true })
      )
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, composed: true }))
      input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
      await vi.advanceTimersByTimeAsync(249)
      expect(fetchPackagingSuggestions).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)
      expect(fetchPackagingSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({ text: "bottle" })
      )
      expect(change).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })
  it("requests shape suggestions when the shape field receives focus", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{ shape: { lc_name: "Bottle" } }]
    await elementUpdated(editor)

    vi.mocked(fetchPackagingSuggestions).mockResolvedValue(["Bottle"])

    const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    await elementUpdated(autocomplete)

    const input = autocomplete.shadowRoot!.querySelector("input")!

    vi.useFakeTimers()
    input.dispatchEvent(new FocusEvent("focusin", { bubbles: true, composed: true }))
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(autocomplete)

    expect(fetchPackagingSuggestions).toHaveBeenCalledWith({
      taxonomy: "packaging_shapes",
      text: "Bottle",
      language: languageCode.get(),
      country: countryCode.get(),
      apiUrl: openfoodfactsApiUrl.get(),
    })

    expect(autocomplete.suggestions).toEqual([{ value: "Bottle" }])
  })
  it("shows loading and then an empty-result message", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{}]
    await elementUpdated(editor)

    let resolveRequest!: (suggestions: string[]) => void
    const request = new Promise<string[]>((resolve) => {
      resolveRequest = resolve
    })

    vi.mocked(fetchPackagingSuggestions).mockReturnValueOnce(request)

    const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    await elementUpdated(autocomplete)

    const input = autocomplete.shadowRoot!.querySelector("input")!

    vi.useFakeTimers()
    input.dispatchEvent(new FocusEvent("focusin", { bubbles: true, composed: true }))
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)

    const status = editor.shadowRoot!.querySelector<HTMLElement>('[data-search-status="shape"]')!

    expect(status.textContent?.trim()).toBe("Searching for suggestions...")

    resolveRequest([])
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)

    expect(status.textContent?.trim()).toBe("No suggestions found.")
  })
  it("shows an error when material suggestions fail", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{ material: { lc_name: "Plastic" } }]
    await elementUpdated(editor)

    vi.mocked(fetchPackagingSuggestions).mockRejectedValueOnce(new Error("Network error"))

    const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="material"]'
    )!
    await elementUpdated(autocomplete)

    const input = autocomplete.shadowRoot!.querySelector("input")!

    vi.useFakeTimers()
    input.dispatchEvent(new FocusEvent("focusin", { bubbles: true, composed: true }))
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)

    const status = editor.shadowRoot!.querySelector<HTMLElement>('[data-search-status="material"]')!

    expect(status.textContent?.trim()).toBe("Could not load suggestions.")
    expect(autocomplete.value).toBe("Plastic")
    expect(editor.packagings).toEqual([{ material: { lc_name: "Plastic" } }])
  })
  it.each([
    { field: "shape", text: "Bottle", result: "Bottle" },
    { field: "material", text: "Plastic", result: "Plastic" },
  ] as const)("retries $field suggestions after an error", async ({ field, text, result }) => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{ [field]: { lc_name: text } }]
    await elementUpdated(editor)

    vi.mocked(fetchPackagingSuggestions)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce([result])

    const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
      `[data-taxonomy-field="${field}"]`
    )!
    await elementUpdated(autocomplete)

    const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!

    vi.useFakeTimers()

    // Focusing starts the first search, which will fail.
    input.focus()
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)

    const retryButton = editor.shadowRoot!.querySelector<HTMLButtonElement>(
      `[data-retry="${field}"]`
    )
    expect(retryButton).not.toBeNull()

    // Leaving the page for DevTools must preserve the error and retry action.
    input.blur()
    await elementUpdated(editor)
    expect(editor.shadowRoot!.querySelector(`[data-retry="${field}"]`)).toBe(retryButton)

    // Returning from DevTools can restore input focus before the pointer click.
    input.focus()
    await elementUpdated(editor)
    expect(editor.shadowRoot!.querySelector(`[data-retry="${field}"]`)).toBe(retryButton)

    // Simulate navigating to the button with the keyboard.
    retryButton!.focus()
    await elementUpdated(editor)
    expect(editor.shadowRoot!.querySelector(`[data-retry="${field}"]`)).not.toBeNull()

    retryButton!.blur()
    await elementUpdated(editor)
    expect(editor.shadowRoot!.querySelector(`[data-retry="${field}"]`)).toBe(retryButton)

    // Clicking returns focus to the field and starts another search.
    retryButton!.focus()
    retryButton!.click()
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(autocomplete)

    expect(fetchPackagingSuggestions).toHaveBeenLastCalledWith({
      taxonomy: field === "shape" ? "packaging_shapes" : "packaging_materials",
      text,
      language: languageCode.get(),
      country: countryCode.get(),
      apiUrl: openfoodfactsApiUrl.get(),
    })
    expect(autocomplete.suggestions).toEqual([{ value: result }])
    expect(autocomplete.shadowRoot!.activeElement).toBe(input)
    expect(autocomplete.shadowRoot!.querySelector('[role="option"]')?.textContent?.trim()).toBe(
      result
    )
    expect(autocomplete.value).toBe(text)
    expect(editor.packagings).toEqual([{ [field]: { lc_name: text } }])
  })
  it.each([
    {
      name: "language",
      signal: languageCode,
      newValue: "es",
      optionName: "language",
    },
    {
      name: "country",
      signal: countryCode,
      newValue: "es",
      optionName: "country",
    },
    {
      name: "API server",
      signal: openfoodfactsApiUrl,
      newValue: "https://example.test",
      optionName: "apiUrl",
    },
  ] as const)(
    "restarts the active search when $name changes",
    async ({ signal, newValue, optionName }) => {
      const originalValue = signal.get()

      // Use a different value even if the environment already has the example value.
      const changedValue =
        originalValue === newValue
          ? optionName === "apiUrl"
            ? "https://another.example.test"
            : "de"
          : newValue

      const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
      editor.packagings = [{ shape: { lc_name: "Bottle" } }]
      await elementUpdated(editor)

      const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
        '[data-taxonomy-field="shape"]'
      )!
      await elementUpdated(autocomplete)

      const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!

      let resolveOld!: (suggestions: string[]) => void
      const oldRequest = new Promise<string[]>((resolve) => {
        resolveOld = resolve
      })

      vi.mocked(fetchPackagingSuggestions).mockReset()
      vi.mocked(fetchPackagingSuggestions)
        .mockReturnValueOnce(oldRequest)
        .mockResolvedValueOnce(["New suggestion"])

      vi.useFakeTimers()

      try {
        // The first request starts with the original configuration.
        input.focus()
        await vi.advanceTimersByTimeAsync(0)
        expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)

        // The configuration changes while the first request is pending.
        signal.set(changedValue)
        await Promise.resolve()
        await elementUpdated(editor)
        await vi.advanceTimersByTimeAsync(0)

        expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(2)
        expect(fetchPackagingSuggestions).toHaveBeenLastCalledWith(
          expect.objectContaining({
            taxonomy: "packaging_shapes",
            text: "Bottle",
            [optionName]: changedValue,
          })
        )

        // The new response arrives first.
        await elementUpdated(editor)
        await elementUpdated(autocomplete)
        expect(autocomplete.suggestions).toEqual([{ value: "New suggestion" }])

        // The old response arrives later and must not replace it.
        resolveOld(["Old suggestion"])
        await Promise.resolve()
        await Promise.resolve()
        await elementUpdated(editor)
        await elementUpdated(autocomplete)

        expect(autocomplete.suggestions).toEqual([{ value: "New suggestion" }])
        expect(autocomplete.value).toBe("Bottle")
      } finally {
        // Restore the configuration for the other tests.
        signal.set(originalValue)
      }
    }
  )
  it("does not show suggestions from a removed part in another part", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [
      { shape: { lc_name: "Bottle" }, weight_measured: 120 },
      { shape: { lc_name: "Cap" }, number_of_units: 2 },
    ]
    await elementUpdated(editor)

    let resolveRequest!: (suggestions: string[]) => void
    const request = new Promise<string[]>((resolve) => {
      resolveRequest = resolve
    })

    vi.mocked(fetchPackagingSuggestions).mockReset()
    vi.mocked(fetchPackagingSuggestions).mockReturnValueOnce(request)

    const firstShape = editor.shadowRoot!.querySelector<AutocompleteInput>(
      'fieldset:first-of-type [data-taxonomy-field="shape"]'
    )!
    await elementUpdated(firstShape)

    const input = firstShape.shadowRoot!.querySelector<HTMLInputElement>("input")!

    vi.useFakeTimers()

    // Start a search for the first part.
    input.focus()
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)
    expect(fetchPackagingSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({
        taxonomy: "packaging_shapes",
        text: "Bottle",
      })
    )

    // Remove the first part while the response is pending.
    const removeButton = editor.shadowRoot!.querySelector<HTMLButtonElement>(
      "fieldset:first-of-type button"
    )!
    removeButton.click()
    await elementUpdated(editor)

    expect(editor.packagings).toEqual([{ shape: { lc_name: "Cap" }, number_of_units: 2 }])

    const remainingShape = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    await elementUpdated(remainingShape)

    // The response for the removed part arrives late.
    resolveRequest(["Old Bottle suggestion"])
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(remainingShape)

    expect(remainingShape.value).toBe("Cap")
    expect(remainingShape.suggestions).toEqual([])
    expect(editor.packagings).toEqual([{ shape: { lc_name: "Cap" }, number_of_units: 2 }])
  })
  it("ignores an old response after the host replaces the packaging list", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{ shape: { lc_name: "Bottle" } }]
    await elementUpdated(editor)

    let resolveRequest!: (suggestions: string[]) => void
    const request = new Promise<string[]>((resolve) => {
      resolveRequest = resolve
    })

    vi.mocked(fetchPackagingSuggestions).mockReset()
    vi.mocked(fetchPackagingSuggestions).mockReturnValueOnce(request)

    const oldShape = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    await elementUpdated(oldShape)

    const oldInput = oldShape.shadowRoot!.querySelector<HTMLInputElement>("input")!

    vi.useFakeTimers()

    // Start a search for the bottle that has not yet returned.
    oldInput.focus()
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)

    const listener = vi.fn()
    editor.addEventListener("packaging-change", listener)

    // The host application supplies a completely new list.
    editor.packagings = [{ shape: { lc_name: "Box" }, weight_measured: 50 }]
    await elementUpdated(editor)

    const newShape = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    await elementUpdated(newShape)

    // The response for the previous bottle now arrives.
    resolveRequest(["Old Bottle suggestion"])
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(newShape)

    expect(newShape.value).toBe("Box")
    expect(newShape.suggestions).toEqual([])
    expect(editor.packagings).toEqual([{ shape: { lc_name: "Box" }, weight_measured: 50 }])
    expect(listener).not.toHaveBeenCalled()
  })
  it("ignores an old response after disconnection and can search again", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{ shape: { lc_name: "Bottle" } }]
    await elementUpdated(editor)

    let resolveOldRequest!: (suggestions: string[]) => void
    const oldRequest = new Promise<string[]>((resolve) => {
      resolveOldRequest = resolve
    })

    vi.mocked(fetchPackagingSuggestions).mockReset()
    vi.mocked(fetchPackagingSuggestions)
      .mockReturnValueOnce(oldRequest)
      .mockResolvedValueOnce(["New Bottle suggestion"])

    const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    await elementUpdated(autocomplete)

    const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!
    const container = editor.parentElement!

    vi.useFakeTimers()

    // Simulate entering the field and starting the first search.
    input.dispatchEvent(new FocusEvent("focusin", { bubbles: true, composed: true }))
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)

    const listener = vi.fn()
    editor.addEventListener("packaging-change", listener)

    // Remove the editor from the page before the response arrives.
    editor.remove()
    expect(editor.isConnected).toBe(false)

    resolveOldRequest(["Old Bottle suggestion"])
    await vi.advanceTimersByTimeAsync(0)

    // Reconnect the editor.
    container.appendChild(editor)
    await elementUpdated(editor)
    await elementUpdated(autocomplete)

    expect(autocomplete.value).toBe("Bottle")
    expect(autocomplete.suggestions).toEqual([])
    expect(editor.packagings).toEqual([{ shape: { lc_name: "Bottle" } }])
    expect(listener).not.toHaveBeenCalled()

    // Entering the field again should start another search.
    input.dispatchEvent(new FocusEvent("focusin", { bubbles: true, composed: true }))
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(autocomplete)

    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(2)
    expect(autocomplete.suggestions).toEqual([{ value: "New Bottle suggestion" }])
    expect(editor.packagings).toEqual([{ shape: { lc_name: "Bottle" } }])
    expect(listener).not.toHaveBeenCalled()
  })
  it.each([
    { field: "shape", original: "Bottle", draft: "Bottle red" },
    { field: "material", original: "Plastic", draft: "Plastic red" },
  ] as const)(
    "preserves the $field draft while suggestions are loading",
    async ({ field, original, draft }) => {
      const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
      editor.packagings = [{ [field]: { lc_name: original } }]
      await elementUpdated(editor)

      let resolveRequest!: (suggestions: string[]) => void
      const request = new Promise<string[]>((resolve) => {
        resolveRequest = resolve
      })

      vi.mocked(fetchPackagingSuggestions).mockReset()
      vi.mocked(fetchPackagingSuggestions).mockResolvedValueOnce([]).mockReturnValueOnce(request)

      const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
        `[data-taxonomy-field="${field}"]`
      )!
      await elementUpdated(autocomplete)

      const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!
      const listener = vi.fn()
      editor.addEventListener("packaging-change", listener)

      vi.useFakeTimers()

      // The initial search starts when the field receives focus.
      input.focus()
      await vi.advanceTimersByTimeAsync(0)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)

      // The user starts typing without confirming the change.
      input.value = draft
      input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(input.value).toBe(draft)
      expect(autocomplete.value).toBe(draft)
      expect(editor.packagings).toEqual([{ [field]: { lc_name: original } }])
      expect(listener).not.toHaveBeenCalled()

      // After 250 ms, the search for the typed text begins.
      await vi.advanceTimersByTimeAsync(250)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(2)
      expect(fetchPackagingSuggestions).toHaveBeenLastCalledWith(
        expect.objectContaining({ text: draft })
      )
      expect(input.value).toBe(draft)
      expect(autocomplete.value).toBe(draft)

      // When suggestions arrive, the draft should remain visible.
      resolveRequest([draft])
      await vi.advanceTimersByTimeAsync(0)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(autocomplete.suggestions).toEqual([{ value: draft }])
      expect(input.value).toBe(draft)
      expect(autocomplete.value).toBe(draft)
      expect(editor.packagings).toEqual([{ [field]: { lc_name: original } }])
      expect(listener).not.toHaveBeenCalled()

      // Leaving the field confirms the draft.
      input.blur()
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(editor.packagings).toEqual([{ [field]: { lc_name: draft } }])
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener.mock.calls[0][0].detail.packagings).toEqual([{ [field]: { lc_name: draft } }])
    }
  )
  it("does not select a suggestion when Enter is used during composition", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [{ shape: { lc_name: "Bottle" } }]
    await elementUpdated(editor)

    vi.mocked(fetchPackagingSuggestions).mockReset()
    vi.mocked(fetchPackagingSuggestions).mockResolvedValue(["Bottle"])

    const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    await elementUpdated(autocomplete)

    const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!
    const selectionListener = vi.fn()
    const changeListener = vi.fn()

    autocomplete.addEventListener("suggestion-select", selectionListener)
    editor.addEventListener("packaging-change", changeListener)

    vi.useFakeTimers()

    // A suggestion arrives when the field receives focus.
    input.focus()
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(autocomplete)

    expect(autocomplete.suggestions).toEqual([{ value: "Bottle" }])
    expect(input.getAttribute("aria-expanded")).toBe("true")

    // Highlight the suggestion with the down arrow.
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    )
    await elementUpdated(autocomplete)
    expect(input.getAttribute("aria-activedescendant")).not.toBe("")

    // Enter belongs to the composition process, not the autocomplete.
    const composingEnter = new KeyboardEvent("keydown", {
      key: "Enter",
      isComposing: true,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
    input.dispatchEvent(composingEnter)
    await elementUpdated(editor)
    await elementUpdated(autocomplete)

    expect(composingEnter.defaultPrevented).toBe(false)
    expect(selectionListener).not.toHaveBeenCalled()
    expect(changeListener).not.toHaveBeenCalled()
    expect(editor.packagings).toEqual([{ shape: { lc_name: "Bottle" } }])
    // Outside composition, Enter should select the suggestion.
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    )
    await elementUpdated(editor)
    await elementUpdated(autocomplete)

    expect(selectionListener).toHaveBeenCalledTimes(1)
    expect(editor.packagings).toEqual([{ shape: { lc_name: "Bottle" } }])
  })
  it.each([
    {
      field: "shape",
      original: "Bottle",
      oldId: "en:bottle",
      suggestion: "Bottle cap",
      method: "keyboard",
    },
    {
      field: "shape",
      original: "Bottle",
      oldId: "en:bottle",
      suggestion: "Bottle cap",
      method: "mouse",
    },
    {
      field: "material",
      original: "Plastic",
      oldId: "en:plastic",
      suggestion: "Plastic film",
      method: "keyboard",
    },
    {
      field: "material",
      original: "Plastic",
      oldId: "en:plastic",
      suggestion: "Plastic film",
      method: "mouse",
    },
  ] as const)(
    "selects a different $field suggestion using $method",
    async ({ field, original, oldId, suggestion, method }) => {
      const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)

      const source = [
        {
          [field]: { id: oldId, lc_name: original },
          weight_measured: 120,
        },
        { number_of_units: 2 },
      ]
      const originalSource = structuredClone(source)

      editor.packagings = source
      await elementUpdated(editor)

      vi.mocked(fetchPackagingSuggestions).mockReset()
      vi.mocked(fetchPackagingSuggestions).mockResolvedValue([suggestion])

      const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
        `[data-taxonomy-field="${field}"]`
      )!
      await elementUpdated(autocomplete)

      const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!
      const listener = vi.fn()
      editor.addEventListener("packaging-change", listener)

      vi.useFakeTimers()

      input.focus()
      await vi.advanceTimersByTimeAsync(0)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(fetchPackagingSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          taxonomy: field === "shape" ? "packaging_shapes" : "packaging_materials",
          text: original,
        })
      )
      expect(autocomplete.suggestions).toEqual([{ value: suggestion }])

      if (method === "keyboard") {
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "ArrowDown",
            bubbles: true,
            composed: true,
            cancelable: true,
          })
        )
        await elementUpdated(autocomplete)

        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            composed: true,
            cancelable: true,
          })
        )
      } else {
        const option = autocomplete.shadowRoot!.querySelector<HTMLElement>('[role="option"]')
        expect(option).not.toBeNull()
        option!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, composed: true }))
      }

      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      // Leaving the field should not save the same change twice.
      input.blur()
      await elementUpdated(editor)

      const expected = [
        {
          [field]: { lc_name: suggestion },
          weight_measured: 120,
        },
        { number_of_units: 2 },
      ]

      expect(editor.packagings).toEqual(expected)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener.mock.calls[0][0].detail.packagings).toEqual(expected)

      // The original data supplied by the host is not modified.
      expect(source).toEqual(originalSource)
    }
  )
  it("keeps material suggestions when an older shape response arrives", async () => {
    const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
    editor.packagings = [
      {
        shape: { id: "en:bottle", lc_name: "Bottle" },
        material: { id: "en:plastic", lc_name: "Plastic" },
      },
    ]
    await elementUpdated(editor)

    let resolveShape!: (suggestions: string[]) => void
    const shapeRequest = new Promise<string[]>((resolve) => {
      resolveShape = resolve
    })

    vi.mocked(fetchPackagingSuggestions).mockReset()
    vi.mocked(fetchPackagingSuggestions)
      .mockReturnValueOnce(shapeRequest)
      .mockResolvedValueOnce(["Plastic film"])

    const shape = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="shape"]'
    )!
    const material = editor.shadowRoot!.querySelector<AutocompleteInput>(
      '[data-taxonomy-field="material"]'
    )!
    await elementUpdated(shape)
    await elementUpdated(material)

    const shapeInput = shape.shadowRoot!.querySelector<HTMLInputElement>("input")!
    const materialInput = material.shadowRoot!.querySelector<HTMLInputElement>("input")!

    const listener = vi.fn()
    editor.addEventListener("packaging-change", listener)

    vi.useFakeTimers()

    // The shape search starts, but its response is still pending.
    shapeInput.focus()
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)
    expect(fetchPackagingSuggestions).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        taxonomy: "packaging_shapes",
        text: "Bottle",
      })
    )

    // Move to the material field and receive its suggestions.
    materialInput.focus()
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(shape)
    await elementUpdated(material)

    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(2)
    expect(fetchPackagingSuggestions).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        taxonomy: "packaging_materials",
        text: "Plastic",
      })
    )
    expect(material.suggestions).toEqual([{ value: "Plastic film" }])

    // The shape response now arrives late.
    resolveShape(["Bottle cap"])
    await vi.advanceTimersByTimeAsync(0)
    await elementUpdated(editor)
    await elementUpdated(shape)
    await elementUpdated(material)

    expect(shape.suggestions).toEqual([])
    expect(material.suggestions).toEqual([{ value: "Plastic film" }])
    expect(editor.packagings).toEqual([
      {
        shape: { id: "en:bottle", lc_name: "Bottle" },
        material: { id: "en:plastic", lc_name: "Plastic" },
      },
    ])
    expect(listener).not.toHaveBeenCalled()
  })
  it.each([
    { field: "shape", query: "bot", suggestion: "Container" },
    { field: "material", query: "pet", suggestion: "Plastic" },
  ] as const)(
    "shows and selects a $field suggestion returned by the API without a literal match",
    async ({ field, query, suggestion }) => {
      const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
      editor.packagings = [{ [field]: { lc_name: query } }]
      await elementUpdated(editor)

      vi.mocked(fetchPackagingSuggestions).mockReset()
      vi.mocked(fetchPackagingSuggestions).mockResolvedValue([suggestion])

      const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
        `[data-taxonomy-field="${field}"]`
      )!
      await elementUpdated(autocomplete)

      const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!
      const listener = vi.fn()
      editor.addEventListener("packaging-change", listener)

      vi.useFakeTimers()

      input.focus()
      await vi.advanceTimersByTimeAsync(0)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      // The mocked API received the search and returned a suggestion.
      expect(fetchPackagingSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({ text: query })
      )
      expect(autocomplete.suggestions).toEqual([{ value: suggestion }])

      // The user should be able to see and select the suggestion.
      const option = autocomplete.shadowRoot!.querySelector<HTMLElement>('[role="option"]')
      expect(option?.textContent?.trim()).toBe(suggestion)

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )
      await elementUpdated(autocomplete)

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )
      await elementUpdated(editor)

      expect(editor.packagings).toEqual([{ [field]: { lc_name: suggestion } }])
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener.mock.calls[0][0].detail.packagings).toEqual([
        { [field]: { lc_name: suggestion } },
      ])
    }
  )
  it.each([
    {
      field: "shape",
      original: "Bottle",
      oldSuggestion: "Bottle cap",
      draft: "Jar",
      newSuggestion: "Jar lid",
    },
    {
      field: "material",
      original: "Plastic",
      oldSuggestion: "Plastic film",
      draft: "Glass",
      newSuggestion: "Glass bottle",
    },
  ] as const)(
    "replaces old $field suggestions after the user changes the text",
    async ({ field, original, oldSuggestion, draft, newSuggestion }) => {
      const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
      editor.packagings = [{ [field]: { lc_name: original } }]
      await elementUpdated(editor)

      let resolveNewRequest!: (suggestions: string[]) => void
      const newRequest = new Promise<string[]>((resolve) => {
        resolveNewRequest = resolve
      })

      vi.mocked(fetchPackagingSuggestions).mockReset()
      vi.mocked(fetchPackagingSuggestions)
        .mockResolvedValueOnce([oldSuggestion])
        .mockReturnValueOnce(newRequest)

      const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
        `[data-taxonomy-field="${field}"]`
      )!
      await elementUpdated(autocomplete)

      const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!
      const listener = vi.fn()
      editor.addEventListener("packaging-change", listener)

      vi.useFakeTimers()

      // The first search displays a suggestion.
      input.focus()
      await vi.advanceTimersByTimeAsync(0)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)
      expect(autocomplete.shadowRoot!.querySelector('[role="option"]')?.textContent?.trim()).toBe(
        oldSuggestion
      )

      // The user changes the text and starts a new search.
      input.value = draft
      input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      // The previous suggestion must no longer be available.
      expect(autocomplete.suggestions).toEqual([])
      expect(autocomplete.shadowRoot!.querySelector('[role="option"]')).toBeNull()
      expect(input.value).toBe(draft)

      // The 250 ms delay ends, but the new response is still pending.
      await vi.advanceTimersByTimeAsync(250)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(2)
      expect(fetchPackagingSuggestions).toHaveBeenLastCalledWith(
        expect.objectContaining({ text: draft })
      )
      expect(autocomplete.shadowRoot!.querySelector('[role="option"]')).toBeNull()

      // The new response arrives.
      resolveNewRequest([newSuggestion])
      await vi.advanceTimersByTimeAsync(0)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(autocomplete.suggestions).toEqual([{ value: newSuggestion }])
      expect(autocomplete.shadowRoot!.querySelector('[role="option"]')?.textContent?.trim()).toBe(
        newSuggestion
      )
      expect(input.value).toBe(draft)

      // The edit has not yet been confirmed.
      expect(editor.packagings).toEqual([{ [field]: { lc_name: original } }])
      expect(listener).not.toHaveBeenCalled()
    }
  )
  it.each([
    {
      field: "shape",
      original: "Bottle",
      oldSuggestion: "Bottle cap",
      draft: "Jar",
    },
    {
      field: "material",
      original: "Plastic",
      oldSuggestion: "Plastic film",
      draft: "Glass",
    },
  ] as const)(
    "cannot select an old $field suggestion immediately after typing",
    async ({ field, original, oldSuggestion, draft }) => {
      const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
      editor.packagings = [{ [field]: { lc_name: original } }]
      await elementUpdated(editor)

      vi.mocked(fetchPackagingSuggestions).mockReset()
      vi.mocked(fetchPackagingSuggestions).mockResolvedValue([oldSuggestion])

      const autocomplete = editor.shadowRoot!.querySelector<AutocompleteInput>(
        `[data-taxonomy-field="${field}"]`
      )!
      await elementUpdated(autocomplete)

      const input = autocomplete.shadowRoot!.querySelector<HTMLInputElement>("input")!
      const selectionListener = vi.fn()
      autocomplete.addEventListener("suggestion-select", selectionListener)

      vi.useFakeTimers()

      // The initial search displays a suggestion.
      input.focus()
      await vi.advanceTimersByTimeAsync(0)
      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      expect(autocomplete.suggestions).toEqual([{ value: oldSuggestion }])
      expect(autocomplete.shadowRoot!.querySelector('[role="option"]')?.textContent?.trim()).toBe(
        oldSuggestion
      )

      // Keep a reference to the old option.
      const oldOption = autocomplete.shadowRoot!.querySelector<HTMLElement>('[role="option"]')!

      // Enter new text.
      input.value = draft
      input.dispatchEvent(new Event("input", { bubbles: true, composed: true }))

      // Clicking the old option before the update must not select it.
      oldOption.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, composed: true }))

      // Press the down arrow and Enter without waiting for an update.
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )

      await elementUpdated(editor)
      await elementUpdated(autocomplete)

      // The suggestion from the previous search must not be selected.
      expect(selectionListener).not.toHaveBeenCalled()

      // Enter confirms the typed text, not the old result.
      expect(editor.packagings).toEqual([{ [field]: { lc_name: draft } }])
    }
  )
})
