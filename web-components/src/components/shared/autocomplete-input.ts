import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { FOLKSONOMY_INPUT } from "../../styles/folksonomy-input"
import { classMap } from "lit/directives/class-map.js"

/**
 * AutocompleteInput Component
 * @element autocomplete-input
 * @description A reusable autocomplete input field with suggestions.
 * @fires input-change - Fired when the input value changes.
 * @fires suggestion-select - Fired when a suggestion is selected.
 */
@customElement("autocomplete-input")
export class AutocompleteInput extends LitElement {
  /**
   * Placeholder text for the input field.
   */
  @property({ type: String }) placeholder = ""

  /**
   * Current value of the input field.
   */
  @property({ type: String }) value = ""

  /**
   * List of suggestions to display in the autocomplete dropdown.
   */
  @property({ type: Array }) suggestions: string[] = []

  /**
   * Whether to show the suggestions dropdown.
   * @private
   */
  @state() private showSuggestions = false

  /**
   * Index of the currently highlighted suggestion.
   * @private
   */
  @state() private highlightedIndex = -1

  /**
   * Handles input changes and dispatches the "input-change" event.
   * @param e - The input event.
   */
  /**
   * Handles keyboard navigation for suggestions.
   * @param e - The keyboard event.
   */
  private onKeyDown(e: KeyboardEvent) {
    if (!this.showSuggestions || this.suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.suggestions.length - 1)
        break
      case "ArrowUp":
        e.preventDefault()
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
        break
      case "Enter":
        if (this.highlightedIndex >= 0) {
          e.preventDefault()
          this.selectSuggestion(this.suggestions[this.highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        this.showSuggestions = false
        break
      case "Tab":
        if (this.highlightedIndex >= 0) {
          e.preventDefault()
          this.selectSuggestion(this.suggestions[this.highlightedIndex])
        }
        break
    }
  }
  private onInput(e: Event) {
    const inputValue = (e.target as HTMLInputElement).value
    this.value = inputValue
    this.highlightedIndex = -1
    this.showSuggestions = this.suggestions.length > 0
    this.dispatchEvent(
      new CustomEvent("input-change", {
        detail: { value: inputValue },
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Selects a suggestion and dispatches the "suggestion-select" event.
   * @param suggestion - The selected suggestion.
   */
  private selectSuggestion(suggestion: string) {
    this.value = suggestion
    this.showSuggestions = false
    this.dispatchEvent(
      new CustomEvent("suggestion-select", {
        detail: { value: suggestion },
        bubbles: true,
        composed: true,
      })
    )
  }

  static override styles = [
    FOLKSONOMY_INPUT,
    css`
      .autocomplete-wrapper {
        width: 30%;
        position: absolute;
        margin-top: -23px;
      }

      .autocomplete-list {
        position: absolute;
        background: #fff;
        border: 1px solid #ccc;
        border-top: none;
        list-style-type: none;
        padding: 0;
        margin: 0;
        max-height: 200px;
        overflow-y: auto;
        z-index: 9999;
        width: 100%;
      }

      .autocomplete-item {
        padding: 10px;
        cursor: pointer;
      }

      .autocomplete-item:hover {
        background-color: #f0f0f0;
      }

      .autocomplete-item.highlighted {
        background-color: #e0e0e0;
        font-weight: bold;
      }

      input[type="text"]:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
      }
    `,
  ]

  override render() {
    return html`
      <div class="autocomplete-wrapper">
        <input
          type="text"
          class="autocomplete-input"
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${this.onInput}
          @keydown=${this.onKeyDown}
          @focus=${() => (this.showSuggestions = this.suggestions.length > 0)}
          @blur=${() => setTimeout(() => (this.showSuggestions = false), 150)}
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
          aria-expanded=${this.showSuggestions}
          aria-activedescendant=${this.highlightedIndex >= 0
            ? `autocomplete-item-${this.highlightedIndex}`
            : ""}
        />
        ${this.showSuggestions
          ? html`<ul class="autocomplete-list" id="autocomplete-list" role="listbox">
              ${this.suggestions.map(
                (s, index) =>
                  html`<li
                    class="autocomplete-item ${classMap({
                      highlighted: index === this.highlightedIndex,
                    })}"
                    role="option"
                    id="autocomplete-item-${index}"
                    @mousedown=${() => this.selectSuggestion(s)}
                    @mouseenter=${() => (this.highlightedIndex = index)}
                    aria-selected=${index === this.highlightedIndex}
                  >
                    ${s}
                  </li>`
              )}
            </ul>`
          : null}
        ${this.showSuggestions
          ? html`<ul class="autocomplete-list">
              ${this.suggestions.map(
                (s, index) =>
                  html`<li
                    class="autocomplete-item ${index === this.highlightedIndex
                      ? "highlighted"
                      : ""}"
                    @mousedown=${() => this.selectSuggestion(s)}
                  >
                    ${s}
                  </li>`
              )}
            </ul>`
          : null}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "autocomplete-input": AutocompleteInput
  }
}
