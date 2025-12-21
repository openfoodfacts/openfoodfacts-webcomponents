import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { FOLKSONOMY_INPUT } from "../../styles/folksonomy-input"
import { classMap } from "lit/directives/class-map.js"
import type { AutocompleteSuggestion, AutocompleteInputChangeEventDetail } from "../../types"
import { SAFE_BLUE } from "../../utils/colors"
import { randomIdGenerator } from "../../utils"
import { darkModeListener } from "../../utils/dark-mode-listener"

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
        width: 100%;
        position: relative;
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

      .dark-mode .autocomplete-list {
        background: #2b2b2b;
        border: 1px solid #555;
        color: #f5f5f5;
      }

      .autocomplete-item {
        padding: 10px;
        cursor: pointer;
      }

      .autocomplete-item:hover {
        background-color: #f0f0f0;
      }

      .dark-mode .autocomplete-item:hover {
        background-color: #3a3a3a;
      }

      .autocomplete-item.highlighted {
        background-color: #e0e0e0;
        font-weight: bold;
      }

      .dark-mode .autocomplete-item.highlighted {
        background-color: #444;
      }

      .autocomplete-item.not-found {
        background-color: #f8f9fa;
        border-top: 1px solid #ddd;
        color: #007bff;
        font-style: italic;
        padding: 12px 10px;
      }

      .dark-mode .autocomplete-item.not-found {
        background-color: #353535;
        color: #5faaff;
      }

      .autocomplete-input:focus {
        outline: none;
        border-color: ${SAFE_BLUE};
      }

      .dark-mode .autocomplete-input {
        background: #222;
        color: white;
        border-color: #555;
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
  @property({ type: String })
  get value() {
    return this._inputValue ?? ""
  }
  set value(newValue: string) {
    this._inputValue = newValue
    this.requestUpdate()
  }

  /**
   * List of suggestions to display in the autocomplete dropdown.
   * Each suggestion can be a string or an object with label and value properties.
   */
  @property({ type: Array }) suggestions: AutocompleteSuggestion[] = []

  /**
   * Whether to show a "not found" option when no suggestions match.
   */
  @property({ type: Boolean, attribute: "show-not-found-option" }) showNotFoundOption = false

  /**
   * Text to display for the "not found" option.
   */
  @property({ type: String, attribute: "not-found-text" }) notFoundText = "Not found"

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
   * Unique ID for the input field.
   * @private
   */
  @state() private _id: string = ""

  @state() private _inputValue: string = ""

  // Dark mode handling
  isDarkMode = darkModeListener.darkMode
  private _darkModeCb = (isDark: boolean) => {
    this.isDarkMode = isDark
    this.requestUpdate()
  }

  /**
   * ID for the suggestions list.
   * @private
   */
  get suggestionId() {
    return `autocomplete-list-${this._id}`
  }

  getSuggestionItemId(index: number) {
    return `autocomplete-item-${this._id}-${index}`
  }

  /**
   * Filtered suggestions based on the current input value.
   * @private
   */
  get filteredSuggestions() {
    return this.filterSuggestions(this.value)
  }

  /**
   * Get suggestions including a "not found" option if no matches are found
   * @private
   */
  get suggestionsWithNotFound() {
    const filtered = this.filteredSuggestions
    if (this.showNotFoundOption && filtered.length === 0 && this.value.trim().length > 0) {
      return [
        {
          value: "__NOT_FOUND__",
          label: this.notFoundText.replace("{value}", this.value),
          isNotFound: true,
        },
      ]
    }
    return filtered
  }

  override connectedCallback() {
    super.connectedCallback()
    this._id = randomIdGenerator()
    darkModeListener.subscribe(this._darkModeCb)
  }

  override disconnectedCallback() {
    darkModeListener.unsubscribe(this._darkModeCb)
    super.disconnectedCallback()
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
    const suggestionsToShow = this.suggestionsWithNotFound
    this.showSuggestions = suggestionsToShow.length > 0

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
    // Don't change the input value for the "not found" special case
    if (suggestion.value !== "__NOT_FOUND__") {
      this._inputValue = suggestion.value
    }
    this.showSuggestions = false
    this.dispatchEvent(
      new CustomEvent<AutocompleteSuggestion>("suggestion-select", {
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
    const suggestionsToShow = this.suggestionsWithNotFound
    if (suggestionsToShow.length === 0) return

    // Do it before check if we show suggestions because we want to be able to
    if (!this.showSuggestions) {
      if (e.key === "Enter") {
        e.preventDefault()
        this.selectMatchingSuggestion()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, suggestionsToShow.length - 1)
        break
      case "ArrowUp":
        e.preventDefault()
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
        break
      case "Enter":
        e.preventDefault()
        if (this.highlightedIndex >= 0) {
          this.selectSuggestion(suggestionsToShow[this.highlightedIndex])
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
          this.selectSuggestion(suggestionsToShow[this.highlightedIndex])
        }
        break
    }
  }

  onFocus() {
    this.showSuggestions = this.suggestions.length > 0
    this.highlightedIndex = -1
  }

  override render() {
    const rootClasses = { "dark-mode": this.isDarkMode }

    return html`
      <div class=${classMap(rootClasses)}>
        <div class="autocomplete-wrapper">
          <input
            id=${this._id}
            type="text"
            class="autocomplete-input"
            .value=${this.value}
            placeholder=${this.placeholder}
            @input=${this.onInput}
            @keydown=${this.onKeyDown}
            @focus=${() => this.onFocus()}
            @blur=${() => setTimeout(() => (this.showSuggestions = false), 150)}
            aria-autocomplete="list"
            aria-controls=${this.suggestionId}
            aria-expanded=${this.showSuggestions}
            aria-activedescendant=${this.highlightedIndex >= 0
              ? this.getSuggestionItemId(this.highlightedIndex)
              : ""}
            part="autocomplete-input"
          />
          ${this.showSuggestions
            ? html`<ul
                class="autocomplete-list"
                id=${this.suggestionId}
                role="listbox"
                part="autocomplete-input-list"
              >
                ${this.suggestionsWithNotFound.map(
                  (s, index) =>
                    html`<li
                      class="autocomplete-item ${classMap({
                        highlighted: index === this.highlightedIndex,
                        "not-found": s.isNotFound === true,
                      })}"
                      role="option"
                      id=${this.getSuggestionItemId(index)}
                      @mousedown=${() => this.selectSuggestion(this.suggestionsWithNotFound[index])}
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
