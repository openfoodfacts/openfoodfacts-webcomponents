import { LitElement } from "lit"
import { Constructor } from "."
import { state } from "lit/decorators.js"

/**
 * Interface for the LoadingMixin.
 */
export interface LoadingMixinInterface {
  startTime?: number
  loading: string | undefined
  showLoading(message: string): void
  hideLoading(): void
}

const DURATION = 500

/**
 * Mixin that adds loading functionality to a LitElement.
 * It will show the loading state for at least 500ms to avoid flickering.
 */
export const LoadingWithTimeoutMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<LoadingMixinInterface> & T => {
  class LoadingWithTimeoutMixinClass extends superClass {
    /**
     * Indicates the loading state of the component.
     * Can be undefined or a string value.
     */
    @state()
    loading: string | undefined = undefined

    /**
     * The time when the loading state started.
     */
    startTime?: number

    /**
     * Shows the loading state with a specific message
     * @param loading - The loading to display
     */
    showLoading(loading: string) {
      this.startTime = Date.now()
      this.loading = loading
    }

    /**
     * Hides the loading state
     */
    async hideLoading() {
      const timeElapsed = Date.now() - (this.startTime ?? 0)
      const timeoutTime = Math.max(0, DURATION - timeElapsed)
      await new Promise((resolve) => {
        setTimeout(() => {
          this.loading = undefined
          resolve(undefined)
        }, timeoutTime)
      })
    }
  }
  return LoadingWithTimeoutMixinClass as Constructor<LoadingMixinInterface> & T
}
