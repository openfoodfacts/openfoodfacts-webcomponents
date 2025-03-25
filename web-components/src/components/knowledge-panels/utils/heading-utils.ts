import { html, TemplateResult } from "lit"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import DOMPurify from "dompurify"

/**
 * Validates and normalizes the heading level
 * @param headingLevel - The heading level to validate
 * @returns Validated heading level string
 */
export function getValidHeadingLevel(headingLevel: string): string {
  const validLevels = ["h1", "h2", "h3", "h4", "h5", "h6"]
  const level = headingLevel.toLowerCase()
  return validLevels.includes(level) ? level : "h3" // Default to h3 if invalid
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
 * Renders a dynamic heading based on the configured level
 * @param text - Text content for the heading
 * @param className - Optional CSS class for the heading
 * @param headingLevel - Base heading level to use
 * @param offset - Optional level offset from the base heading level
 * @returns Template result for the heading
 */
export function renderHeading(
  text: string,
  className?: string,
  headingLevel: string = "h3",
  offset: number = 0
): TemplateResult {
  // If offset is provided, calculate a different heading level
  const level =
    offset === 0 ? getValidHeadingLevel(headingLevel) : getSubHeadingLevel(headingLevel, offset)

  const classAttr = className ? `class="${className}"` : ""

  // Using unsafeHTML to dynamically create the appropriate heading element
  const sanitizedHTML = DOMPurify.sanitize(`<${level} ${classAttr}>${text}</${level}>`)
  return html`${unsafeHTML(sanitizedHTML)}`
}
