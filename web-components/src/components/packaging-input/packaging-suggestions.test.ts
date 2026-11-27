import { describe, expect, it, vi } from "vitest"
import { fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import { fetchPackagingSuggestions } from "../../api/taxonomies"
import { PackagingInput } from "./packaging-input"
import { PackagingSuggestionsController } from "./packaging-suggestions"

vi.mock("../../api/taxonomies", () => ({
  fetchPackagingSuggestions: vi.fn(),
}))

const options = {
  taxonomy: "packaging_shapes" as const,
  text: "bou",
  language: "fr",
  country: "fr",
  apiUrl: "https://example.test",
}

const makeController = async () => {
  const editor = await fixture<PackagingInput>(html`<packaging-input></packaging-input>`)
  return new PackagingSuggestionsController(editor)
}

describe("PackagingSuggestionsController", () => {
  it("waits before requesting suggestions", async () => {
    const controller = await makeController()
    vi.useFakeTimers()
    vi.mocked(fetchPackagingSuggestions).mockResolvedValue(["Bouteille"])

    controller.search(options)

    expect(controller.state).toEqual({ status: "waiting" })
    expect(fetchPackagingSuggestions).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(249)
    expect(fetchPackagingSuggestions).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(fetchPackagingSuggestions).toHaveBeenCalledWith(options)
    expect(controller.state).toEqual({
      status: "success",
      suggestions: ["Bouteille"],
    })
  })

  it("ignores an older response after a new search starts", async () => {
    const controller = await makeController()
    vi.useFakeTimers()

    let resolveOld!: (suggestions: string[]) => void
    const oldRequest = new Promise<string[]>((resolve) => {
      resolveOld = resolve
    })

    vi.mocked(fetchPackagingSuggestions)
      .mockReturnValueOnce(oldRequest)
      .mockResolvedValueOnce(["Plastic"])

    controller.search({ ...options, text: "pl" })
    await vi.advanceTimersByTimeAsync(250)

    controller.search({ ...options, text: "pla" })
    await vi.advanceTimersByTimeAsync(250)

    expect(controller.state).toEqual({
      status: "success",
      suggestions: ["Plastic"],
    })

    resolveOld(["Old result"])
    await Promise.resolve()
    await Promise.resolve()

    expect(controller.state).toEqual({
      status: "success",
      suggestions: ["Plastic"],
    })
  })

  it("reports an error without turning it into an empty result", async () => {
    const controller = await makeController()
    vi.useFakeTimers()

    const error = new Error("Network error")
    vi.mocked(fetchPackagingSuggestions).mockRejectedValue(error)

    controller.search(options)
    await vi.advanceTimersByTimeAsync(250)

    expect(controller.state).toEqual({ status: "error", error })
  })

  it("does not use a response after cancellation", async () => {
    const controller = await makeController()
    vi.useFakeTimers()

    let resolveRequest!: (suggestions: string[]) => void
    const request = new Promise<string[]>((resolve) => {
      resolveRequest = resolve
    })

    vi.mocked(fetchPackagingSuggestions).mockReturnValue(request)

    controller.search(options)
    await vi.advanceTimersByTimeAsync(250)

    controller.cancel()
    resolveRequest(["Bouteille"])
    await Promise.resolve()
    await Promise.resolve()

    expect(controller.state).toEqual({ status: "idle" })
  })
  it("ignores an older response while waiting to start the next search", async () => {
    const controller = await makeController()
    vi.useFakeTimers()

    let resolveOld!: (suggestions: string[]) => void
    const oldRequest = new Promise<string[]>((resolve) => {
      resolveOld = resolve
    })

    vi.mocked(fetchPackagingSuggestions)
      .mockReturnValueOnce(oldRequest)
      .mockResolvedValueOnce(["Plastic"])

    // Start the search for "pl".
    controller.search({ ...options, text: "pl" })
    await vi.advanceTimersByTimeAsync(250)

    // The user types "pla". The new search is still waiting for 250 ms.
    controller.search({ ...options, text: "pla" })
    expect(controller.state).toEqual({ status: "waiting" })

    // The old response arrives during the wait.
    resolveOld(["Old result"])
    await Promise.resolve()
    await Promise.resolve()

    // It must not replace the state of the new search.
    expect(controller.state).toEqual({ status: "waiting" })

    // The wait ends and the response for "pla" arrives.
    await vi.advanceTimersByTimeAsync(250)

    expect(controller.state).toEqual({
      status: "success",
      suggestions: ["Plastic"],
    })
  })
  it("ignores a response when the search is no longer current", async () => {
    const controller = await makeController()
    vi.useFakeTimers()

    let resolveRequest!: (suggestions: string[]) => void
    const request = new Promise<string[]>((resolve) => {
      resolveRequest = resolve
    })

    vi.mocked(fetchPackagingSuggestions).mockReset()
    vi.mocked(fetchPackagingSuggestions).mockReturnValueOnce(request)

    let isCurrent = true

    controller.search(options, 0, () => isCurrent)
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)
    expect(controller.state).toEqual({ status: "loading" })

    // Simulate a configuration change before the response arrives.
    isCurrent = false
    resolveRequest(["Old suggestion"])

    await vi.advanceTimersByTimeAsync(0)

    // The old response must not become a valid result.
    expect(controller.state).not.toEqual({
      status: "success",
      suggestions: ["Old suggestion"],
    })
    expect(controller.state).toEqual({ status: "loading" })
  })
  it("ignores an error when the search is no longer current", async () => {
    const controller = await makeController()
    vi.useFakeTimers()

    let rejectRequest!: (error: Error) => void
    const request = new Promise<string[]>((_resolve, reject) => {
      rejectRequest = reject
    })

    vi.mocked(fetchPackagingSuggestions).mockReset()
    vi.mocked(fetchPackagingSuggestions).mockReturnValueOnce(request)

    let isCurrent = true

    controller.search(options, 0, () => isCurrent)
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchPackagingSuggestions).toHaveBeenCalledTimes(1)
    expect(controller.state).toEqual({ status: "loading" })

    // The configuration changes and the previous request fails.
    isCurrent = false
    rejectRequest(new Error("Old network error"))

    await vi.advanceTimersByTimeAsync(0)

    // An error from the previous search must not be displayed.
    expect(controller.state).toEqual({ status: "loading" })
  })
})
