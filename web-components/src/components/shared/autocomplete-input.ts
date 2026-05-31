import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { classMap } from "lit/directives/class-map.js"
import type { AutocompleteSuggestion, AutocompleteInputChangeEventDetail } from "../../types"
import { SAFE_BLUE } from "../../utils/colors"
import { randomIdGenerator } from "../../utils"
import { createDebounce } from "../../utils/debounce"
import { styleMap } from "lit-html/directives/style-map.js"
import { msg } from "@lit/localize/init/install"

const BLUR_DELAY_MS = 150
const MAX_VISIBLE_SUGGESTIONS = 100

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
    BASE,
    css`
      .autocomplete-wrapper {
        width: 100%;
        position: relative;
      }

      .autocomplete-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--off-autocomplete-border, #ccc);
        border-radius: 0.25rem;
        box-sizing: border-box;
        font-size: 0.9rem;
        height: 2.2rem;
        background-color: var(--off-autocomplete-bg, #fff);
        color: var(--off-autocomplete-text, #333);
        font-family: inherit;
      }

      .autocomplete-input:focus {
        outline: none;
        border-color: var(--off-autocomplete-focus-border, ${SAFE_BLUE});
        box-shadow: 0 0 0 3px var(--off-autocomplete-focus-shadow, rgba(0, 123, 255, 0.25));
      }

      .autocomplete-list {
        position: absolute;
        background: var(--off-autocomplete-bg, #fff);
        border: 1px solid var(--off-autocomplete-border, #ccc);
        border-top: none;
        list-style-type: none;
        padding: 0;
        margin: 0;
        max-height: 18.75rem;
        overflow-y: auto;
        z-index: 9999;
        width: 100%;
        color: var(--off-autocomplete-text, #333);
        box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
      }

      .autocomplete-list.is-flipped {
        bottom: 100%;
        border-top: 1px solid var(--off-autocomplete-border, #ccc);
        border-bottom: none;
        box-shadow: 0 -0.25rem 0.5rem rgba(0, 0, 0, 0.1);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .autocomplete-item {
        cursor: pointer;
      }

      .autocomplete-item:hover,
      .autocomplete-item.highlighted {
        background-color: var(--off-autocomplete-hover-bg, #f0f0f0);
      }

      .autocomplete-item-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem;
      }

      .autocomplete-item-tree {
        border-left: 1px solid var(--off-autocomplete-border, #e5e7eb);
        margin-left: 1rem;
      }

      .autocomplete-item-expander {
        color: var(--off-autocomplete-text-secondary, #6c757d);
        flex: 0 0 1.25rem;
        font-size: 1rem;
        text-align: center;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
      }

      .autocomplete-item-expander:hover {
        background-color: var(--off-autocomplete-hover-bg, #e9ecef);
        color: var(--off-autocomplete-text, #212529);
      }

      .autocomplete-item-label {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .autocomplete-item-breadcrumb {
        font-size: 0.75rem;
        color: var(--off-autocomplete-text-secondary, #6c757d);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .autocomplete-item-text {
        font-weight: 500;
      }

      .match-highlight {
        color: var(--off-autocomplete-accent, ${SAFE_BLUE});
        font-weight: 700;
        text-decoration: underline;
      }

      .autocomplete-item.not-found {
        background-color: var(--off-autocomplete-bg-alt, #f8f9fa);
        border-top: 1px solid var(--off-autocomplete-border, #ddd);
        color: var(--off-autocomplete-accent, #007bff);
        font-style: italic;
      }

      .autocomplete-item.not-found .autocomplete-item-content {
        padding: 0.75rem 0.625rem;
      }

      .autocomplete-item.not-found:hover {
        background-color: var(--off-autocomplete-hover-bg, #e7f3ff);
      }

      .autocomplete-item.not-found.highlighted {
        background-color: var(--off-autocomplete-hover-bg, #d4ebff);
        font-weight: normal;
      }

      @media (prefers-color-scheme: dark) {
        .autocomplete-input {
          background-color: var(--off-autocomplete-bg, #2a2a3a);
          border-color: var(--off-autocomplete-border, #555);
          color: var(--off-autocomplete-text, #e0e0e0);
        }

        .autocomplete-list {
          background: var(--off-autocomplete-bg, #1e1e2e);
          border-color: var(--off-autocomplete-border, #444);
          color: var(--off-autocomplete-text, #e0e0e0);
        }

        .autocomplete-item:hover,
        .autocomplete-item.highlighted {
          background-color: var(--off-autocomplete-hover-bg, #2d3748);
        }

        .autocomplete-item-tree {
          border-left-color: var(--off-autocomplete-border, #444);
        }

        .autocomplete-item.not-found {
          background-color: var(--off-autocomplete-bg-alt, #252535);
          border-top-color: var(--off-autocomplete-border, #444);
          color: var(--off-autocomplete-accent, #5b9bd5);
        }

        .match-highlight {
          color: var(--off-autocomplete-accent, #e8a87c);
        }
      }
    `,
  ]

  /**
   * Placeholder text for the input field.
   */
  @property({ type: String })
  placeholder = ""

  /**
   * Delay in milliseconds before triggering the search after input.
   */
  @property({ type: Number, attribute: "debounce-delay" })
  debounceDelay = 200

  /**
   * The direction in which the dropdown opens.
   */
  @property({ type: String, attribute: "dropdown-direction" })
  dropdownDirection: "top" | "bottom" = "bottom"

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
  @property({ type: Array })
  suggestions: AutocompleteSuggestion[] = []

  /**
   * Whether to show a "not found" option when no suggestions match.
   */
  @property({ type: Boolean, attribute: "show-not-found-option" })
  showNotFoundOption = false

  /**
   * Text to display for the "not found" option.
   */
  @property({ type: String, attribute: "not-found-text" })
  notFoundText = msg("Not found")

  /**
   * Whether to show the suggestions dropdown.
   * @private
   */
  @state()
  private showSuggestions = false

  /**
   * Index of the currently highlighted suggestion.
   * @private
   */
  @state()
  get highlightedIndex() {
    return this._highlightedIndex
  }
  set highlightedIndex(val: number) {
    const oldVal = this._highlightedIndex
    this._highlightedIndex = val
    this.requestUpdate("highlightedIndex", oldVal)

    if (val >= 0 && val !== oldVal) {
      void this.updateComplete.then(() => {
        const highlightedElement = this.renderRoot.querySelector(".autocomplete-item.highlighted")
        highlightedElement?.scrollIntoView({ block: "nearest" })
      })
    }
  }

  @state()
  private _highlightedIndex = -1

  /**
   * Selected hierarchy path when browsing nested suggestions.
   * @private
   */
  @state()
  private navigationPath: AutocompleteSuggestion[] = []

  /**
   * Unique ID for the input field.
   * @private
   */
  @state()
  private _id: string = ""

  @state()
  private _inputValue: string = ""

  @state()
  private _announcement = ""

  private ignoreNextBlur = false
  private blurTimeoutId?: ReturnType<typeof setTimeout>
  private searchDebounce = createDebounce(this.debounceDelay)

  override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("debounceDelay")) {
      this.searchDebounce.clear()
      this.searchDebounce = createDebounce(this.debounceDelay)
    }
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
   * Combined search and browse logic.
   * @private
   */
  get visibleSuggestions() {
    const results: VisibleSuggestion[] = []
    this.getVisibleSuggestions(this.suggestions, this.value, 0, [], results)
    return results.slice(0, MAX_VISIBLE_SUGGESTIONS)
  }

  /**
   * Recursive method to get visible suggestions based on search and expansion state.
   */
  private getVisibleSuggestions(
    suggestions: AutocompleteSuggestion[],
    inputValue: string,
    depth = 0,
    parentPath: AutocompleteSuggestion[] = [],
    results: VisibleSuggestion[] = [],
    forceShow = false
  ): void {
    const searchMode = !!inputValue
    for (const suggestion of suggestions) {
      if (results.length >= MAX_VISIBLE_SUGGESTIONS) break

      const path = [...parentPath, suggestion]
      const matches = this.getSuggestionTextToFilter(suggestion).includes(inputValue.toLowerCase())
      const isExpanded = this.isPathExpanded(path)

      // In search mode, we only show matches at the "top level" of the search results
      // unless we are inside an expanded branch (forceShow).
      const shouldShowThis = forceShow || (searchMode && matches) || (!searchMode && matches)

      if (shouldShowThis) {
        results.push({ suggestion, depth, path })
        if (suggestion.children?.length && isExpanded) {
          // If expanded, we show all children indented
          this.getVisibleSuggestions(
            suggestion.children,
            inputValue,
            depth + 1,
            path,
            results,
            true // forceShow children because parent is expanded
          )
        }
      } else if (searchMode && !forceShow) {
        // If we're searching and this didn't match, we still need to check children
        if (suggestion.children?.length) {
          this.getVisibleSuggestions(
            suggestion.children,
            inputValue,
            depth, // Keep same depth for "new roots" in search results
            path,
            results,
            false
          )
        }
      } else if (!searchMode) {
        // Normal browse mode: if not forceShow (root) and not matching (all match empty),
        // this part shouldn't really be hit but for safety:
        results.push({ suggestion, depth, path })
        if (suggestion.children?.length && isExpanded) {
          this.getVisibleSuggestions(
            suggestion.children,
            inputValue,
            depth + 1,
            path,
            results,
            true
          )
        }
      }
    }
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
    this.searchDebounce.clear()
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
    inputValue: string,
    results: AutocompleteSuggestion[] = []
  ): AutocompleteSuggestion[] {
    for (const suggestion of suggestions) {
      if (results.length >= MAX_VISIBLE_SUGGESTIONS) break

      const matches = this.getSuggestionTextToFilter(suggestion).includes(inputValue.toLowerCase())
      if (matches) {
        results.push(suggestion)
      }

      if (suggestion.children?.length) {
        this.findMatchingSuggestions(suggestion.children, inputValue, results)
      }
    }
    return results
  }

  private isPathExpanded(path: AutocompleteSuggestion[]) {
    return (
      path.length > 0 &&
      path.every((suggestion, index) => this.navigationPath[index]?.value === suggestion.value)
    )
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

    this.searchDebounce.debounce(() => {
      const filteredSuggestions = this.filteredSuggestions
      const suggestionsToShow = this.visibleSuggestionsWithNotFound
      this.showSuggestions = suggestionsToShow.length > 0

      // Accessibility announcement
      if (this.showSuggestions) {
        const count = suggestionsToShow.length
        this._announcement =
          count === 1 ? msg("1 suggestion found") : msg(`${count} suggestions found`)
      } else if (inputValue.trim().length > 0) {
        this._announcement = this.notFoundText
      } else {
        this._announcement = ""
      }

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
    })
  }

  private toggleExpansion(e: Event, path: AutocompleteSuggestion[]) {
    e.stopPropagation()
    this.ignoreNextBlur = true
    this.navigationPath = this.isPathExpanded(path) ? path.slice(0, -1) : path
    this.showSuggestions = true
    void this.updateComplete.then(() => this.focusInput())
  }

  /**
   * Selects a suggestion and dispatches the "suggestion-select" event.
   * @param suggestion - The selected suggestion.
   */
  private selectSuggestion(
    suggestion: AutocompleteSuggestion,
    path: AutocompleteSuggestion[] = []
  ) {
    if (suggestion.value === "__NOT_FOUND__") {
      this.showSuggestions = false
      this.dispatchEvent(
        new CustomEvent<AutocompleteSuggestion>("suggestion-select", {
          detail: suggestion,
          bubbles: true,
          composed: true,
        })
      )
      return
    }

    this.navigationPath = path.slice(0, -1)
    this._inputValue = suggestion.value
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

  private renderLabel(
    suggestion: AutocompleteSuggestion,
    path: AutocompleteSuggestion[],
    index: number,
    visibleSuggestions: VisibleSuggestion[]
  ) {
    const label = suggestion.label ?? suggestion.value
    const isSearching = !!this.value

    let content
    if (isSearching) {
      const searchIndex = label.toLowerCase().indexOf(this.value.toLowerCase())
      if (searchIndex >= 0) {
        content = html`
          ${label.substring(0, searchIndex)}<span class="match-highlight"
            >${label.substring(searchIndex, searchIndex + this.value.length)}</span
          >${label.substring(searchIndex + this.value.length)}
        `
      } else {
        content = label
      }
    } else {
      content = label
    }

    // Context logic:
    // 1. If the parent is visible immediately above, we indent and show no breadcrumb.
    // 2. Otherwise (top-level search result), we show the breadcrumb.
    const parentSuggestion = path.length > 1 ? path[path.length - 2] : null
    const previousVisibleSuggestion = index > 0 ? visibleSuggestions[index - 1] : null
    const isParentVisible =
      parentSuggestion && previousVisibleSuggestion?.suggestion.value === parentSuggestion.value

    const showBreadcrumb = isSearching && parentSuggestion && !isParentVisible
    const breadcrumb = showBreadcrumb
      ? path
          .slice(0, -1)
          .map((p) => p.label ?? p.value)
          .join(" > ")
      : ""

    return html`
      <div class="autocomplete-item-label">
        ${breadcrumb ? html`<span class="autocomplete-item-breadcrumb">${breadcrumb}</span>` : null}
        <span class="autocomplete-item-text">${content}</span>
      </div>
    `
  }

  override render() {
    const visibleSuggestions = this.visibleSuggestionsWithNotFound
    return html`
      <div class="autocomplete-wrapper">
        <div class="sr-only" aria-live="polite" aria-atomic="true">${this._announcement}</div>
        <input
          id=${this._id}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
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
                class=${classMap({
                  "autocomplete-list": true,
                  "is-flipped": this.dropdownDirection === "top",
                })}
                id=${this.suggestionId}
                role="listbox"
                part="autocomplete-input-list"
              >
                ${visibleSuggestions.map(({ suggestion, depth, path }, index) => {
                  const parentSuggestion = path.length > 1 ? path[path.length - 2] : null
                  const previousVisibleSuggestion = index > 0 ? visibleSuggestions[index - 1] : null
                  const isParentVisible =
                    parentSuggestion &&
                    previousVisibleSuggestion?.suggestion.value === parentSuggestion.value

                  // Use indentation if parent is visible (tree feel)
                  const useIndentation = isParentVisible || (!this.value && depth > 0)
                  const effectiveDepth = useIndentation ? depth : 0

                  return html`<li
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
                      class=${classMap({
                        "autocomplete-item-content": true,
                        "autocomplete-item-tree": useIndentation,
                      })}
                      style=${styleMap({
                        "padding-inline-start": `${0.625 + effectiveDepth * 1.25}rem`,
                      })}
                    >
                      ${suggestion.isNotFound
                        ? nothing
                        : html`<span
                            class="autocomplete-item-expander"
                            @mousedown=${(e: Event) => this.toggleExpansion(e, path)}
                          >
                            ${(suggestion.children?.length ?? 0) > 0
                              ? this.isPathExpanded(path)
                                ? "▾"
                                : "▸"
                              : ""}
                          </span>`}
                      ${suggestion.isNotFound
                        ? html`<span class="autocomplete-item-label"
                            >${suggestion.label ?? suggestion.value}</span
                          >`
                        : this.renderLabel(suggestion, path, index, visibleSuggestions)}
                    </span>
                  </li>`
                })}
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
