import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { FOLKSONOMY_INPUT } from "../../styles/folksonomy-input"
import { classMap } from "lit/directives/class-map.js"
import { AutocompleteSuggestion, AutocompleteInputChangeEventDetail } from "../../types"

/**
 * AutocompleteInput Component
 * @element autocomplete-input
 * @description A reusable autocomplete input field with suggestions.
 * @fires input-change - Fired when the input value changes.
 * @fires suggestion-select - Fired when a suggestion is selected.
 */
@customElement("autocomplete-input")
export class AutocompleteInput extends LitElement {
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
   * Each suggestion can be a string or an object with label and value properties.
   */
  @property({ type: Array }) suggestions: AutocompleteSuggestion[] = []

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
   * Filtered suggestions based on the current input value.
   * @private
   */
  get filteredSuggestions() {
    return this.filterSuggestions(this.value)
  }

  /**
   * Filters suggestions based on the input value.
   * @param inputValue - The current input value.
   * @returns Filtered suggestions that match the input value.
   */
  private filterSuggestions(inputValue: string): AutocompleteSuggestion[] {
    if (!inputValue) return this.suggestions

    return this.suggestions.filter((suggestion) => {
      const suggestionText = this.getSuggestionTextToFilter(suggestion)
      return suggestionText.includes(inputValue.toLowerCase())
    })
  }

  getSuggestionTextToFilter(suggestion: AutocompleteSuggestion) {
    const suggestionText = suggestion.label ?? suggestion.value
    return suggestionText.toLowerCase()
  }

  /**
   * Handles input changes and dispatches the "input-change" event.
   * @param e - The input event.
   */
  private onInput(e: Event) {
    const inputValue = (e.target as HTMLInputElement).value
    this.value = inputValue
    this.highlightedIndex = -1
    const filteredSuggestions = this.filteredSuggestions
    this.showSuggestions = filteredSuggestions.length > 0
    // If there is only one suggestion and it matches the input value, consider it a notable match
    const matching =
      filteredSuggestions.length === 1 &&
      this.getSuggestionTextToFilter(filteredSuggestions[0]) === this.value
        ? filteredSuggestions[0]
        : undefined
    this.dispatchEvent(
      new CustomEvent<AutocompleteInputChangeEventDetail>("input-change", {
        detail: {
          value: inputValue,
          filteredSuggestions,
          matching,
        },
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Selects a suggestion and dispatches the "suggestion-select" event.
   * @param suggestion - The selected suggestion.
   */
  private selectSuggestion(suggestion: AutocompleteSuggestion) {
    this.value = suggestion.value
    this.showSuggestions = false
    this.dispatchEvent(
      new CustomEvent("suggestion-select", {
        detail: suggestion,
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Selects a suggestion if it matches the input value.
   * @returns The selected suggestion, if any.
   **/
  selectMatchingSuggestion() {
    const suggestion = this.filteredSuggestions.find(
      (suggestion) => this.getSuggestionTextToFilter(suggestion) === this.value
    )
    if (suggestion) {
      this.selectSuggestion(suggestion)
    }
    return suggestion
  }

  /**
   * Handles keyboard navigation for suggestions.
   * @param e - The keyboard event.
   */
  private onKeyDown(e: KeyboardEvent) {
    if (this.filteredSuggestions.length === 0) return

    // Do it before check if we show suggestions because we want to be able to
    if (!this.showSuggestions) {
      if (e.key === "Enter") {
        e.preventDefault()

        // return selected Suggestion if it matches the input value
        this.selectMatchingSuggestion()
      }
      return
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          this.filteredSuggestions.length - 1
        )
        break
      case "ArrowUp":
        e.preventDefault()
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
        break
      case "Enter":
        e.preventDefault()

        // If a suggestion is highlighted, select it
        if (this.highlightedIndex >= 0) {
          this.selectSuggestion(this.filteredSuggestions[this.highlightedIndex])
          // If no suggestion is highlighted, check if the input match exactly with one suggestion
        } else {
          this.selectMatchingSuggestion()
        }
        break
      case "Escape":
        e.preventDefault()
        this.showSuggestions = false
        break
      case "Tab":
        if (this.highlightedIndex >= 0) {
          e.preventDefault()
          this.selectSuggestion(this.filteredSuggestions[this.highlightedIndex])
        }
        break
    }
  }

  onFocus() {
    this.showSuggestions = this.suggestions.length > 0
    this.highlightedIndex = -1
  }

  override render() {
    return html`
      <div class="autocomplete-wrapper">
        <div class="autocomplete-input-wrapper">
          <input
            type="text"
            class="autocomplete-input"
            .value=${this.value}
            placeholder=${this.placeholder}
            @input=${this.onInput}
            @keydown=${this.onKeyDown}
            @focus=${() => this.onFocus()}
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
                ${this.filteredSuggestions.map(
                  (s, index) =>
                    html`<li
                      class="autocomplete-item ${classMap({
                        highlighted: index === this.highlightedIndex,
                      })}"
                      role="option"
                      id="autocomplete-item-${index}"
                      @mousedown=${() => this.selectSuggestion(this.filteredSuggestions[index])}
                      @mouseenter=${() => (this.highlightedIndex = index)}
                      aria-selected=${index === this.highlightedIndex}
                    >
                      ${s.label ?? s.value}
                    </li>`
                )}
              </ul>`
            : null}
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "autocomplete-input": AutocompleteInput
  }
}
