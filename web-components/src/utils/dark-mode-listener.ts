// src/utils/dark-mode-listener.ts
// Simple singleton for dark mode detection and subscription

export type DarkModeCallback = (isDark: boolean) => void

class DarkModeListener {
  private isDark = false
  private listeners: Set<DarkModeCallback> = new Set()

  constructor() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    this.isDark = mq.matches
    mq.addEventListener("change", this.handleChange)
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
