import { html, css, LitElement, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import "../icons/loading-spin"
import { ButtonType, getButtonClasses } from "../../styles/buttons"

/**
 * A button component that shows a loading spinner when in a loading state.
 * @fire click - Fired when the button is clicked
 * @slot - This element has a slot for custom content
 */
@customElement("loading-button")
export class LoadingButton extends LitElement {
  static override styles = [
    css`
      :host {
        display: inline-block;
      }
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        gap: 0.5rem;
      }
    `,
    ...getButtonClasses(Object.values(ButtonType)),
  ]

  /**
   * The text to display on the button
   */
  @property({ type: String, reflect: true })
  label = ""

  /**
   * Whether the button is in a loading state
   */
  @property({ type: Boolean, reflect: true })
  loading = false

  /**
   * Whether the button is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false

  /**
   * Additional CSS classes to apply to the button
   */
  @property({ type: String, attribute: "css-classes" })
  cssClasses = ""

  /**
   * The type of the button (button, submit, reset)
   */
  @property({ type: String })
  type: "button" | "submit" | "reset" = "button"

  override render() {
    return html`
      <button
        type=${this.type}
        class="${this.cssClasses}"
        ?disabled=${this.disabled || this.loading}
        ?loading=${this.loading}
      >
        ${this.loading ? html`<loading-spin size="15px"></loading-spin>` : nothing}
        <slot><span>${this.label}</span></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "loading-button": LoadingButton
  }
}
