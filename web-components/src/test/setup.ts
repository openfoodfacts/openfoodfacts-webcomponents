import { beforeEach, vi } from "vitest"

// Mock global fetch
global.fetch = vi.fn()

// Ensure URL is available globally
global.URL = URL

// Mock console methods to reduce noise in tests
beforeEach(() => {
  vi.clearAllMocks()
  console.error = vi.fn()
  console.warn = vi.fn()
  console.log = vi.fn()
})

// Mock window.crypto for randomIdGenerator tests
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-1234"),
  },
})

// Mock URL methods for CSV download tests
URL.createObjectURL = vi.fn(() => "blob:mock-url")
URL.revokeObjectURL = vi.fn()

global.Blob = vi.fn((content, options) => ({ content, options })) as any
