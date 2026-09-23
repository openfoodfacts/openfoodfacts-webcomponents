import { directive } from "lit/directive.js"
import { AsyncDirective } from "lit/async-directive.js"

/**
 * A Lit directive that detects clicks outside a specified element and triggers a callback function.
 */
class ClickOutsideDirective extends AsyncDirective {
  private element: HTMLElement | null = null
  private callback: (() => void) | null = null
  private animationFrameId: number | null = null

  /**
   * Initializes the ClickOutsideDirective.
   * @param {any} part - The part information.
   */
  constructor(part: any) {
    super(part)
    this.element = part.element as HTMLElement
    this.addEventListener()
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
   * Cleans up the directive when it is disconnected.
   */
  override disconnected() {
    this.removeEventListener()
  }

  /**
   * Reattach the document listener when Lit reconnects the directive.
   */
  override reconnected() {
    this.addEventListener()
  }

  /**
   * Adds an event listener to detect clicks outside the element.
   */
  private addEventListener() {
    // Add a small delay to ensure the event listener is added after the initial render
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null
      document.addEventListener("click", this.handleClick)
    })
  }

  /**
   * Removes the event listener that detects clicks outside the element.
   */
  private removeEventListener() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    document.removeEventListener("click", this.handleClick)
  }

  /**
   * Handles the click event to detect clicks outside the element.
   * @param {MouseEvent} event - The mouse event.
   */
  private handleClick = (event: MouseEvent) => {
    // composedPath() also works when the clicked element is inside a shadow root.
    if (this.element && event.composedPath().includes(this.element)) {
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
