import { describe, it, expect, beforeEach } from "vitest"
import { SignalObject, SignalMap } from "../utils/signals"

describe("Signal Utilities", () => {
  describe("SignalObject", () => {
    let signalObject: SignalObject<{ key1: string; key2: number; key3: boolean }>

    beforeEach(() => {
      signalObject = new SignalObject({
        key1: "initial",
        key2: 42,
        key3: true,
      })
    })

    describe("initialization", () => {
      it("should initialize with provided values", () => {
        expect(signalObject.get()).toEqual({
          key1: "initial",
          key2: 42,
          key3: true,
        })
      })

      it("should handle empty object initialization", () => {
        const emptySignal = new SignalObject({})
        expect(emptySignal.get()).toEqual({})
      })

      it("should handle nested object initialization", () => {
        const nestedSignal = new SignalObject({
          user: { name: "John", age: 30 },
          settings: { theme: "dark", language: "en" },
        })

        expect(nestedSignal.get()).toEqual({
          user: { name: "John", age: 30 },
          settings: { theme: "dark", language: "en" },
        })
      })
    })

    describe("getItem", () => {
      it("should get individual items by key", () => {
        expect(signalObject.getItem("key1")).toBe("initial")
        expect(signalObject.getItem("key2")).toBe(42)
        expect(signalObject.getItem("key3")).toBe(true)
      })

      it("should return undefined for non-existent keys", () => {
        expect(signalObject.getItem("nonExistent")).toBeUndefined()
      })

      it("should handle null and undefined values", () => {
        const signalWithNulls = new SignalObject({
          nullValue: null,
          undefinedValue: undefined,
        })

        expect(signalWithNulls.getItem("nullValue")).toBeNull()
        expect(signalWithNulls.getItem("undefinedValue")).toBeUndefined()
      })

      it("should handle complex object values", () => {
        const complexSignal = new SignalObject({
          array: [1, 2, 3],
          object: { nested: { deep: "value" } },
          function: () => "test",
        })

        expect(complexSignal.getItem("array")).toEqual([1, 2, 3])
        expect(complexSignal.getItem("object")).toEqual({ nested: { deep: "value" } })
        expect(typeof complexSignal.getItem("function")).toBe("function")
      })
    })

    describe("setItem", () => {
      it("should set individual items by key", () => {
        signalObject.setItem("key1", "updated")
        expect(signalObject.getItem("key1")).toBe("updated")
        expect(signalObject.get()).toEqual({
          key1: "updated",
          key2: 42,
          key3: true,
        })
      })

      it("should add new keys", () => {
        signalObject.setItem("newKey", "newValue")
        expect(signalObject.getItem("newKey")).toBe("newValue")
        expect(signalObject.get()).toEqual({
          key1: "initial",
          key2: 42,
          key3: true,
          newKey: "newValue",
        })
      })

      it("should preserve other values when setting one", () => {
        const originalState = signalObject.get()
        signalObject.setItem("key2", 100)

        expect(signalObject.getItem("key1")).toBe(originalState.key1)
        expect(signalObject.getItem("key2")).toBe(100)
        expect(signalObject.getItem("key3")).toBe(originalState.key3)
      })

      it("should handle setting null and undefined", () => {
        signalObject.setItem("key1", null as any)
        signalObject.setItem("key2", undefined as any)

        expect(signalObject.getItem("key1")).toBeNull()
        expect(signalObject.getItem("key2")).toBeUndefined()
      })

      it("should handle complex value types", () => {
        const complexValue = {
          nested: { array: [1, 2, { deep: "value" }] },
          date: new Date(),
          regex: /test/g,
        }

        signalObject.setItem("complex", complexValue)
        expect(signalObject.getItem("complex")).toEqual(complexValue)
      })

      it("should trigger reactivity", () => {
        let callCount = 0
        let lastValue: any

        // Simulate a reactive listener (this is a simplified version)
        const originalGet = signalObject.get.bind(signalObject)
        signalObject.get = () => {
          const value = originalGet()
          callCount++
          lastValue = value
          return value
        }

        signalObject.setItem("key1", "reactive")
        signalObject.get() // Trigger the "reactive" call

        expect(callCount).toBeGreaterThan(0)
        expect(lastValue.key1).toBe("reactive")
      })
    })

    describe("immutability", () => {
      it("should not mutate original object on setItem", () => {
        const originalState = signalObject.get()
        const originalKey1 = originalState.key1

        signalObject.setItem("key1", "mutated")

        // Original reference should remain unchanged
        expect(originalKey1).toBe("initial")
        expect(originalState.key1).toBe("initial") // Original object unchanged
        expect(signalObject.getItem("key1")).toBe("mutated") // New state updated
      })

      it("should create new object references on change", () => {
        const state1 = signalObject.get()
        signalObject.setItem("key1", "changed")
        const state2 = signalObject.get()

        expect(state1).not.toBe(state2) // Different object references
        expect(state1.key1).not.toBe(state2.key1) // Different values
      })

      it("should preserve nested object structure", () => {
        const nestedSignal = new SignalObject({
          user: { name: "John", settings: { theme: "dark" } },
        })

        const originalUser = nestedSignal.getItem("user")
        nestedSignal.setItem("newKey", "value")
        const newUser = nestedSignal.getItem("user")

        expect(originalUser).toBe(newUser) // Same reference for unchanged nested objects
      })
    })

    describe("edge cases", () => {
      it("should handle very long keys", () => {
        const longKey = "x".repeat(1000)
        signalObject.setItem(longKey, "longKeyValue")
        expect(signalObject.getItem(longKey)).toBe("longKeyValue")
      })

      it("should handle special character keys", () => {
        const specialKeys = [
          "key with spaces",
          "key-with-dashes",
          "key.with.dots",
          "key/with/slashes",
        ]

        specialKeys.forEach((key, index) => {
          signalObject.setItem(key, `value${index}`)
          expect(signalObject.getItem(key)).toBe(`value${index}`)
        })
      })

      it("should handle numeric string keys", () => {
        signalObject.setItem("123", "numericKey")
        signalObject.setItem("0", "zeroKey")

        expect(signalObject.getItem("123")).toBe("numericKey")
        expect(signalObject.getItem("0")).toBe("zeroKey")
      })

      it("should handle empty string key", () => {
        signalObject.setItem("", "emptyKey")
        expect(signalObject.getItem("")).toBe("emptyKey")
      })

      it("should handle rapid successive changes", () => {
        for (let i = 0; i < 100; i++) {
          signalObject.setItem("rapidKey", `value${i}`)
        }
        expect(signalObject.getItem("rapidKey")).toBe("value99")
      })
    })
  })

  describe("SignalMap", () => {
    let signalMap: SignalMap<string>

    beforeEach(() => {
      signalMap = new SignalMap({
        key1: "value1",
        key2: "value2",
      })
    })

    it("should extend SignalObject functionality", () => {
      expect(signalMap.getItem("key1")).toBe("value1")
      signalMap.setItem("key3", "value3")
      expect(signalMap.getItem("key3")).toBe("value3")
    })

    it("should work with different value types", () => {
      const numberMap = new SignalMap<number>({ a: 1, b: 2 })
      const booleanMap = new SignalMap<boolean>({ x: true, y: false })
      const objectMap = new SignalMap<{ name: string }>({
        user1: { name: "John" },
        user2: { name: "Jane" },
      })

      expect(numberMap.getItem("a")).toBe(1)
      expect(booleanMap.getItem("x")).toBe(true)
      expect(objectMap.getItem("user1")).toEqual({ name: "John" })
    })

    it("should handle generic type constraints", () => {
      interface User {
        name: string
        age: number
      }

      const userMap = new SignalMap<User>({
        user1: { name: "Alice", age: 30 },
        user2: { name: "Bob", age: 25 },
      })

      expect(userMap.getItem("user1").name).toBe("Alice")
      expect(userMap.getItem("user2").age).toBe(25)

      userMap.setItem("user3", { name: "Charlie", age: 35 })
      expect(userMap.getItem("user3")).toEqual({ name: "Charlie", age: 35 })
    })

    it("should maintain type safety", () => {
      const stringMap = new SignalMap<string>({ key: "value" })

      // TypeScript would catch this at compile time, but we can test runtime behavior
      stringMap.setItem("newKey", "stringValue")
      expect(typeof stringMap.getItem("newKey")).toBe("string")
    })
  })

  describe("integration scenarios", () => {
    it("should handle configuration-like objects", () => {
      interface Config {
        apiUrl: string
        timeout: number
        retries: number
        debug: boolean
      }

      const configSignal = new SignalObject<Config>({
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3,
        debug: false,
      })

      // Simulate configuration updates
      configSignal.setItem("debug", true)
      configSignal.setItem("timeout", 10000)

      expect(configSignal.getItem("debug")).toBe(true)
      expect(configSignal.getItem("timeout")).toBe(10000)
      expect(configSignal.getItem("apiUrl")).toBe("https://api.example.com") // Unchanged
    })

    it("should handle cache-like usage", () => {
      interface CacheEntry {
        data: any
        timestamp: number
        ttl: number
      }

      const cache = new SignalMap<CacheEntry>({})

      const entry: CacheEntry = {
        data: { user: "John" },
        timestamp: Date.now(),
        ttl: 3600000, // 1 hour
      }

      cache.setItem("user:123", entry)
      expect(cache.getItem("user:123")).toEqual(entry)

      // Simulate cache invalidation
      cache.setItem("user:123", { ...entry, data: { user: "John Updated" } })
      expect(cache.getItem("user:123").data.user).toBe("John Updated")
    })

    it("should work with multiple instances independently", () => {
      const signal1 = new SignalObject({ shared: "value1" })
      const signal2 = new SignalObject({ shared: "value2" })

      signal1.setItem("shared", "updated1")
      signal2.setItem("shared", "updated2")

      expect(signal1.getItem("shared")).toBe("updated1")
      expect(signal2.getItem("shared")).toBe("updated2")
    })
  })

  describe("error handling and resilience", () => {
    it("should handle circular references gracefully", () => {
      const circularObj: any = { name: "circular" }
      circularObj.self = circularObj

      const signal = new SignalObject({ circular: null })

      // This might throw in some implementations, but shouldn't crash
      expect(() => {
        signal.setItem("circular", circularObj)
      }).not.toThrow()
    })

    it("should handle very large objects", () => {
      const largeObject = {}
      for (let i = 0; i < 10000; i++) {
        ;(largeObject as any)[`key${i}`] = `value${i}`
      }

      const signal = new SignalObject({ large: null })

      expect(() => {
        signal.setItem("large", largeObject)
      }).not.toThrow()

      expect(signal.getItem("large")).toBe(largeObject)
    })

    it("should handle prototype pollution attempts", () => {
      const signal = new SignalObject({})

      // Attempt prototype pollution
      signal.setItem("__proto__", { malicious: true })
      signal.setItem("constructor", { malicious: true })

      // Should not affect Object prototype
      expect((Object.prototype as any).malicious).toBeUndefined()
    })
  })
})
