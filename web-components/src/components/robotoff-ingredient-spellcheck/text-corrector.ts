import { LitElement, html, css, nothing } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { EventType } from "../../constants"
import { AnnotationAnswer } from "../../types/robotoff"
import "../icons/check"
import "../icons/cross"
import "../icons/skip"
import "../icons/edit"
import "../shared/info-button"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { TEXTAREA } from "../../styles/form"
import { POPOVER } from "../../styles/popover"
import { SAFE_LIGHT_BLACK, SAFE_GREY, SAFE_LIGHT_GREY } from "../../utils/colors"
import { TEXT_CORRECTOR } from "../../styles/text-corrector"
import { clickOutside } from "../../directives/click-outside"
import {
  ChangeType,
  IndexedGroupedChange,
  TextCorrectorEventDetail,
} from "../../types/ingredient-spellcheck"
import { RELATIVE } from "../../styles/utils"
import { sanitizeHtml } from "../../utils/html"
import { Breakpoints } from "../../utils/breakpoints"

import "../shared/loading-button"
import "../shared/text-corrector-highlight"
import { triggerSubmit } from "../../utils"
import { TextDiffMixin } from "../../mixins/text-diff-mixin"
import { TextCorrectorHighlightInput } from "../../types"

// key is the index of the change in the groupedChanges array
// value is boolean indicating if the change is validated or not
export type ValidationChangeResult = Record<number, boolean>

export enum TextCorrectorKeyboardShortcut {
  ACCEPT_FIRST_SUGGESTION = "f",
  REJECT_FIRST_SUGGESTION = "o",
  SKIP_TEXT_CORRECTION = "k",
  EDIT_TEXT = "e",
  VALIDATE_CORRECTION = "s",
}

/**
 * TextCorrector component
 *
 * It allows the user to correct a text with the help of a list of changes.
 * It displays the text with the changes highlighted.
 * You can validate or reject the changes.
 * It also allows the user to edit the text manually.
 * The user can validates, rejects the changes, or skips the correction.
 * Validation can be done when all the changes are validated/rejected or if the user has edited the text manually.
 * @element text-corrector
 * @fires submit - when the user submits the form
 * @fires skip - when the user skips the question
 */
@customElement("text-corrector")
export class TextCorrector extends TextDiffMixin(LitElement) {
  static override styles = [
    BASE,
    TEXTAREA,
    POPOVER,
    RELATIVE,
    TEXT_CORRECTOR,
    getButtonClasses([ButtonType.Cappucino, ButtonType.LightRed, ButtonType.LightGreen]),
    css`
      .text {
        line-height: 1.4rem;
      }
      .summary {
        margin-bottom: 0.5rem;
        padding-top: 1.5rem;
        padding-bottom: 0rem;
        border-bottom: 1px solid ${SAFE_LIGHT_GREY};
        box-shadow: 0 0.5rem 2px -2px rgba(0, 0, 0, 0.1);
      }

      .submit-buttons-wrapper {
        margin-top: 1rem;
      }
      .submit-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .submit-buttons button {
        justify-content: center;
      }
      .spellcheck {
        padding: 2px 5px;
        border-radius: 15px;
        cursor: pointer;
      }

      .deletion.current {
        outline: 2px solid red;
      }
      .answered-change {
        background-color: ${SAFE_GREY};
      }
      .summary-item-wrapper {
        display: flex;
        height: 100%;
        max-height: 180px;
        overflow: hidden;
        flex-direction: column;
        gap: 1rem;
        padding-bottom: 1rem;

        margin-top: 1rem;

        @media (min-width: ${Breakpoints.SM}px) {
          max-height: none;
          overflow: auto;
          margin-top: 0;
        }
      }
      .summary-item {
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        box-sizing: border-box;
      }
      .summary-item :first-child {
        justify-self: end;
      }
      .summary-item :last-child {
        justify-self: start;
      }

      .info-popover {
        z-index: 2;
        min-width: 200px;
      }

      .suggestion-button {
        height: 32px;
        font-weight: 500;
        border-radius: 30px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
      .suggestion-button-title {
        font-weight: bold;
        text-align: center;
      }
      .suggestion-button,
      .suggestion-button-title {
        width: 100%;
      }

      .empty-suggestion {
        color: ${SAFE_LIGHT_BLACK};
        font-weight: bold;
      }

      .info-button-wrapper {
        position: absolute;
        top: -12px;
        right: 0;
      }
    `,
  ]
  /**
   * The original text to be corrected.
   * @type {string}
   */
  @property({ type: String })
  original = ""

  /**
   * The corrected text.
   * @type {string}
   */
  @property({ type: String })
  correction = ""

  /**
   * Enables keyboard mode for the component.
   * @type {boolean}
   */
  @property({ type: Boolean, attribute: "enable-keyboard-mode" })
  enableKeyboardMode = false

  @state()
  validateChangeResult: ValidationChangeResult = {}

  @state()
  currentAnsweredIndex: number = 0

  /**
   * The grouped changes based on the diff result.
   * @type {IndexedGroupedChange[]}
   */
  @state()
  groupedChanges: IndexedGroupedChange[] = []

  /**
   * The current value of the text being edited.
   * @type {string}
   */
  @state()
  value = ""

  /**
   * The text to compare against the current value.
   * @type {string}
   */
  @state()
  textToCompare = ""

  /**
   * Loading state for buttons
   */
  @property({ type: String, reflect: true })
  loading?: AnnotationAnswer

  /**
   * Indicates whether the component is in edit mode.
   * @type {boolean}
   */
  @state()
  isEditMode = false

  @state()
  showInfoPopover: boolean = false

  @state()
  resetAutoFocus: boolean = false

  @query("form")
  form!: HTMLFormElement

  /**
   * Checks if the confirm button should be disabled.
   * @returns {boolean} True if the confirm button should be disabled, false otherwise.
   */
  get isConfirmDisabled() {
    return (
      !this.isEditMode &&
      this.groupedChanges.some((_, index) => this.validateChangeResult[index] === undefined)
    )
  }

  /**
   * Gets the message to display when the confirm button is disabled.
   * @returns {string} The message to display.
   */
  get updateTextMsg() {
    return msg("Please fix the errors or modify the text before confirming")
  }

  get filteredNotAnsweredChanges() {
    return this.groupedChanges.filter((_, index) => {
      return this.validateChangeResult[index] === undefined
    })
  }

  /**
   * Called when an attribute is changed.
   * @param {string} name - The name of the attribute.
   * @param {string | null} _old - The old value of the attribute.
   * @param {string | null} value - The new value of the attribute.
   */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    if (name === "original" || name === "correction") {
      this.updateValues()
      this.computeWordDiff(true)
      this.resetAutoFocus = true
    }
  }
  /**
   * Called when the component is first updated.
   * Adds an event listener for the keydown event if keyboard mode is enabled.
   */
  override firstUpdated() {
    if (this.enableKeyboardMode) {
      this.form!.addEventListener("keydown", this.handleKeyboardShortcut.bind(this))
    }
  }

  /**
   * Called when the component is disconnected from the DOM.
   * Removes the event listener for the keydown event if keyboard mode is enabled.
   */
  override disconnectedCallback() {
    super.disconnectedCallback()
    if (this.enableKeyboardMode) {
      this.form!.removeEventListener("keydown", this.handleKeyboardShortcut.bind(this))
    }
  }

  /**
   * Renders the component.
   * @returns {TemplateResult} The rendered component.
   */
  override render() {
    return html`
      <form @submit=${this.confirmText}>
        <div>
          ${this.isEditMode
            ? html`<text-corrector-highlight
                .value=${this.value}
                original=${this.original}
                focus-on-first-updated
              ></text-corrector-highlight>`
            : this.renderSpellCheck()}
        </div>
        <div class="submit-buttons-wrapper">${this.renderButtons()}</div>
      </form>
    `
  }

  /**
   * Gets the data-id attribute for the accept suggestion button.
   * @param {number} index - The index of the suggestion.
   * @returns {string} The data-id attribute value.
   */
  getAcceptSuggestionButtonDataId(index: number) {
    return `accept-suggestion-${index}`
  }

  /**
   * Gets the keyboard shortcut text for a given shortcut.
   * @param {TextCorrectorKeyboardShortcut} shortcut - The keyboard shortcut.
   * @returns {string} The keyboard shortcut text.
   */
  getKeyboardShortcutText(shortcut: TextCorrectorKeyboardShortcut): string {
    if (!this.enableKeyboardMode || this.isEditMode) {
      return ""
    }
    return ` (${shortcut.toUpperCase()})`
  }
  /**
   * Updates the values of the component.
   */
  updateValues() {
    this.value = this.original
    this.textToCompare = this.correction
  }

  /**
   * Focuses the first button in the component.
   */
  focusFirstButton() {
    if (!this.enableKeyboardMode) {
      return
    }
    requestAnimationFrame(() => {
      const button = this.shadowRoot!.querySelector(
        `[data-id^="${this.getAcceptSuggestionButtonDataId(0)}"]`
      ) as HTMLButtonElement
      button.focus()
    })
  }

  /**
   * Focuses the save button in the component.
   */
  focusSaveButton() {
    if (!this.enableKeyboardMode) {
      return
    }
    requestAnimationFrame(() => {
      const loadingButton = this.shadowRoot!.querySelector(
        "loading-button[type='submit']"
      ) as HTMLElement
      if (loadingButton && loadingButton.shadowRoot) {
        const button = loadingButton.shadowRoot.querySelector("button") as HTMLButtonElement
        button?.focus()
      }
    })
  }

  /**
   * Lifecycle method called when the component is updated. It allow to focus the first button in the component when the component is updated.
   * @param changedProperties - The properties that have changed.
   *
   */
  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties)
    if (this.resetAutoFocus) {
      this.resetAutoFocus = false
      this.focusFirstButton()
    }
  }

  /**
   * Computes the grouped changes based on the diff result.
   * This method allows to group additions and removals in "changed" type.
   * For example, if the text is "hello world" and the correction is "hello universe"
   * The grouped change will be of type "changed" with the oldValue "world" and the newValue "universe"
   * instead of remove "world" and add "universe" separately
   */
  computeGroupedChanges(): void {
    this.groupedChanges = []
    this.currentAnsweredIndex = 0

    const changes = this.diffResult
    if (changes.length === 0) {
      return
    }

    for (let i = 0; i < changes.length; i++) {
      const current = changes[i]

      if (!current.added && !current.removed) {
        continue
      }
      const nextIndex = i + 1
      const next = nextIndex < changes.length ? changes[nextIndex] : null
      const position = this.groupedChanges.length

      if (current.removed && next && next.added) {
        // This is a "changed" item (something was removed and something else was added)
        this.groupedChanges.push({
          type: ChangeType.CHANGED,
          oldValue: current.value,
          newValue: next.value,
          indexes: [i, nextIndex],
          position,
        })

        i++ // Skip the next item as we've already processed it
      } else if (current.removed) {
        // This is a pure removal
        this.groupedChanges.push({
          type: ChangeType.REMOVED,
          value: current.value,
          indexes: [i],
          position,
        })
      } else if (current.added) {
        // This is a pure addition
        this.groupedChanges.push({
          type: ChangeType.ADDED,
          value: current.value,
          indexes: [i],
          position,
        })
      }
    }
  }

  /**
   * Computes the word-level diff between the original and corrected text.
   * @returns {IndexedChange[]} The diff result.
   */
  computeWordDiff(reset: boolean = false) {
    // Compute the diff result
    this.computeDiffResult(this.value, this.textToCompare)
    if (reset) {
      this.validateChangeResult = {}
    }
    // Group changes to identify "changed" items (adjacent removed and added)
    this.computeGroupedChanges()

    return this.diffResult
  }

  goToSuggestion(index: number) {
    this.currentAnsweredIndex = index
    // unanswered the question if it was answered
    this.unansweredChange(index)
  }

  unansweredChange(index: number) {
    delete this.validateChangeResult[index]
    this.requestUpdate()
  }

  renderChange(value: string, index: number, className: string) {
    // Replace newlines with <br/> for HTML rendering
    let cleanedValue = value.replace(/\n/g, "↩︎<br/>")
    // for other clean value like the suggestions
    cleanedValue = this.cleanSuggestion(cleanedValue)

    const isCurrent = this.currentAnsweredIndex === index

    return html`<span
      class="${className} spellcheck ${isCurrent ? "current" : ""}"
      @click=${() => this.goToSuggestion(index)}
      >${sanitizeHtml(cleanedValue)}</span
    >`
  }

  renderUnansweredChange(value: string, index: number) {
    return this.renderChange(value, index, "deletion")
  }

  renderAnsweredChange(value: string, index: number) {
    return this.renderChange(value, index, "answered-change")
  }

  renderSpellCheckDiff() {
    let indexedGroupedChangeIndex = 0

    return html`${this.diffResult.map((part) => {
      const indexedGroupedChange = this.groupedChanges[indexedGroupedChangeIndex]

      // If the part is the second index of a grouped change, we will increment the change index
      if (indexedGroupedChange?.indexes[1] === part.index) {
        indexedGroupedChangeIndex++
        return nothing
        // If the part is part of a grouped change
      } else if (indexedGroupedChange?.indexes[0] === part.index) {
        const currentIndex = indexedGroupedChangeIndex
        const isValidate = this.validateChangeResult[indexedGroupedChangeIndex]
        // We will increment change index with the second index of the grouped change
        if (indexedGroupedChange.type !== ChangeType.CHANGED) {
          indexedGroupedChangeIndex++
        }

        switch (indexedGroupedChange.type) {
          case ChangeType.ADDED:
            if (isValidate === undefined) {
              return this.renderUnansweredChange("", currentIndex)
            }
            return this.renderAnsweredChange(
              isValidate ? indexedGroupedChange.value! : "",
              currentIndex
            )
          case ChangeType.REMOVED:
            if (isValidate === undefined) {
              return this.renderUnansweredChange(indexedGroupedChange.value!, currentIndex)
            }
            return this.renderAnsweredChange(
              isValidate ? "" : indexedGroupedChange.value!,
              currentIndex
            )
          case ChangeType.CHANGED:
            if (isValidate === undefined) {
              return this.renderUnansweredChange(indexedGroupedChange.oldValue!, currentIndex)
            }
            return this.renderAnsweredChange(
              isValidate ? indexedGroupedChange.newValue! : indexedGroupedChange.oldValue!,
              currentIndex
            )
        }
      }
      // If the part is not part of a grouped change
      return html`<span>${part.value}</span>`
    })}`
  }

  // Renders the empty suggestion when value is empty
  renderEmptySuggestion() {
    return ""
  }

  /**
   * Cleans the suggestion by replacing spaces and newlines with special characters.
   * @param {string} suggestion - The suggestion to clean.
   * @returns {string} The cleaned suggestion.
   */
  cleanSuggestion(suggestion: string): string {
    if (!suggestion) {
      return this.renderEmptySuggestion()
    }
    let value = suggestion
    // Check if value contains only spaces or newlines
    if (value.match(/^( |\u00A0|\n)+$/)) {
      value = value.replace(/( |\u00A0)/g, "␣")
    }
    // Replace newlines with ↩︎
    return value.replace(/\n/g, "↩︎")
  }

  /**
   * Renders the button for accepting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to render the button for.
   * @param {number} index - The row index of the suggestion. This parameter is different of index of changes.
   * @returns {TemplateResult} The rendered button.
   */
  renderAcceptSuggestionButton(item: IndexedGroupedChange, index: number) {
    let text
    let keyboardShortcutText
    switch (item.type) {
      case ChangeType.CHANGED:
        text = `${this.cleanSuggestion(item.newValue!)}`
        break
      case ChangeType.ADDED:
        text = `${this.cleanSuggestion(item.value!)}`
        break
      case ChangeType.REMOVED:
        text = this.renderEmptySuggestion()
        break
    }
    return html`
      <button
        class="suggestion-button button light-green-button small"
        @click="${() => this.updateResult(true, [item])}"
        tabindex="1"
        data-id="${this.getAcceptSuggestionButtonDataId(index)}"
        title="${text}"
      >
        ${text}${keyboardShortcutText}
      </button>
    `
  }

  /**
   * Renders the button for rejecting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to render the button for.
   * @param {number} index - The row index of the suggestion. This parameter is different of index of changes.
   * @returns {TemplateResult} The rendered button.
   */
  renderRejectSuggestionButton(item: IndexedGroupedChange) {
    let text
    let keyboardShortcutText
    switch (item.type) {
      case ChangeType.CHANGED:
        // replace espace and espace insecable with a visible character
        text = `${this.cleanSuggestion(item.oldValue!)}`
        break
      case ChangeType.ADDED:
        text = this.renderEmptySuggestion()
        break
      case ChangeType.REMOVED:
        text = this.cleanSuggestion(item.value!)
        break
    }
    return html`<button
      class="suggestion-button button light-red-button small"
      @click="${() => this.updateResult(false, [item])}"
      tabindex="2"
      title="${text}"
    >
      ${text}${keyboardShortcutText}
    </button>`
  }

  /**
   * Renders a summary item content.
   * @param {Object} params - The parameters for rendering the summary item.
   * @param {IndexedGroupedChange} params.item - The suggestion to render.
   * @param {string} params.oldValue - The old value.
   * @param {string} params.newValue - The new value.
   * @param {string} [params.oldValueClass] - The class for the old value.
   * @param {string} [params.newValueClass] - The class for the new value.
   * @returns {TemplateResult} The rendered summary item.
   * */
  renderSummaryItemContent(item: IndexedGroupedChange, index: number) {
    return html`
      <div class="summary-item">
        ${this.renderRejectSuggestionButton(item)} ${this.renderAcceptSuggestionButton(item, index)}
      </div>
    `
  }

  /**
   * Toggles the info popover.
   */
  toggleInfoPopover() {
    this.showInfoPopover = !this.showInfoPopover
  }

  /**
   * Closes the info popover.
   */
  closeInfoPopover() {
    this.showInfoPopover = false
  }

  /**
   * Renders the content of the summary.
   * @returns {TemplateResult} The rendered summary content.
   */
  renderSummary() {
    let filteredNotAnsweredChanges = this.filteredNotAnsweredChanges
    if (filteredNotAnsweredChanges.length === 0) {
      return nothing
    }

    let notAnsweredChanges = [
      // Get next items from currentAnsweredIndex first
      ...filteredNotAnsweredChanges.filter(
        (change) => change.position >= this.currentAnsweredIndex
      ),
      // Then add items before currentAnsweredIndex
      ...filteredNotAnsweredChanges.filter((change) => change.position < this.currentAnsweredIndex),
    ]

    return html`<div class="summary">
      <div class="relative">
        <div class="info-button-wrapper">
          <info-button @click=${this.toggleInfoPopover}></info-button>
          ${this.renderInfoPopover()}
        </div>
      </div>
      <div class="summary-item-wrapper">
        <div class="summary-item">
          <div class="suggestion-button-title">
            ${msg("Original")}${this.getKeyboardShortcutText(
              TextCorrectorKeyboardShortcut.REJECT_FIRST_SUGGESTION
            )}
          </div>
          <div class="suggestion-button-title">
            ${msg("Suggested fix")}${this.getKeyboardShortcutText(
              TextCorrectorKeyboardShortcut.ACCEPT_FIRST_SUGGESTION
            )}
          </div>
        </div>

        ${notAnsweredChanges.map((item, index) => {
          return this.renderSummaryItemContent(item, index)
        })}
      </div>
    </div>`
  }

  /**
   * Updates the index of the next answered change.
   * If the current change is not answered, it finds the next unanswered change.
   * If there are no unanswered changes, it resets the index to 0.
   * @returns {void}
   */
  updateNextAnsweredIndex() {
    // If the current change is not answered, we don't update the index
    if (this.validateChangeResult[this.currentAnsweredIndex] === undefined) {
      return
    }

    const filteredNotAnsweredChanges = this.filteredNotAnsweredChanges
    // If there are no unanswered changes, we reset the index to 0
    if (filteredNotAnsweredChanges.length === 0) {
      this.currentAnsweredIndex = 0
      // focus on the save button to allow the user to save the result when all changes are answered
      this.focusSaveButton()
      return
    }
    // get the next unanswered change after the current one
    const nextFilteredNotAnsweredChanges = filteredNotAnsweredChanges.filter(
      (change) => change.position > this.currentAnsweredIndex
    )

    // If there are no unanswered changes after the current one, we take the first one
    this.currentAnsweredIndex =
      nextFilteredNotAnsweredChanges.length > 0
        ? nextFilteredNotAnsweredChanges[0].position
        : filteredNotAnsweredChanges[0].position

    // focus on the next unanswered change
    this.focusFirstButton()
  }

  /**
   * Updates the result based on the validation of a suggestion.
   * @param {boolean} validate - Whether to validate the suggestion.
   * @param {IndexedGroupedChange} items - The suggestions to update the result for.
   */
  updateResult(validate: boolean, items: IndexedGroupedChange[]) {
    // Do this if keyboard shortcut is used but all changes are answered
    if (this.filteredNotAnsweredChanges.length === 0) {
      return
    }

    items.forEach((item) => {
      this.validateChangeResult[item.position] = validate
    })
    this.updateNextAnsweredIndex()
    this.requestUpdate()
  }

  /**
   * Dispatches a submit event with the provided detail.
   * @param {object} detail - The detail of the event.
   * @param {string} [detail.correction] - The correction to include in the event.
   * @param {AnnotationAnswer} detail.type - The type of the event.
   */
  dispatchSubmitEvent(detail: TextCorrectorEventDetail) {
    this.dispatchEvent(new CustomEvent<TextCorrectorEventDetail>(EventType.SAVE, { detail }))
  }

  /**
   * Gets the value of a grouped change based on the validation result.
   * If groupedChange is not answered, it returns the original value.
   * If groupedChange is answered, it returns the value based on the validation result.
   * @param {IndexedGroupedChange} groupedChange - The grouped change.
   * @returns {string} The value of the grouped change.
   */
  getValueOfGroupedChange(groupedChange: IndexedGroupedChange): string {
    // get value of grouped change based on the validateChangeResult
    const result = this.validateChangeResult[groupedChange.position]
    switch (groupedChange.type) {
      case ChangeType.ADDED:
        return result ? groupedChange.value! : ""
      case ChangeType.REMOVED:
        return result ? "" : groupedChange.value!
      case ChangeType.CHANGED:
        return result ? groupedChange.newValue! : groupedChange.oldValue!
      default:
        return ""
    }
  }

  buildValueWithAnsweredChanges() {
    let value = ""
    let groupedChangesIndex = 0
    for (let index = 0; index < this.diffResult.length; index++) {
      const item = this.diffResult[index]
      const indexedGroupedChange = this.groupedChanges[groupedChangesIndex]
      if (indexedGroupedChange?.indexes.includes(index)) {
        value += this.getValueOfGroupedChange(indexedGroupedChange)
        // Go to next grouped change
        groupedChangesIndex++
        if (indexedGroupedChange.type === ChangeType.CHANGED) {
          // Skip next part of the diff result because changed type is composed of two parts
          index++
        }
      } else {
        value += item.value
      }
    }
    return value
  }

  /**
   * Accepts the text with a correction.
   */
  acceptTextWithCorrection() {
    this.dispatchSubmitEvent({
      correction: this.value,
      annotation: AnnotationAnswer.ACCEPT_AND_ADD_DATA,
    })
  }
  /**
   * Accepts the text.
   */
  acceptText() {
    this.dispatchSubmitEvent({ annotation: AnnotationAnswer.ACCEPT })
  }
  /**
   * Confirms the text.
   */
  confirmText(event?: SubmitEvent) {
    event?.preventDefault()
    // If there are answered changes, we don't want to submit the form
    if (!this.isEditMode && this.filteredNotAnsweredChanges.length) {
      return
    }
    // Build the value with the answered changes if we are not in edit mode
    if (!this.isEditMode) {
      this.value = this.buildValueWithAnsweredChanges()
    }
    this.isEditMode = false

    if (this.correction === this.value) {
      this.acceptText()
    } else if (this.original === this.value) {
      this.rejectText()
    } else {
      this.acceptTextWithCorrection()
    }
  }
  /**
   * Rejects the text.
   */
  rejectText() {
    this.dispatchSubmitEvent({ annotation: AnnotationAnswer.REFUSE })
  }
  /**
   * Skips the text.
   */
  skip() {
    this.dispatchSubmitEvent({ annotation: AnnotationAnswer.SKIP })
  }

  /**
   * Enters edit mode.
   */
  enterEditMode() {
    this.isEditMode = true
    this.value = this.buildValueWithAnsweredChanges()
  }

  /**
   * Cancels edit mode.
   */
  cancelEditMode() {
    this.updateValues()
    this.isEditMode = false
    this.computeWordDiff()
    this.filteredNotAnsweredChanges.length ? this.focusFirstButton() : this.focusSaveButton()
  }

  /**
   * Renders the buttons of the component.
   * @returns {TemplateResult} The rendered buttons.
   */
  renderButtons() {
    const confirmTitle = this.isConfirmDisabled ? this.updateTextMsg : ""

    const isLoading = Boolean(this.loading)
    const isSuccessLoading = [
      AnnotationAnswer.ACCEPT,
      AnnotationAnswer.ACCEPT_AND_ADD_DATA,
      AnnotationAnswer.REFUSE,
    ].includes(this.loading!)
    const successButton = html` <loading-button
      ?loading=${isSuccessLoading}
      ?disabled=${isLoading || this.isConfirmDisabled}
      type="submit"
      title=${confirmTitle}
      @click=${() => triggerSubmit(this.form!)}
      css-classes="button success-button"
    >
      <span
        >${msg("Save")}${this.getKeyboardShortcutText(
          TextCorrectorKeyboardShortcut.VALIDATE_CORRECTION
        )}</span
      >
      <check-icon></check-icon>
    </loading-button>`

    if (this.isEditMode) {
      return html`
        <div class="submit-buttons buttons-row can-wrap">
          <button
            class="button cappucino-button with-icon"
            @click=${this.cancelEditMode}
            ?disabled=${isLoading}
          >
            <span>${msg("Cancel")}</span><cross-icon></cross-icon>
          </button>
          ${successButton}
        </div>
      `
    }

    return html`
      <div class="submit-buttons buttons-row can-wrap">
        <loading-button
          ?loading=${this.loading === AnnotationAnswer.SKIP}
          ?disabled=${isLoading}
          css-classes="button white-button"
          @click=${this.skip}
        >
          <span
            >${msg("Skip")}${this.getKeyboardShortcutText(
              TextCorrectorKeyboardShortcut.SKIP_TEXT_CORRECTION
            )}</span
          ><skip-icon></skip-icon>
        </loading-button>
        ${successButton}
      </div>
    `
  }

  renderSpellCheck() {
    const isLoading = Boolean(this.loading)
    return html`
      <div class="text-section">
        <p class="text">${this.renderSpellCheckDiff()}</p>
        <div style="display: flex; justify-content: flex-end;">
          <button
            class="button cappucino-button with-icon"
            @click=${this.enterEditMode}
            ?disabled=${isLoading}
          >
            <span
              >${msg("Edit")}${this.getKeyboardShortcutText(
                TextCorrectorKeyboardShortcut.EDIT_TEXT
              )}</span
            ><edit-icon></edit-icon>
          </button>
        </div>
      </div>
      ${this.renderSummary()}
    `
  }

  /**
   * Handles the keyboard shortcuts.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  private handleKeyboardShortcut(event: KeyboardEvent) {
    if (!this.enableKeyboardMode || this.isEditMode) {
      return
    }
    switch (event.key) {
      case TextCorrectorKeyboardShortcut.ACCEPT_FIRST_SUGGESTION:
        this.updateResult(true, [this.groupedChanges[this.currentAnsweredIndex]])
        break
      case TextCorrectorKeyboardShortcut.REJECT_FIRST_SUGGESTION:
        this.updateResult(false, [this.groupedChanges[this.currentAnsweredIndex]])
        break
      case TextCorrectorKeyboardShortcut.SKIP_TEXT_CORRECTION:
        this.skip()
        break
      case TextCorrectorKeyboardShortcut.EDIT_TEXT:
        this.enterEditMode()
        event.preventDefault()
        break
      case TextCorrectorKeyboardShortcut.VALIDATE_CORRECTION:
        this.confirmText()
        break
    }
  }

  /**
   * Renders the info popover.
   * @returns {TemplateResult} The rendered info popover.
   */
  renderInfoPopover() {
    if (!this.showInfoPopover) {
      return nothing
    }
    return html`
      <div class="popover popover-left info-popover" ${clickOutside(() => this.closeInfoPopover())}>
        <div class="popover-content">
          <p>
            ${msg(
              html`This tool allows you to correct the ingredients list. You can add, remove or edit
                ingredients list.
                <br />
                This character <span class="highlight">␣</span> represents a space.
                <br />
                This character <span class="highlight">↩︎</span> represents a line break. `
            )}
          </p>
        </div>
      </div>
    `
  }
}

// Define the custom element
declare global {
  interface HTMLElementTagNameMap {
    "text-corrector": TextCorrector
  }
}
