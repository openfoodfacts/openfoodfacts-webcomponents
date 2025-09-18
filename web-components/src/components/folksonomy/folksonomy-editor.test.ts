import { describe, it, expect, vi, beforeEach } from "vitest"
import { html } from "lit"
import { fixture } from "@open-wc/testing"
import "./folksonomy-editor"
import type { FolksonomyEditor } from "./folksonomy-editor"

// Mock the folksonomy API
vi.mock("../../api/folksonomy", () => ({
  default: {
    fetchProductProperties: vi.fn(),
  },
}))

// Mock the folksonomy-editor-row component
customElements.define("folksonomy-editor-row", class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<tr><td>${this.getAttribute("key") || ""}</td><td>${this.getAttribute("value") || ""}</td><td>Actions</td></tr>`
  }
})

describe("FolksonomyEditor", () => {
  let element: FolksonomyEditor
  let mockApi: any

  beforeEach(async () => {
    mockApi = (await import("../../api/folksonomy")).default
    vi.clearAllMocks()
    
    // Default mock implementation
    mockApi.fetchProductProperties.mockResolvedValue([
      { k: "organic", v: "yes", version: 1 },
      { k: "packaging", v: "recyclable", version: 2 },
    ])
  })

  describe("initialization", () => {
    it("should render with default properties", async () => {
      element = await fixture(html`<folksonomy-editor></folksonomy-editor>`)
      
      expect(element).toBeDefined()
      expect(element.productCode).toBe("")
      expect(element.pageType).toBe("view")
      expect(element.properties).toEqual([])
    })

    it("should accept attributes", async () => {
      element = await fixture(html`
        <folksonomy-editor
          product-code="1234567890123"
          page-type="edit"
          properties-base-url="/custom-properties"
          folksonomy-engine-url="https://custom.example.com"
        ></folksonomy-editor>
      `)
      
      expect(element.productCode).toBe("1234567890123")
      expect(element.pageType).toBe("edit")
      expect(element.propertiesBaseUrl).toBe("/custom-properties")
      expect(element.folksonomyEngineUrl).toBe("https://custom.example.com")
    })

    it("should fetch properties on connection", async () => {
      element = await fixture(html`
        <folksonomy-editor product-code="1234567890123"></folksonomy-editor>
      `)
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockApi.fetchProductProperties).toHaveBeenCalledWith("1234567890123")
      expect(element.properties).toEqual([
        { key: "organic", value: "yes", version: 1 },
        { key: "packaging", value: "recyclable", version: 2 },
      ])
    })

    it("should handle empty product code gracefully", async () => {
      element = await fixture(html`<folksonomy-editor product-code=""></folksonomy-editor>`)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockApi.fetchProductProperties).toHaveBeenCalledWith("")
    })
  })

  describe("data fetching", () => {
    beforeEach(async () => {
      element = await fixture(html`
        <folksonomy-editor product-code="123"></folksonomy-editor>
      `)
    })

    it("should handle successful API response", async () => {
      const mockProperties = [
        { k: "vegan", v: "yes", version: 3 },
        { k: "gluten-free", v: "no", version: 1 },
      ]
      mockApi.fetchProductProperties.mockResolvedValue(mockProperties)
      
      // Trigger refetch
      await (element as any).fetchAndLogFolksonomyKeys()
      
      expect(element.properties).toEqual([
        { key: "gluten-free", value: "no", version: 1 }, // Sorted alphabetically
        { key: "vegan", value: "yes", version: 3 },
      ])
    })

    it("should handle API errors gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      mockApi.fetchProductProperties.mockRejectedValue(new Error("Network error"))
      
      await (element as any).fetchAndLogFolksonomyKeys()
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching folksonomy keys:",
        expect.any(Error)
      )
      expect(element.properties).toEqual([])
    })

    it("should handle malformed API response", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      mockApi.fetchProductProperties.mockResolvedValue(null)
      
      await (element as any).fetchAndLogFolksonomyKeys()
      
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it("should handle response with missing properties", async () => {
      mockApi.fetchProductProperties.mockResolvedValue([
        { k: "complete", v: "yes", version: 1 },
        { k: "missing-value", version: 1 }, // Missing 'v'
        { v: "orphan-value", version: 1 }, // Missing 'k'
        {}, // Empty object
      ])
      
      await (element as any).fetchAndLogFolksonomyKeys()
      
      expect(element.properties).toHaveLength(4)
      expect(element.properties[0]).toEqual({ key: "", value: "orphan-value", version: 1 })
      expect(element.properties[1]).toEqual({ key: "", value: undefined, version: 1 })
      expect(element.properties[2]).toEqual({ key: "complete", value: "yes", version: 1 })
      expect(element.properties[3]).toEqual({ key: "missing-value", value: undefined, version: 1 })
    })
  })

  describe("sorting functionality", () => {
    beforeEach(async () => {
      element = await fixture(html`<folksonomy-editor></folksonomy-editor>`)
      element.properties = [
        { key: "zebra", value: "animal", version: 1 },
        { key: "apple", value: "fruit", version: 1 },
        { key: "banana", value: "yellow", version: 1 },
      ]
    })

    it("should sort by key ascending by default", () => {
      ;(element as any).sortProperties()
      
      expect(element.properties.map(p => p.key)).toEqual(["apple", "banana", "zebra"])
    })

    it("should toggle sort direction when clicking same column", () => {
      // First click - should be asc (default)
      ;(element as any).handleSort("key")
      expect((element as any).sortDirection).toBe("asc")
      expect(element.properties.map(p => p.key)).toEqual(["apple", "banana", "zebra"])
      
      // Second click - should be desc
      ;(element as any).handleSort("key")
      expect((element as any).sortDirection).toBe("desc")
      expect(element.properties.map(p => p.key)).toEqual(["zebra", "banana", "apple"])
    })

    it("should change sort column and reset to ascending", () => {
      // Start with key sorting desc
      ;(element as any).sortColumn = "key"
      ;(element as any).sortDirection = "desc"
      
      // Click value column
      ;(element as any).handleSort("value")
      
      expect((element as any).sortColumn).toBe("value")
      expect((element as any).sortDirection).toBe("asc")
      expect(element.properties.map(p => p.value)).toEqual(["animal", "fruit", "yellow"])
    })

    it("should handle sorting with special characters and numbers", () => {
      element.properties = [
        { key: "10-items", value: "numeric", version: 1 },
        { key: "2-items", value: "also-numeric", version: 1 },
        { key: "special-chars!@#", value: "symbols", version: 1 },
        { key: "ñandú", value: "accented", version: 1 },
      ]
      
      ;(element as any).sortProperties()
      
      // Should use numeric and locale-aware sorting
      expect(element.properties.map(p => p.key)).toEqual([
        "2-items",
        "10-items", 
        "ñandú",
        "special-chars!@#"
      ])
    })

    it("should handle empty and undefined values in sorting", () => {
      element.properties = [
        { key: "defined", value: "value", version: 1 },
        { key: "empty", value: "", version: 1 },
        { key: "undefined", value: undefined as any, version: 1 },
      ]
      
      ;(element as any).sortProperties()
      
      // Should not throw and should handle undefined gracefully
      expect(element.properties).toHaveLength(3)
      expect(element.properties.map(p => p.key)).toEqual(["defined", "empty", "undefined"])
    })
  })

  describe("event handling", () => {
    beforeEach(async () => {
      element = await fixture(html`<folksonomy-editor></folksonomy-editor>`)
      element.properties = [
        { key: "existing", value: "value", version: 1 }
      ]
    })

    it("should handle row addition", () => {
      const addEvent = new CustomEvent("add-row", {
        detail: { key: "new-key", value: "new-value" }
      })
      
      element.dispatchEvent(addEvent)
      
      expect(element.properties).toContainEqual({
        key: "new-key",
        value: "new-value", 
        version: 1
      })
    })

    it("should handle row addition with missing data", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      const originalLength = element.properties.length
      
      // Missing key
      const addEvent1 = new CustomEvent("add-row", {
        detail: { value: "new-value" }
      })
      element.dispatchEvent(addEvent1)
      
      // Missing value  
      const addEvent2 = new CustomEvent("add-row", {
        detail: { key: "new-key" }
      })
      element.dispatchEvent(addEvent2)
      
      expect(element.properties).toHaveLength(originalLength)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
    })

    it("should handle row updates", () => {
      const updateEvent = new CustomEvent("update-row", {
        detail: { key: "existing", value: "updated-value", version: 2 }
      })
      
      element.dispatchEvent(updateEvent)
      
      const updatedProperty = element.properties.find(p => p.key === "existing")
      expect(updatedProperty).toEqual({
        key: "existing",
        value: "updated-value",
        version: 2
      })
    })

    it("should handle updates to non-existing keys", () => {
      const originalLength = element.properties.length
      
      const updateEvent = new CustomEvent("update-row", {
        detail: { key: "non-existing", value: "value", version: 1 }
      })
      
      element.dispatchEvent(updateEvent)
      
      // Should not add new property, just ignore
      expect(element.properties).toHaveLength(originalLength)
    })

    it("should handle row deletion", () => {
      const deleteEvent = new CustomEvent("delete-row", {
        detail: { key: "existing" }
      })
      
      element.dispatchEvent(deleteEvent)
      
      expect(element.properties).not.toContainEqual(
        expect.objectContaining({ key: "existing" })
      )
    })

    it("should handle deletion of non-existing keys", () => {
      const originalLength = element.properties.length
      
      const deleteEvent = new CustomEvent("delete-row", {
        detail: { key: "non-existing" }
      })
      
      element.dispatchEvent(deleteEvent)
      
      expect(element.properties).toHaveLength(originalLength)
    })
  })

  describe("rendering", () => {
    beforeEach(async () => {
      element = await fixture(html`
        <folksonomy-editor 
          product-code="123"
          page-type="edit"
        ></folksonomy-editor>
      `)
    })

    it("should render the main structure", () => {
      const section = element.shadowRoot?.querySelector("section")
      const h2 = element.shadowRoot?.querySelector("h2")
      const form = element.shadowRoot?.querySelector("form")
      
      expect(section).toBeTruthy()
      expect(h2).toBeTruthy()
      expect(form).toBeTruthy()
    })

    it("should render table headers with sort functionality", () => {
      const headers = element.shadowRoot?.querySelectorAll("th.sortable")
      
      expect(headers).toHaveLength(2)
      expect(headers?.[0]?.textContent).toContain("Property")
      expect(headers?.[1]?.textContent).toContain("Value")
    })

    it("should render properties as rows", () => {
      element.properties = [
        { key: "test1", value: "value1", version: 1 },
        { key: "test2", value: "value2", version: 2 },
      ]
      element.requestUpdate()
      
      // Should render 2 property rows + 1 empty row
      const rows = element.shadowRoot?.querySelectorAll("folksonomy-editor-row")
      expect(rows).toHaveLength(3)
    })

    it("should render empty row at the end", () => {
      element.properties = []
      element.requestUpdate()
      
      const rows = element.shadowRoot?.querySelectorAll("folksonomy-editor-row")
      const emptyRow = rows?.[0]
      
      expect(rows).toHaveLength(1)
      expect(emptyRow?.hasAttribute("empty")).toBe(true)
    })

    it("should pass correct props to row components", () => {
      element.properties = [{ key: "test", value: "value", version: 3 }]
      element.requestUpdate()
      
      const propertyRow = element.shadowRoot?.querySelector("folksonomy-editor-row")
      
      expect(propertyRow?.getAttribute("product-code")).toBe("123")
      expect(propertyRow?.getAttribute("key")).toBe("test")
      expect(propertyRow?.getAttribute("value")).toBe("value")
      expect(propertyRow?.getAttribute("version")).toBe("3")
      expect(propertyRow?.getAttribute("page-type")).toBe("edit")
    })

    it("should render sort icons correctly", () => {
      const keyIcon = (element as any).renderSortIcon("key")
      const valueIcon = (element as any).renderSortIcon("value")
      
      // Both should render SVG elements
      expect(keyIcon.strings[0]).toContain("<svg")
      expect(valueIcon.strings[0]).toContain("<svg")
    })

    it("should show active sort state in icons", () => {
      ;(element as any).sortColumn = "key"
      ;(element as any).sortDirection = "desc"
      
      const keyIcon = (element as any).renderSortIcon("key")
      
      // Should show active state for descending sort on key column
      expect(keyIcon.strings[0]).toContain("active")
    })
  })

  describe("lifecycle", () => {
    it("should add event listeners on connect", async () => {
      element = await fixture(html`<folksonomy-editor></folksonomy-editor>`)
      
      // Test that event listeners are working
      const addSpy = vi.spyOn(element as any, "handleRowAdd")
      
      element.dispatchEvent(new CustomEvent("add-row", {
        detail: { key: "test", value: "test" }
      }))
      
      expect(addSpy).toHaveBeenCalled()
    })

    it("should remove event listeners on disconnect", () => {
      const removeEventListenerSpy = vi.spyOn(element, "removeEventListener")
      
      element.disconnectedCallback()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith("add-row", expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith("update-row", expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith("delete-row", expect.any(Function))
    })
  })

  describe("edge cases", () => {
    it("should handle rapid consecutive updates", async () => {
      element = await fixture(html`<folksonomy-editor></folksonomy-editor>`)
      
      // Simulate rapid updates
      const events = [
        new CustomEvent("add-row", { detail: { key: "key1", value: "value1" } }),
        new CustomEvent("add-row", { detail: { key: "key2", value: "value2" } }),
        new CustomEvent("update-row", { detail: { key: "key1", value: "updated", version: 2 } }),
        new CustomEvent("delete-row", { detail: { key: "key2" } }),
      ]
      
      events.forEach(event => element.dispatchEvent(event))
      
      expect(element.properties).toEqual([
        { key: "key1", value: "updated", version: 2 }
      ])
    })

    it("should handle properties with duplicate keys", () => {
      element.properties = [
        { key: "duplicate", value: "first", version: 1 },
        { key: "duplicate", value: "second", version: 2 },
      ]
      
      const updateEvent = new CustomEvent("update-row", {
        detail: { key: "duplicate", value: "updated", version: 3 }
      })
      
      element.dispatchEvent(updateEvent)
      
      // Should update the first matching property
      expect(element.properties[0]).toEqual({
        key: "duplicate", value: "updated", version: 3
      })
      expect(element.properties[1]).toEqual({
        key: "duplicate", value: "second", version: 2
      })
    })

    it("should handle very long property keys and values", () => {
      const longKey = "x".repeat(1000)
      const longValue = "y".repeat(1000)
      
      const addEvent = new CustomEvent("add-row", {
        detail: { key: longKey, value: longValue }
      })
      
      element.dispatchEvent(addEvent)
      
      expect(element.properties).toContainEqual({
        key: longKey,
        value: longValue,
        version: 1
      })
    })
  })
})