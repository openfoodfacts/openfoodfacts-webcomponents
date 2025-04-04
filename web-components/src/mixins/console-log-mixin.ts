import { LitElement } from "lit"
import { Constructor } from "."

/**
 * Interface for the ConsoleLogMixin.
 */
export interface ConsoleLogMixinInterface {
  lastLogTime: Record<string, number>
  logToConsole(id: string, message: string, time?: number): void
}

/**
 * Mixin that adds console logging functionality to a LitElement.
 */
export const ConsoleLogMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<ConsoleLogMixinInterface> & T =>
  class extends superClass {
    lastLogTime: Record<string, number> = {}

    logToConsole(id: string, message: string, time: number = 30000) {
      const now = Date.now()
      if (now - this.lastLogTime[id] >= time) {
        console.log(message)
        this.lastLogTime[id] = now
      }
    }
  } as Constructor<ConsoleLogMixinInterface> & T
