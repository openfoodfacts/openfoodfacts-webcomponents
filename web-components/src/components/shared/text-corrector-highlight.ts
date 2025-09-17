import { html, css, type PropertyValues } from "lit"
import { customElement, property } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import "../icons/check"
import "../icons/cross"
import "../icons/skip"
import "../icons/edit"
import "../shared/info-button"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { TEXTAREA } from "../../styles/form"
import { POPOVER } from "../../styles/popover"
import { TEXT_CORRECTOR } from "../../styles/text-corrector"
import { RELATIVE } from "../../styles/utils"
import "../shared/loading-button"
import { TextDiffMixin } from "../../mixins/text-diff-mixin"
import { LitElement } from "lit"
import { getValidHeadingLevel } from "../../utils/knowledge-panels/heading-utils"
import { sanitizeHtml } from "../../utils/html"

/**
 * TextCorrectorHighlight component
 *
 * It allows the user to correct a text with the help of a list of changes.
 * It displays the text with the changes highlighted.
 * You can validate or reject the changes.
 * It also allows the user to edit the text manually.
 * The user can validates, rejects the changes, or skips the correction.
 * Validation can be done when all the changes are validated/rejected or if the user has edited the text manually.
 * @element text-corrector-highlight
 * @fires input - when the user types in the textarea
 */
@customElement("text-corrector-highlight")
export class TextCorrectorHighlight extends TextDiffMixin(LitElement) {
  static override styles = [
    BASE,
    TEXTAREA,
    POPOVER,
    RELATIVE,
    TEXT_CORRECTOR,
    getButtonClasses([
      ButtonType.Cappucino,
      ButtonType.Success,
      ButtonType.Danger,
      ButtonType.White,
      ButtonType.LightRed,
      ButtonType.LightGreen,
    ]),
    css`
      .submit-buttons-wrapper {
        margin-top: 1rem;
      }
    `,
  ]

  /**
   * The original text to be corrected.
   * @type {string}
   */
  @property({ type: String, reflect: true })
  original = ""

  /**
   * The value of the text input.
   * @type {string}
   */
  @property({ type: String, reflect: true })
  value?: string = ""

  /**
   * The value of the text input.
   * @type {string}
   */
  @property({ type: String, reflect: true, attribute: "heading-level" })
  headingLevel = "h2"

  /**
   * Focuses on the first updated element when the component is first updated.
   * @type {boolean}
   */
  @property({ type: Boolean, reflect: true, attribute: "focus-on-first-updated" })
  focusOnFirstUpdated = false

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties)
    if (this.focusOnFirstUpdated) {
      this.shadowRoot!.querySelector("textarea")!.focus()
    }
  }

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    if (name === "original" || name === "value") {
      requestAnimationFrame(() => {
        this.computeDiffResult(this.original, this.value ?? "")
      })
    }
  }

  /**
   * Renders the highlighted diff between the original and corrected text.
   * @returns {TemplateResult} The rendered highlighted diff.
   */
  renderHighlightedDiff() {
    return html`${this.diffResult.map((part) => {
      if (part.added) {
        return html`<span class="addition">${part.value}</span>`
      } else if (part.removed) {
        return html`<span class="deletion line-through">${part.value}</span>`
      } else {
        return html`<span>${part.value}</span>`
      }
    })}`
  }

  /**
   * Handles the change event of the textarea.
   * @param {Event} e - The change event.
   */
  handleTextareaInput(e: Event) {
    e.preventDefault()
    const textarea = e.target as HTMLTextAreaElement
    this.value = textarea.value
  }

  /**
   * Renders the textarea for editing the text.
   * @returns {TemplateResult} The rendered textarea.
   */
  override render() {
    const headingTag = getValidHeadingLevel(this.headingLevel)
    return html`
      <div class="text-section">
        ${sanitizeHtml(`<${headingTag}>${msg("Preview")}</${headingTag}>`)}
        <p class="text-content">${this.renderHighlightedDiff()}</p>
      </div>
      <div class="">
        ${sanitizeHtml(`<${headingTag}>${msg("Edit ingredients list")}</${headingTag}>`)}
        <textarea class="textarea" rows="6" @input=${this.handleTextareaInput}>
${this.value}</textarea
        >
      </div>
    `
  }
}

// Define the custom element
declare global {
  interface HTMLElementTagNameMap {
    "text-corrector-highlight": TextCorrectorHighlight
  }
}
