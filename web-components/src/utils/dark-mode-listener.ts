// src/utils/dark-mode-listener.ts
// Simple singleton for dark mode detection and subscription

export type DarkModeCallback = (isDark: boolean) => void

class DarkModeListener {
  private isDark: boolean = false
  private listeners: Set<DarkModeCallback> = new Set()
  private mq: MediaQueryList | null = null

  constructor() {
    // Guard against SSR environments (e.g. Node.js / SvelteKit / Nuxt)
    // where `window` is not defined. In those cases we fall back to
    // `isDark = false` and skip MediaQuery initialisation entirely.
    if (typeof window !== "undefined") {
      this.mq = window.matchMedia("(prefers-color-scheme: dark)")
      this.isDark = this.mq.matches
      this.mq.addEventListener("change", this.handleChange)
    }
  }

  private handleChange = (e: MediaQueryListEvent) => {
    this.isDark = e.matches
    this.listeners.forEach((cb) => cb(this.isDark))
  }

  get darkMode() {
    return this.isDark
  }

  subscribe(cb: DarkModeCallback) {
    this.listeners.add(cb)
    // Immediately call with current value
    cb(this.isDark)
  }

  unsubscribe(cb: DarkModeCallback) {
    this.listeners.delete(cb)
  }
}

export const darkModeListener = new DarkModeListener()
