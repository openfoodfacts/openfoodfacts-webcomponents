import { directive } from "lit/directive.js"
import { AsyncDirective } from "lit/async-directive.js"

/**
 * A Lit directive that detects clicks outside a specified element and triggers a callback function.
 */

/**
 * A Lit directive that detects clicks outside a specified element and triggers a callback function.
 */
class ClickOutsideDirective extends AsyncDirective {
  private element: HTMLElement | null = null
  private callback: (() => void) | null = null
  private clickIsTriggered: boolean = false

  /**
   * Initializes the ClickOutsideDirective.
   * @param {any} part - The part information.
   */
  constructor(part: any) {
    super(part)
    this.element = part.element as HTMLElement
    this.addEventListener()
    this.clickIsTriggered = false
  }

  /**
   * Renders the directive.
   * @param {() => void} callback - The callback function to be called when a click outside the element is detected.
   * @returns {HTMLElement | null} The element to which the directive is applied.
   */
  override render(callback: () => void) {
    this.callback = callback
    return this.element
  }

  /**
   * Updates the directive.
   * @param {any} part - The part information.
   * @param {[() => void]} [callback] - The callback function to be called when a click outside the element is detected.
   * @returns {HTMLElement | null} The element to which the directive is applied.
   */
  override update(part: any, [callback]: [() => void]) {
    this.element = part.element as HTMLElement
    return this.render(callback)
  }

  /**
   * Catches the event click from the element.
   * Use this trick because element.contains doesn't work with shadow dom
   * @returns {void}
   */
  catchEventClickFromElement() {
    this.clickIsTriggered = true
  }

  /**
   * Cleans up the directive when it is disconnected.
   */
  override disconnected() {
    this.removeEventListener()
  }

  /**
   * Adds an event listener to detect clicks outside the element.
   */
  private addEventListener() {
    // Add a small delay to ensure the event listener is added after the initial render
    setTimeout(() => {
      this.element!.addEventListener("click", () => this.catchEventClickFromElement())
      document.addEventListener("click", this.handleClick)
    }, 0)
  }

  /**
   * Removes the event listener that detects clicks outside the element.
   */
  private removeEventListener() {
    this.element!.removeEventListener("click", () => this.catchEventClickFromElement)
    document.removeEventListener("click", this.handleClick)
  }

  /**
   * Handles the click event to detect clicks outside the element.
   * @param {MouseEvent} event - The mouse event.
   */
  private handleClick = () => {
    // Use this trick because element.contains doesn't work with shadow dom
    if (this.clickIsTriggered) {
      this.clickIsTriggered = false
      return
    }
    this.callback?.()
  }
}

/**
 * Creates a Lit directive that detects clicks outside a specified element and triggers a callback function.
 * @returns {Directive} The clickOutside directive.
 */
export const clickOutside = directive(ClickOutsideDirective)
