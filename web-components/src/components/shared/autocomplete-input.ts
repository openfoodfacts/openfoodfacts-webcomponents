import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { FOLKSONOMY_INPUT } from "../../styles/folksonomy-input"
import { classMap } from "lit/directives/class-map.js"
import type { AutocompleteSuggestion, AutocompleteInputChangeEventDetail } from "../../types"
import { SAFE_BLUE } from "../../utils/colors"
import { randomIdGenerator } from "../../utils"

const BLUR_DELAY_MS = 150

type VisibleSuggestion = {
  suggestion: AutocompleteSuggestion
  depth: number
  path: AutocompleteSuggestion[]
}

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

      .autocomplete-item {
        cursor: pointer;
      }

      .autocomplete-item:hover,
      .autocomplete-item.highlighted {
        background-color: #f0f0f0;
      }

      .autocomplete-item-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
      }

      .autocomplete-item-tree {
        border-left: 1px solid #e5e7eb;
        margin-left: 16px;
      }

      .autocomplete-item-expander {
        color: #6c757d;
        flex: 0 0 12px;
        font-size: 0.85rem;
        text-align: center;
      }

      .autocomplete-item-label {
        flex: 1;
        min-width: 0;
      }

      .autocomplete-item.not-found {
        background-color: #f8f9fa;
        border-top: 1px solid #ddd;
        color: #007bff;
        font-style: italic;
      }

      .autocomplete-item.not-found .autocomplete-item-content {
        padding: 12px 10px;
      }

      .autocomplete-item.not-found:hover {
        background-color: #e7f3ff;
      }

      .autocomplete-item.not-found.highlighted {
        background-color: #d4ebff;
        font-weight: normal;
      }

      .autocomplete-input:focus {
        outline: none;
        border-color: ${SAFE_BLUE};
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
   * Selected hierarchy path when browsing nested suggestions.
   * @private
   */
  @state() private navigationPath: AutocompleteSuggestion[] = []

  /**
   * Unique ID for the input field.
   * @private
   */
  @state()
  private _id: string = ""

  @state()
  private _inputValue: string = ""

  private ignoreNextBlur = false
  private blurTimeoutId?: ReturnType<typeof setTimeout>

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

  private get inputElement() {
    return this.renderRoot.querySelector("input")
  }

  private focusInput() {
    this.inputElement?.focus()
  }

  /**
   * Filtered suggestions based on the current input value.
   * @private
   */
  get filteredSuggestions() {
    return this.filterSuggestions(this.value)
  }

  /**
   * Suggestions visible in the dropdown.
   * When the user types, the full tree is searched and matching branches are shown.
   * Otherwise the tree shows the currently expanded hierarchy path.
   * @private
   */
  get visibleSuggestions() {
    if (!this.value) {
      return this.getExpandedVisibleSuggestions(this.suggestions)
    }
    return this.getSearchVisibleSuggestions(this.suggestions, this.value)
  }

  /**
   * Get suggestions including a "not found" option if no matches are found
   * @private
   */
  get visibleSuggestionsWithNotFound(): VisibleSuggestion[] {
    if (
      this.showNotFoundOption &&
      this.visibleSuggestions.length === 0 &&
      this.value.trim().length > 0
    ) {
      return [
        {
          suggestion: {
            value: "__NOT_FOUND__",
            label: this.notFoundText.replace("{value}", this.value),
            isNotFound: true,
          },
          depth: 0,
          path: [],
        },
      ]
    }
    return this.visibleSuggestions
  }

  override connectedCallback() {
    super.connectedCallback()
    this._id = randomIdGenerator()
  }

  override disconnectedCallback() {
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId)
    }
    super.disconnectedCallback()
  }
  /**
   * Filters suggestions based on the input value.
   * @param inputValue - The current input value.
   * @returns Filtered suggestions that match the input value.
   */
  private filterSuggestions(inputValue: string): AutocompleteSuggestion[] {
    if (!inputValue) {
      return this.visibleSuggestions.map(({ suggestion }) => suggestion)
    }

    return this.findMatchingSuggestions(this.suggestions, inputValue)
  }

  getSuggestionTextToFilter(suggestion: AutocompleteSuggestion) {
    const suggestionText = suggestion.label ?? suggestion.value
    return suggestionText.toLowerCase()
  }

  private findMatchingSuggestions(
    suggestions: AutocompleteSuggestion[],
    inputValue: string
  ): AutocompleteSuggestion[] {
    return suggestions.flatMap((suggestion) => {
      const matches = this.getSuggestionTextToFilter(suggestion).includes(inputValue.toLowerCase())
      const children = suggestion.children?.length
        ? this.findMatchingSuggestions(suggestion.children, inputValue)
        : []
      return [...(matches ? [suggestion] : []), ...children]
    })
  }

  private getExpandedVisibleSuggestions(
    suggestions: AutocompleteSuggestion[],
    depth = 0,
    parentPath: AutocompleteSuggestion[] = []
  ): VisibleSuggestion[] {
    return suggestions.flatMap((suggestion) => {
      const path = [...parentPath, suggestion]
      const children =
        (suggestion.children?.length ?? 0) > 0 && this.isPathExpanded(path)
          ? this.getExpandedVisibleSuggestions(suggestion.children ?? [], depth + 1, path)
          : []

      return [{ suggestion, depth, path }, ...children]
    })
  }

  private getSearchVisibleSuggestions(
    suggestions: AutocompleteSuggestion[],
    inputValue: string,
    depth = 0,
    parentPath: AutocompleteSuggestion[] = []
  ): VisibleSuggestion[] {
    return suggestions.flatMap((suggestion) => {
      const path = [...parentPath, suggestion]
      const children =
        (suggestion.children?.length ?? 0) > 0
          ? this.getSearchVisibleSuggestions(suggestion.children ?? [], inputValue, depth + 1, path)
          : []
      const matches = this.getSuggestionTextToFilter(suggestion).includes(inputValue.toLowerCase())

      if (!matches && children.length === 0) {
        return []
      }

      return [{ suggestion, depth, path }, ...children]
    })
  }

  private isPathExpanded(path: AutocompleteSuggestion[]) {
    return path.every((suggestion, index) => this.navigationPath[index]?.value === suggestion.value)
  }

  private findPathToSuggestion(
    targetSuggestion: AutocompleteSuggestion,
    suggestions = this.suggestions,
    parentPath: AutocompleteSuggestion[] = []
  ): AutocompleteSuggestion[] | undefined {
    for (const suggestion of suggestions) {
      const path = [...parentPath, suggestion]
      if (suggestion === targetSuggestion || suggestion.value === targetSuggestion.value) {
        return path
      }
      if (suggestion.children?.length) {
        const childPath = this.findPathToSuggestion(targetSuggestion, suggestion.children, path)
        if (childPath) {
          return childPath
        }
      }
    }
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
    const suggestionsToShow = this.visibleSuggestionsWithNotFound
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
  private selectSuggestion(
    suggestion: AutocompleteSuggestion,
    path: AutocompleteSuggestion[] = []
  ) {
    if ((suggestion.children?.length ?? 0) > 0) {
      this.ignoreNextBlur = true
      this.navigationPath = this.isPathExpanded(path) ? path.slice(0, -1) : path
      this._inputValue = ""
      this.highlightedIndex = -1
      this.showSuggestions = true
      void this.updateComplete.then(() => this.focusInput())
      return
    }

    // Don't change the input value for the "not found" special case
    if (suggestion.value !== "__NOT_FOUND__") {
      this.navigationPath = path.slice(0, -1)
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
      this.selectSuggestion(suggestion, this.findPathToSuggestion(suggestion) ?? [])
    }
    return suggestion
  }

  /**
   * Handles keyboard navigation for suggestions.
   * @param e - The keyboard event.
   */
  private onKeyDown(e: KeyboardEvent) {
    const suggestionsToShow = this.visibleSuggestionsWithNotFound
    if (suggestionsToShow.length === 0) return

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
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, suggestionsToShow.length - 1)
        break
      case "ArrowUp":
        e.preventDefault()
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
        break
      case "Enter":
        e.preventDefault()

        // If a suggestion is highlighted, select it
        if (this.highlightedIndex >= 0) {
          const suggestionToSelect = suggestionsToShow[this.highlightedIndex]
          this.selectSuggestion(suggestionToSelect.suggestion, suggestionToSelect.path)
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
          const suggestionToSelect = suggestionsToShow[this.highlightedIndex]
          this.selectSuggestion(suggestionToSelect.suggestion, suggestionToSelect.path)
        }
        break
    }
  }

  onFocus() {
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId)
      this.blurTimeoutId = undefined
    }
    this.showSuggestions = this.visibleSuggestions.length > 0
    this.highlightedIndex = -1
  }

  private onBlur() {
    if (this.ignoreNextBlur) {
      this.ignoreNextBlur = false
      return
    }

    this.blurTimeoutId = setTimeout(() => {
      this.showSuggestions = false
      this.blurTimeoutId = undefined
    }, BLUR_DELAY_MS)
  }

  override render() {
    return html`
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
          @blur=${() => this.onBlur()}
          aria-autocomplete="list"
          aria-controls=${this.suggestionId}
          aria-expanded=${this.showSuggestions}
          aria-activedescendant=${this.highlightedIndex >= 0
            ? this.getSuggestionItemId(this.highlightedIndex)
            : ""}
          part="autocomplete-input"
        />
        ${this.showSuggestions
          ? html`
              <ul
                class="autocomplete-list"
                id=${this.suggestionId}
                role="listbox"
                part="autocomplete-input-list"
              >
                ${this.visibleSuggestionsWithNotFound.map(
                  ({ suggestion, depth, path }, index) =>
                    html`<li
                      class="autocomplete-item ${classMap({
                        highlighted: index === this.highlightedIndex,
                        "not-found": suggestion.isNotFound === true,
                      })}"
                      role="option"
                      id=${this.getSuggestionItemId(index)}
                      @mousedown=${() => this.selectSuggestion(suggestion, path)}
                      @mouseenter=${() => (this.highlightedIndex = index)}
                      aria-selected=${index === this.highlightedIndex}
                    >
                      <span
                        class="autocomplete-item-content ${depth > 0
                          ? "autocomplete-item-tree"
                          : ""}"
                        style=${`padding-inline-start: ${10 + depth * 20}px;`}
                      >
                        ${suggestion.isNotFound
                          ? null
                          : html`<span class="autocomplete-item-expander">
                              ${(suggestion.children?.length ?? 0) > 0
                                ? this.isPathExpanded(path)
                                  ? "▾"
                                  : "▸"
                                : ""}
                            </span>`}
                        <span class="autocomplete-item-label"
                          >${suggestion.label ?? suggestion.value}</span
                        >
                      </span>
                    </li>`
                )}
              </ul>
            `
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
