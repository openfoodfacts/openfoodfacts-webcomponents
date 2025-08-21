// src/utils/dark-mode-listener.ts
// Simple singleton for dark mode detection and subscription

export type DarkModeCallback = (isDark: boolean) => void

class DarkModeListener {
  private isDark: boolean = false
  private listeners: Set<DarkModeCallback> = new Set()
  private mq: MediaQueryList
  private manualOverride: boolean | null = null
  private readonly STORAGE_KEY = "dark-mode-manual-override"

  constructor() {
    this.mq = window.matchMedia("(prefers-color-scheme: dark)")

    // Check for manual override in localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored !== null) {
      this.manualOverride = stored === "true"
    }

    this.updateDarkMode()
    this.mq.addEventListener("change", this.handleChange)
  }

  private handleChange = () => {
    // Only update if there's no manual override
    if (this.manualOverride === null) {
      this.updateDarkMode()
    }
  }

  private updateDarkMode() {
    const newIsDark = this.manualOverride !== null ? this.manualOverride : this.mq.matches
    if (newIsDark !== this.isDark) {
      this.isDark = newIsDark
      this.listeners.forEach((cb) => cb(this.isDark))
    }
  }

  get darkMode() {
    return this.isDark
  }

  /**
   * Manually toggle dark mode
   */
  toggleDarkMode() {
    const newValue = !this.isDark
    this.manualOverride = newValue
    localStorage.setItem(this.STORAGE_KEY, String(newValue))
    this.updateDarkMode()
  }

  /**
   * Reset to system preference
   */
  resetToSystemPreference() {
    this.manualOverride = null
    localStorage.removeItem(this.STORAGE_KEY)
    this.updateDarkMode()
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
