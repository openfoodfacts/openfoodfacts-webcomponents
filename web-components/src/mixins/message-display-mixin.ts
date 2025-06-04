import { css, html, LitElement, nothing, TemplateResult } from "lit"
import { state } from "lit/decorators.js"
import { Constructor } from "."
import { ALERT } from "../styles/alert"

export declare class MessageDisplayMixinInterface {
  messageToDisplay?: {
    message: string
    type: "success" | "error" | "info"
  }

  resetMessage(): void
  setErrorMessage(message: string): void
  setSuccessMessage(message: string): void
  setInfoMessage(message: string): void
  renderMessage(): typeof nothing | TemplateResult
}

export const MessageDisplayMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<MessageDisplayMixinInterface> & T => {
  class MessageDisplayMixinClass extends superClass {
    static styles = [
      (superClass as unknown as typeof LitElement).styles ?? [],
      ALERT,
      css`
        .alert {
          margin-top: 1rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
      `,
    ]

    @state()
    messageToDisplay?: {
      message: string
      type: "success" | "error" | "info"
    }

    resetMessage() {
      this.messageToDisplay = undefined
    }

    setErrorMessage(message: string) {
      this.messageToDisplay = {
        message,
        type: "error",
      }
    }

    setSuccessMessage(message: string) {
      this.messageToDisplay = {
        message,
        type: "success",
      }
    }

    setInfoMessage(message: string) {
      this.messageToDisplay = {
        message,
        type: "info",
      }
    }

    renderMessage(): typeof nothing | TemplateResult {
      return this.messageToDisplay?.message
        ? html`<div class="alert ${this.messageToDisplay.type}">
            ${this.messageToDisplay.message}
          </div>`
        : nothing
    }
  }
  return MessageDisplayMixinClass as unknown as Constructor<MessageDisplayMixinInterface> & T
}
