import { LitElement, html, css, nothing } from "lit"
import { diffWordsWithSpace } from "diff"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { EventType } from "../../constants"
import { QuestionAnnotationAnswer } from "../../types/robotoff"
import "../icons/check"
import "../icons/cross"
import "../icons/skip"
import "../icons/edit"
import "../shared/info-button"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { TEXTAREA } from "../../styles/form"
import { POPOVER } from "../../styles/popover"
import {
  SAFE_LIGHT_GREEN,
  SAFE_LIGHT_GREY,
  SAFE_LIGHT_RED,
  SAFE_LIGHT_BLACK,
} from "../../utils/colors"
import { clickOutside } from "../../directives/click-outside"
import {
  ChangeType,
  IndexedChange,
  IndexedGroupedChange,
  TextCorrectorEventDetail,
} from "../../types/ingredients"
import { RELATIVE } from "../../styles/utils"

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
export class TextCorrector extends LitElement {
  static override styles = [
    BASE,
    TEXTAREA,
    POPOVER,
    RELATIVE,
    getButtonClasses([
      ButtonType.Cappucino,
      ButtonType.Success,
      ButtonType.Danger,
      ButtonType.White,
      ButtonType.LightRed,
      ButtonType.LightGreen,
    ]),
    css`
      .text-section,
      .summary {
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid ${SAFE_LIGHT_GREY};
        box-shadow: 0 0.5rem 2px -2px rgba(0, 0, 0, 0.1);
      }
      .summary {
        padding-bottom: 1rem;
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
      h2 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }
      .text-content {
        border-radius: 4px;
        white-space: pre-wrap;
        line-height: 1.5;
      }
      .deletion {
        background-color: ${SAFE_LIGHT_RED};
      }
      .spellcheck {
        padding: 2px 5px;
        border-radius: 15px;
        cursor: pointer;
      }
      .no-text-decoration {
        text-decoration: none;
      }
      .line-through {
        text-decoration: line-through;
      }
      .addition {
        background-color: ${SAFE_LIGHT_GREEN};
      }
      .no-changes {
        background-color: ${SAFE_LIGHT_GREY};
      }
      .summary-item-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .summary-item {
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }
      .summary-item :first-child {
        justify-self: end;
      }
      .summary-item :last-child {
        justify-self: start;
      }

      .summary-item-content.wrappable {
        flex-wrap: wrap;
      }
      .summary-label {
        font-weight: bold;
      }
      .code {
        white-space: pre-wrap;
        font-family: monospace;
      }
      .info-popover {
        z-index: 2;
        min-width: 200px;
      }

      .suggestion-button {
        height: 32px;
        font-weight: 500;
        border-radius: 30px;
      }
      .suggestion-button-title {
        font-weight: bold;
        text-align: center;
      }
      .suggestion-button,
      .suggestion-button-title {
        width: 200px;
      }

      .batch-buttons {
        display: none;
        margin-top: 1rem;
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
   * The result of the diff between the original and corrected text.
   * @type {IndexedChange[]}
   */
  @state()
  diffResult: IndexedChange[] = []

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
   * Keeps track of the value of the input when the user is editing the text.
   * @type {string}
   */
  @state()
  _value = ""

  /**
   * The text to compare against the current value.
   * @type {string}
   */
  @state()
  textToCompare = ""

  /**
   * Indicates whether the component is in edit mode.
   * @type {boolean}
   */
  @state()
  isEditMode = false

  @state()
  showInfoPopover: boolean = false

  /**
   * Checks if the confirm button should be disabled.
   * @returns {boolean} True if the confirm button should be disabled, false otherwise.
   */
  get isConfirmDisabled() {
    return !this.isEditMode && this.groupedChanges.length !== 0
  }

  /**
   * Gets the message to display when the confirm button is disabled.
   * @returns {string} The message to display.
   */
  get updateTextMsg() {
    return msg("Please fix the errors or modify the text before confirming")
  }

  /**
   * Updates the values of the component.
   */
  updateValues() {
    this.value = this.original
    this.textToCompare = this.correction
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
      this.computeWordDiff()
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

      if (current.removed && next && next.added) {
        // This is a "changed" item (something was removed and something else was added)
        this.groupedChanges.push({
          type: ChangeType.CHANGED,
          oldValue: current.value,
          newValue: next.value,
          indexes: [i, nextIndex],
        })
        i++ // Skip the next item as we've already processed it
      } else if (current.removed) {
        // This is a pure removal
        this.groupedChanges.push({
          type: ChangeType.REMOVED,
          value: current.value,
          indexes: [i],
        })
      } else if (current.added) {
        // This is a pure addition
        this.groupedChanges.push({
          type: ChangeType.ADDED,
          value: current.value,
          indexes: [i],
        })
      }
    }
  }

  /**
   * Computes the word-level diff between the original and corrected text.
   * @returns {IndexedChange[]} The diff result.
   */
  computeWordDiff() {
    // Use diffWordsWithSpace from the diff library for word-level diffing with preserved whitespace (including new lines)
    let value, textToCompare
    if (this.isEditMode) {
      value = this._value
      textToCompare = this.value
    } else {
      value = this.value
      textToCompare = this.textToCompare
    }
    this.diffResult = diffWordsWithSpace(value, textToCompare).map((part, index) => {
      return {
        ...part,
        index,
      }
    })

    // Group changes to identify "changed" items (adjacent removed and added)
    this.computeGroupedChanges()
    return this.diffResult
  }

  /**
   * Renders the highlighted diff between the original and corrected text.
   * @returns {TemplateResult} The rendered highlighted diff.
   */
  renderHighlightedDiff() {
    return html`${this.diffResult.map((part) => {
      if (part.added) {
        return html`<span class="addition popover-wrapper">${part.value}</span>`
      } else if (part.removed) {
        return html`<span class="deletion line-through popover">${part.value}</span>`
      } else {
        return html`<span>${part.value}</span>`
      }
    })}`
  }

  renderSpellCheckDiff() {
    let indexedGroupedChangeIndex = 0
    const groupedChanges = this.groupedChanges.filter(
      (change) => change.type === ChangeType.CHANGED
    )

    return html`${this.diffResult.map((part) => {
      const indexedGroupedChange = groupedChanges[indexedGroupedChangeIndex]
      // If the part is part of a grouped change
      if (indexedGroupedChange && indexedGroupedChange.indexes.includes(part.index)) {
        const isLastIndex = indexedGroupedChange.indexes[1] === part.index
        if (isLastIndex) {
          indexedGroupedChangeIndex++
          return nothing
        }
        return html`<span class="deletion spellcheck"
          >${indexedGroupedChange.oldValue || " "}</span
        >`
      } else if (part.added) {
        return html`<span class="deletion spellcheck">${" ".repeat(part.value.length)}</span>`
      } else if (part.removed) {
        return html`<span class="deletion spellcheck">${part.value}</span>`
      } else {
        return html`<span>${part.value}</span>`
      }
    })}`
  }

  /**
   * Gets the message to display for accepting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to get the message for.
   * @returns {string} The message to display.
   */
  getAcceptSuggestionMsg(item: IndexedGroupedChange) {
    if (item.type === ChangeType.CHANGED) {
      return msg("Accept this change")
    } else if (item.type === ChangeType.ADDED) {
      return msg("Accept this addition")
    } else if (item.type === ChangeType.REMOVED) {
      return msg("Accept this removal")
    }
    return ""
  }

  // Renders the empty suggestion when value is empty
  renderEmptySuggestion() {
    return nothing
  }

  cleanSuggestion(suggestion: string) {
    if (!suggestion) {
      return this.renderEmptySuggestion()
    }
    return suggestion.replace(/( |\u00A0)/g, "␣").replace("\n", "↩︎")
  }

  /**
   * Renders the button for accepting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to render the button for.
   * @returns {TemplateResult} The rendered button.
   */
  renderAcceptSuggestionButton(item: IndexedGroupedChange) {
    let text
    switch (item.type) {
      case ChangeType.CHANGED:
        text = html`${this.cleanSuggestion(item.newValue!)}`
        break
      case ChangeType.ADDED:
        text = html`${this.cleanSuggestion(item.value!)}`
        break
      case ChangeType.REMOVED:
        text = this.renderEmptySuggestion()
        break
    }
    return html`
      <button
        class="suggestion-button button light-green-button small"
        @click="${() => this.updateResult(true, [item])}"
      >
        <span class="pre-wrap">${text}</span>
      </button>
    `
  }

  /**
   * Renders the button for rejecting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to render the button for.
   * @returns {TemplateResult} The rendered button.
   */
  renderRejectSuggestionButton(item: IndexedGroupedChange) {
    let text
    switch (item.type) {
      case ChangeType.CHANGED:
        // replace espace and espace insecable with a visible character
        text = html`${this.cleanSuggestion(item.oldValue!)}`
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
    >
      <span class="pre-wrap">${text}</span>
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
  renderSummaryItemContent(item: IndexedGroupedChange) {
    return html`
      <div class="summary-item">
        ${this.renderRejectSuggestionButton(item)} ${this.renderAcceptSuggestionButton(item)}
      </div>
    `
  }

  toggleInfoPopover() {
    this.showInfoPopover = !this.showInfoPopover
  }

  closeInfoPopover() {
    this.showInfoPopover = false
  }

  /**
   * Renders the content of the summary.
   * @returns {TemplateResult} The rendered summary content.
   */
  renderSummary() {
    if (this.groupedChanges.length === 0) {
      return nothing
    }
    return html`<div class="summary">
      <div class="relative">
        <div class="info-button-wrapper">
          <info-button @click=${this.toggleInfoPopover}></info-button>
          ${this.renderInfoPopover()}
        </div>
      </div>
      <div class="summary-item-wrapper">
        <div class="summary-item">
          <div class="suggestion-button-title">${msg("Original")}</div>
          <div class="suggestion-button-title">${msg("Suggested fix")}</div>
        </div>

        ${this.groupedChanges.map((item) => {
          return this.renderSummaryItemContent(item)
        })}
      </div>
      ${this.renderBatchSuggestionsButtons()}
    </div>`
  }

  /**
   * Renders the buttons for batch suggestions.
   * @returns {TemplateResult | typeof nothing} The rendered buttons or nothing if there are no batch suggestions.
   */
  renderBatchSuggestionsButtons() {
    if (this.groupedChanges.length <= 1) {
      return nothing
    }
    return html`
      <div class="batch-buttons buttons-row">
        <button
          class="button danger-button small with-icon"
          @click="${() => this.updateBatchResult(false)}"
        >
          <span>${msg("Reject all corrections")}</span>
          <cross-icon></cross-icon>
        </button>
        <button
          class="button success-button small with-icon"
          @click="${() => this.updateBatchResult(true)}"
        >
          <span>${msg("Accept all corrections")}</span>

          <check-icon></check-icon>
        </button>
      </div>
    `
  }

  /**
   * Updates the result based on the validation of a suggestion.
   * @param {boolean} validate - Whether to validate the suggestion.
   * @param {IndexedGroupedChange} items - The suggestions to update the result for.
   */
  updateResult(validate: boolean, items: IndexedGroupedChange[]) {
    let value = ""
    let textToCompare = ""
    let indexedGroupedChangeIndex = 0
    for (const [index, change] of this.diffResult.entries()) {
      const item = items[indexedGroupedChangeIndex]
      if (item && item.indexes.includes(index)) {
        let newValue
        if (item.type === ChangeType.REMOVED) {
          newValue = validate ? "" : change.value
          indexedGroupedChangeIndex += 1
        } else if (item.type === ChangeType.ADDED) {
          newValue = validate ? change.value : ""
          indexedGroupedChangeIndex += 1
        } else if (item.type === ChangeType.CHANGED) {
          // If the change is a change, we need to check if the index is the first or second index to skip the other one
          if (item.indexes[1] === index) {
            // only increment the index because we already added the new value at the first index
            // and we don't want to add it again at the second index
            indexedGroupedChangeIndex += 1
            continue
          }
          newValue = validate ? item.newValue : item.oldValue
        }
        value += newValue
        textToCompare += newValue
      } else if (change.added) {
        textToCompare += change.value
      } else if (change.removed) {
        value += change.value
      } else {
        value += change.value
        textToCompare += change.value
      }
    }

    this.value = value
    this.textToCompare = textToCompare
    this.dispatchEvent(new CustomEvent("update", { detail: { result: value } }))
    this.computeWordDiff()
  }

  /**
   * Updates the result based on the validation of batch suggestions.
   * @param {boolean} validate - Whether to validate the suggestions.
   */
  updateBatchResult(validate: boolean) {
    this.updateResult(validate, this.groupedChanges)
  }

  /**
   * Dispatches a submit event with the provided detail.
   * @param {object} detail - The detail of the event.
   * @param {string} [detail.correction] - The correction to include in the event.
   * @param {QuestionAnnotationAnswer} detail.type - The type of the event.
   */
  dispatchSubmitEvent(detail: TextCorrectorEventDetail) {
    this.dispatchEvent(new CustomEvent<TextCorrectorEventDetail>(EventType.SUBMIT, { detail }))
  }

  /**
   * Accepts the text with a correction.
   */
  acceptTextWithCorrection() {
    this.dispatchSubmitEvent({
      correction: this.value,
      annotation: QuestionAnnotationAnswer.ACCEPT_AND_ADD_DATA,
    })
  }
  /**
   * Accepts the text.
   */
  acceptText() {
    this.dispatchSubmitEvent({ annotation: QuestionAnnotationAnswer.ACCEPT })
  }
  /**
   * Confirms the text.
   */
  confirmText() {
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
    this.dispatchSubmitEvent({ annotation: QuestionAnnotationAnswer.REFUSE })
  }
  /**
   * Skips the text.
   */
  skip() {
    this.dispatchSubmitEvent({ annotation: QuestionAnnotationAnswer.SKIP })
  }

  /**
   * Gets the result of the diff.
   * @returns {string} The result of the diff.
   */
  getResult() {
    return this.diffResult.map((change) => change.value).join("")
  }
  /**
   * Enters edit mode.
   */
  enterEditMode() {
    this.isEditMode = true
    this._value = this.value
    this.computeWordDiff()
  }

  /**
   * Cancels edit mode.
   */
  cancelEditMode() {
    this.value = this._value
    this.isEditMode = false
    this.computeWordDiff()
  }

  /**
   * Handles the change event of the textarea.
   * @param {Event} e - The change event.
   */
  handleTextareaChange(e: Event) {
    const textarea = e.target as HTMLTextAreaElement
    this.value = textarea.value
    this.computeWordDiff()
    this.dispatchEvent(new CustomEvent("update", { detail: { result: this.value } }))
  }

  /**
   * Renders the textarea for editing the text.
   * @returns {TemplateResult} The rendered textarea.
   */
  renderEditTextarea() {
    return html`
      <div class="text-section">
        <h2>${msg("Preview")}</h2>
        <p class="text-content">${this.renderHighlightedDiff()}</p>
      </div>
      <div class="">
        <h2>${msg("Edit ingredients list")}</h2>
        <textarea
          class="textarea"
          .value=${this.value}
          @input=${this.handleTextareaChange}
          rows="6"
        ></textarea>
      </div>
    `
  }

  /**
   * Renders the buttons of the component.
   * @returns {TemplateResult} The rendered buttons.
   */
  renderButtons() {
    const confirmTitle = this.isConfirmDisabled ? this.updateTextMsg : ""

    const successButton = html` <button
      class="button success-button with-icon"
      @click=${this.confirmText}
      ?disabled=${this.isConfirmDisabled}
      title=${confirmTitle}
    >
      <span>${msg("Save")}</span><check-icon></check-icon>
    </button>`
    if (this.isEditMode) {
      return html`
        <div class="submit-buttons buttons-row can-wrap">
          <button class="button cappucino-button with-icon" @click=${this.cancelEditMode}>
            <span>${msg("Cancel")}</span><cross-icon></cross-icon>
          </button>
          ${successButton}
        </div>
      `
    }

    return html`
      <div class="submit-buttons buttons-row can-wrap">
        <button class="button white-button with-icon" @click=${this.skip}>
          <span>${msg("Skip")}</span><skip-icon></skip-icon>
        </button>
        ${successButton}
      </div>
    `
  }

  renderSpellCheck() {
    return html`
      <div class="text-section">
        <p class="text">${this.renderSpellCheckDiff()}</p>
        <div style="display: flex; justify-content: flex-end;">
          <button class="button cappucino-button with-icon" @click=${this.enterEditMode}>
            <span>${msg("Edit")}</span><edit-icon></edit-icon>
          </button>
        </div>
      </div>
      ${this.renderSummary()}
    `
  }
  /**
   * Renders the component.
   * @returns {TemplateResult} The rendered component.
   */
  override render() {
    return html`
      <div>${this.isEditMode ? this.renderEditTextarea() : this.renderSpellCheck()}</div>
      <div class="submit-buttons-wrapper">${this.renderButtons()}</div>
    `
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
