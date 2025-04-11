import { LitElement, html, css, TemplateResult } from "lit"
import { customElement, property } from "lit/decorators.js"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import DOMPurify from "dompurify"

/**
 * Validates and normalizes the heading level
 * @param headingLevel - The heading level to validate
 * @returns Validated heading level string
 */
export function getValidHeadingLevel(headingLevel: string, defaultLevel: string = "h3"): string {
  const validLevels = ["h1", "h2", "h3", "h4", "h5", "h6"]
  const level = headingLevel.toLowerCase()
  return validLevels.includes(level) ? level : defaultLevel // Default to h3 if invalid
}

/**
 * Calculates a subordinate heading level based on the main heading level
 * @param headingLevel - The base heading level
 * @param offset - Number of levels to add (1 = one level deeper)
 * @returns A valid heading level string (h1-h6)
 */
export function getSubHeadingLevel(headingLevel: string, offset: number = 1): string {
  const currentLevel = parseInt(getValidHeadingLevel(headingLevel).substring(1))
  const newLevel = Math.min(currentLevel + offset, 6) // Ensure we don't go beyond h6
  return `h${newLevel}`
}

/**
 * Dynamic heading renderer component
 *
 * @element heading-renderer
 */
@customElement("heading-renderer")
export class HeadingRenderer extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `

  @property({ type: String })
  text = ""

  @property({ type: String, attribute: "class-name" })
  override className: string = ""

  @property({ type: String, attribute: "heading-level" })
  headingLevel = "h3"

  @property({ type: Number })
  offset = 0

  override render(): TemplateResult {
    // If offset is provided, calculate a different heading level
    const level =
      this.offset === 0
        ? getValidHeadingLevel(this.headingLevel)
        : getSubHeadingLevel(this.headingLevel, this.offset)

    const classAttr = this.className ? `class="${this.className}"` : ""

    // Using unsafeHTML to dynamically create the appropriate heading element
    const sanitizedHTML = DOMPurify.sanitize(`<${level} ${classAttr}>${this.text}</${level}>`)
    return html`${unsafeHTML(sanitizedHTML)}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "heading-renderer": HeadingRenderer
  }
}
