import { beforeEach, vi } from "vitest"

// Mock global fetch
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
beforeEach(() => {
  vi.clearAllMocks()
  console.error = vi.fn()
  console.warn = vi.fn()
})

// Mock window.crypto for randomIdGenerator tests
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-1234"),
  },
})

// Mock URL and Blob for CSV download tests
global.URL = {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
} as any

global.Blob = vi.fn((content, options) => ({ content, options })) as any