import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import folksonomyApi from "../../api/folksonomy"
import type { FolksonomyEditor } from "./folksonomy-editor"

vi.mock("../../api/folksonomy", () => ({
  default: { fetchProductProperties: vi.fn() },
}))

beforeAll(async () => {
  await import("./folksonomy-editor")
})

beforeEach(() => {
  vi.mocked(folksonomyApi.fetchProductProperties).mockResolvedValue([])
})

describe("folksonomy-editor", () => {
  it("falls back to safe links when configured URLs use an unsafe protocol", async () => {
    const element = document.createElement("folksonomy-editor") as FolksonomyEditor
    element.viewOnly = true
    element.loginUrl = "javascript:alert('login')"
    element.propertiesBaseUrl = "javascript:alert('properties')"
    element.propertiesDocumentationUrl = "javascript:alert('documentation')"
    element.folksonomyEngineUrl = "javascript:alert('project')"
    document.body.appendChild(element)
    await element.updateComplete

    const links = Array.from(element.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a") ?? [])
    expect(links).toHaveLength(4)
    expect(links.every((link) => new URL(link.href).protocol !== "javascript:")).toBe(true)
    expect(new URL(links[0].href).pathname).toBe("/properties")
    expect(new URL(links[3].href).pathname).toBe("/cgi/login.pl")

    element.remove()
  })
})
