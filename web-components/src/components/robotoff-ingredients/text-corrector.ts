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
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { TEXTAREA } from "../../styles/form"
import { POPOVER } from "../../styles/popover"
import { SAFE_DARKER_WHITE, SAFE_LIGHT_GREY } from "../../utils/colors"
import { clickOutside } from "../../directives/click-outside"
import {
  ChangeType,
  IndexedChange,
  IndexedGroupedChange,
  TextCorrectorEventDetail,
} from "../../types/ingredients"

/**
 * TextCorrector component
 *
 * @fires submit - when the user submits the form
 * @fires skip - when the user skips the question
 */
@customElement("text-corrector")
export class TextCorrector extends LitElement {
  static override styles = [
    BASE,
    TEXTAREA,
    POPOVER,
    getButtonClasses([
      ButtonType.Cappucino,
      ButtonType.Success,
      ButtonType.Danger,
      ButtonType.White,
    ]),
    css`
      .text-section {
        margin-bottom: 1.5rem;
      }
      h2 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }
      .text-content {
        background-color: ${SAFE_DARKER_WHITE};
        border: 1px solid ${SAFE_LIGHT_GREY};
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        border-radius: 4px;
        white-space: pre-wrap;
        line-height: 1.5;
      }
      .deletion {
        background-color: #ffcccc;
        text-decoration: line-through;
      }
      .addition {
        background-color: #ccffcc;
      }
      .no-changes {
        background-color: ${SAFE_LIGHT_GREY};
      }

      .summary-item-content {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        gap: 1rem;
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
      .popover {
        width: 86px;
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

  /**
   * The grouped change currently displayed in the popover.
   * @type {IndexedGroupedChange | undefined}
   */
  @state()
  groupedChangesPopover?: IndexedGroupedChange = undefined

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
    this.groupedChangesPopover = undefined
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
   * The grouped change will be of type "changed" with the value "world" and the new value "universe"
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
   * Renders the suggestion popover for a given part of the diff.
   * @param {IndexedChange} part - The part of the diff to render the popover for.
   * @returns {TemplateResult | typeof nothing} The rendered popover or nothing if no popover should be shown.
   */
  renderSuggestionPopover(part: IndexedChange) {
    const self = this
    if (!this.groupedChangesPopover || part.index !== this.groupedChangesPopover.indexes[0])
      return nothing
    // Be careful, do not add spaces before and after the popover, it will break parent element's layout
    return html`<div class="popover" ${clickOutside(() => self.hideSuggestionPopover())}>
      <div class="popover-content">
        <div class="buttons-row">
          ${this.renderRejectSuggestionButton(this.groupedChangesPopover)}
          ${this.renderAcceptSuggestionButton(this.groupedChangesPopover)}
        </div>
      </div>
    </div>`
  }

  /**
   * Hides the suggestion popover.
   */
  hideSuggestionPopover() {
    this.groupedChangesPopover = undefined
  }

  /**
   * Shows the suggestion popover for a given part of the diff.
   * @param {IndexedChange} indexedChange - The part of the diff to show the popover for.
   */
  showSuggestionPopover(indexedChange: IndexedChange) {
    const groupedChange = this.groupedChanges.find((change) =>
      change.indexes.includes(indexedChange.index)
    )
    if (!groupedChange) return
    this.groupedChangesPopover = groupedChange
  }

  /**
   * Renders the highlighted diff between the original and corrected text.
   * @returns {TemplateResult} The rendered highlighted diff.
   */
  renderHighlightedDiff() {
    return html`${this.diffResult.map((part) => {
      if (part.added) {
        return html`<span
          class="addition popover-wrapper"
          @click="${() => this.showSuggestionPopover(part)}"
          >${part.value}${this.renderSuggestionPopover(part)}</span
        >`
      } else if (part.removed) {
        return html`<span
          class="deletion popover-wrapper"
          @click="${() => this.showSuggestionPopover(part)}"
          >${part.value}${this.renderSuggestionPopover(part)}</span
        >`
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
  /**
   * Gets the message to display for rejecting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to get the message for.
   * @returns {string} The message to display.
   */
  getRejectSuggestionMsg(item: IndexedGroupedChange) {
    if (item.type === ChangeType.CHANGED) {
      return msg("Reject this change")
    } else if (item.type === ChangeType.ADDED) {
      return msg("Reject this addition")
    } else if (item.type === ChangeType.REMOVED) {
      return msg("Reject this removal")
    }
    return ""
  }

  /**
   * Renders the button for accepting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to render the button for.
   * @returns {TemplateResult} The rendered button.
   */
  renderAcceptSuggestionButton(item: IndexedGroupedChange) {
    return html` <button
      class="button success-button small"
      @click="${() => this.updateResult(true, item)}"
      title="${this.getAcceptSuggestionMsg(item)}"
    >
      <check-icon></check-icon>
    </button>`
  }
  /**
   * Renders the button for rejecting a suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to render the button for.
   * @returns {TemplateResult} The rendered button.
   */
  renderRejectSuggestionButton(item: IndexedGroupedChange) {
    return html`
      <button
        class="button danger-button small"
        @click="${() => this.updateResult(false, item)}"
        title="${this.getRejectSuggestionMsg(item)}"
      >
        <cross-icon></cross-icon>
      </button>
    `
  }

  /**
   * Renders the content of a summary item.
   * @param {IndexedGroupedChange} item - The summary item to render the content for.
   * @returns {TemplateResult | undefined} The rendered content or undefined if the item type is not recognized.
   */
  renderSummaryItemContent(item: IndexedGroupedChange) {
    if (item.type === ChangeType.CHANGED) {
      const oldValue = item.oldValue!.replace(/ /g, "\u2423")
      const newValue = item.newValue?.replace(/ /g, "\u2423")
      return html`
        <div class="summary-item-content">
          ${this.renderRejectSuggestionButton(item)}
          <span class="code deletion">${oldValue}</span>
        </div>
        <div class="summary-item-content">→</div>
        <div class="summary-item-content">
          <span class="code addition">${newValue}</span>
          ${this.renderAcceptSuggestionButton(item)}
        </div>
      `
    } else if (item.type === ChangeType.REMOVED) {
      return html`
        <div class="summary-item-content">
          ${this.renderRejectSuggestionButton(item)}
          <span class="code no-changes"> ${item.value} </span>
        </div>
        <div class="summary-item-content">→</div>
        <div class="summary-item-content">
          <span class="code deletion">${item.value}</span>
          ${this.renderAcceptSuggestionButton(item)}
        </div>
      `
    } else if (item.type === ChangeType.ADDED) {
      return html`
        <div class="summary-item-content">
          ${this.renderRejectSuggestionButton(item)}
          <span class="code deletion"></span>
        </div>
        <div class="summary-item-content">→</div>
        <div class="summary-item-content">
          <span class="code addition">${item.value}</span>
          ${this.renderAcceptSuggestionButton(item)}
        </div>
      `
    } else {
      return
    }
  }

  /**
   * Renders the content of the summary.
   * @returns {TemplateResult} The rendered summary content.
   */
  renderSummaryContent() {
    return html`<div class="summary">
      <ul>
        ${this.groupedChanges.map((item) => {
          const content = this.renderSummaryItemContent(item)
          if (!content) {
            return nothing
          }
          return html`
            <li class="summary-item">
              <div class="summary-item-content wrappable">${content}</div>
            </li>
          `
        })}
      </ul>
      ${this.renderBatchSuggestionsButtons()}
    </div> `
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
      <div class="buttons-row" style="margin-left: 40px">
        <button
          class="button danger-button small with-icon"
          @click="${() => this.updateBatchResult(false)}"
        >
          <span>${msg("Reject all")}</span>
          <cross-icon></cross-icon>
        </button>
        <button
          class="button success-button small with-icon"
          @click="${() => this.updateBatchResult(true)}"
        >
          <span>${msg("Accept all")}</span>

          <check-icon></check-icon>
        </button>
      </div>
    `
  }

  /**
   * Renders the summary of the component.
   * @returns {TemplateResult | typeof nothing} The rendered summary or nothing if there are no grouped changes.
   */
  renderSummary() {
    if (this.groupedChanges.length === 0) {
      return nothing
    }
    return html`
      <div class="summary">
        <h2>${msg("Validate proposed changes:")}</h2>
        ${this.renderSummaryContent()}
      </div>
    `
  }

  /**
   * Updates the result based on the validation of a suggestion.
   * @param {boolean} validate - Whether to validate the suggestion.
   * @param {IndexedGroupedChange} item - The suggestion to update the result for.
   */
  updateResult(validate: boolean, item: IndexedGroupedChange) {
    console.log("Changes allowed", item)

    let value = ""
    let textToCompare = ""
    for (const [index, change] of this.diffResult.entries()) {
      if (item.indexes.includes(index)) {
        let newValue
        if (item.type === ChangeType.REMOVED) {
          newValue = validate ? "" : change.value
        } else if (item.type === ChangeType.ADDED) {
          newValue = validate ? change.value : ""
        } else if (item.type === ChangeType.CHANGED) {
          // If the change is a change, we need to check if the index is the first or second index to skip the other one
          if (item.indexes[1] === index) {
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
    this.computeWordDiff()
    this.dispatchEvent(new CustomEvent("update", { detail: { result: value } }))
  }

  /**
   * Updates the result based on the validation of batch suggestions.
   * @param {boolean} validate - Whether to validate the suggestions.
   */
  updateBatchResult(validate: boolean) {
    this.groupedChanges.forEach((item) => this.updateResult(validate, item))
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
      <div class="text-section">
        <h2>${msg("Edit text")}</h2>
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
      <span>${msg("Confirm the text")}</span><check-icon></check-icon>
    </button>`
    if (this.isEditMode) {
      return html`
        <div class="buttons-row can-wrap">
          ${successButton}
          <button class="button cappucino-button with-icon" @click=${this.cancelEditMode}>
            <span>${msg("Reset edit")}</span><cross-icon></cross-icon>
          </button>
        </div>
      `
    }

    return html`
      <div class="buttons-row can-wrap">
        ${successButton}

        <button class="button cappucino-button with-icon" @click=${this.enterEditMode}>
          <span>${msg("Edit")}</span><edit-icon></edit-icon>
        </button>

        <button class="button white-button with-icon" @click=${this.skip}>
          <span>${msg("Skip")}</span><skip-icon></skip-icon>
        </button>
      </div>
    `
  }
  /**
   * Renders the component.
   * @returns {TemplateResult} The rendered component.
   */
  override render() {
    return html`
      <div>
        ${this.isEditMode
          ? this.renderEditTextarea()
          : html`
              <div class="text-section">
                <p class="text-content">${this.renderHighlightedDiff()}</p>
              </div>
              <div class="text-section">${this.renderSummary()}</div>
            `}
        ${this.renderButtons()}
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
