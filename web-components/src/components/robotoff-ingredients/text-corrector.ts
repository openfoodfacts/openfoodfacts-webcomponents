import { LitElement, html, css, nothing } from "lit"
import { Change, diffWords } from "diff"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { EventType } from "../../constants"
import { QuestionAnnotationAnswer } from "../../types/robotoff"
import "../icons/check"
import "../icons/cross"
import "../icons/skip"
import { ButtonType, getButtonClasses } from "../../styles/buttons"

export enum ChangeType {
  ADDED = "added",
  REMOVED = "removed",
  CHANGED = "changed",
}

export type IndexedChange = Change & { index: number }
export type IndexedGroupedChange = {
  type: ChangeType
  value?: string
  oldValue?: string
  newValue?: string
  indexes: number[]
}

export enum SubmitType {
  ACCEPT = "accept",
  REJECT = "reject",
  SKIP = "skip",
}
@customElement("text-corrector")
export class TextCorrector extends LitElement {
  static override styles = [
    BASE,
    getButtonClasses([ButtonType.Cappucino, ButtonType.Success, ButtonType.Danger]),
    css`
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      .text-section {
        margin-bottom: 1.5rem;
      }
      h2 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }
      .text-content {
        background-color: #f8f8f8;
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

      .summary-item-content {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        gap: 1rem;
      }
      .summary-label {
        font-weight: bold;
      }
      .code {
        font-family: monospace;
      }
    `,
  ]
  @property({ type: String })
  original = ""

  @property({ type: String })
  correction = ""

  @state()
  diffResult: IndexedChange[] = []

  @state()
  groupedChanges: IndexedGroupedChange[] = []

  @state()
  value = ""

  @state()
  textToCompare = ""

  get isConfirmDisabled() {
    return this.groupedChanges.length !== 0
  }

  get updateTextMsg() {
    return msg("Please fix the errors or modify the text before confirming")
  }

  updateValues() {
    this.value = this.original
    this.textToCompare = this.correction
  }

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    if (name === "original" || name === "correction") {
      this.updateValues()
      this.computeWordDiff()
    }
  }

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
          oldValue: current.value.trim(),
          newValue: next.value.trim(),
          indexes: [i, nextIndex],
        })
        i++ // Skip the next item as we've already processed it
      } else if (current.removed) {
        // This is a pure removal
        this.groupedChanges.push({
          type: ChangeType.REMOVED,
          value: current.value.trim(),
          indexes: [i],
        })
      } else if (current.added) {
        // This is a pure addition
        this.groupedChanges.push({
          type: ChangeType.ADDED,
          value: current.value.trim(),
          indexes: [i],
        })
      }
    }
  }

  computeWordDiff() {
    // Use diffWords from the diff library for word-level diffing
    this.diffResult = diffWords(this.value, this.textToCompare).map((part, index) => {
      return {
        ...part,
        index,
      }
    })

    // Group changes to identify "changed" items (adjacent removed and added)
    this.computeGroupedChanges()
    return this.diffResult
  }

  renderHighlightedDiff() {
    return html`
      ${this.diffResult.map((part) => {
        if (part.added) {
          return html`<span class="addition">${part.value}</span>`
        } else if (part.removed) {
          return html`<span class="deletion">${part.value}</span>`
        } else {
          return html`<span>${part.value}</span>`
        }
      })}
    `
  }
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

  renderSuggestionButtons(item: IndexedGroupedChange) {
    return html`
      <span class="buttons-row">
        <button class="button success-button small" @click="${() => this.updateResult(true, item)}" title="${this.getAcceptSuggestionMsg(item)}"><check-icon></check-icon></button>
        <button class="button danger-button small" @click="${() => this.updateResult(false, item)}" title="${this.getRejectSuggestionMsg(item)}"><cross-icon></cross-icon></button>
      </div>
    `
  }

  renderSummaryContent() {
    return html`<div class="summary">
      <p>${this.updateTextMsg}</p>
      <ul>
        ${this.groupedChanges.map((item) => {
          let content
          if (item.type === ChangeType.CHANGED) {
            content = html`
              <span class="summary-label">${msg("Change:")}</span>
              <span class="code deletion">${item.oldValue}</span> →
              <span class="code addition">${item.newValue}</span>
              ${this.renderSuggestionButtons(item)}
            `
          } else if (item.type === ChangeType.REMOVED) {
            content = html`
              <span class="summary-label">${msg("Remove:")}</span>
              <span class="code deletion">${item.value}</span>
              ${this.renderSuggestionButtons(item)}
            `
          } else if (item.type === ChangeType.ADDED) {
            content = html`
              <span class="summary-label">${msg("Add:")}</span>
              <span class="code addition">${item.value}</span>
              ${this.renderSuggestionButtons(item)}
            `
          } else {
            return nothing
          }
          return html`
            <li class="summary-item">
              <div class="summary-item-content">${content}</div>
            </li>
          `
        })}
      </ul>
      ${this.renderBatchSuggestionsButtons()}
    </div> `
  }

  renderBatchSuggestionsButtons() {
    if (this.groupedChanges.length <= 1) {
      return nothing
    }
    return html`
      <div class="buttons-row">
        <button
          class="button success-button with-icon"
          @click="${() => this.updateBatchResult(true)}"
        >
          <span>${msg("Accept all suggestions")}</span>

          <check-icon></check-icon>
        </button>
        <button
          class="button danger-button with-icon"
          @click="${() => this.updateBatchResult(false)}"
        >
          <span>${msg("Reject all suggestions")}</span>
          <cross-icon></cross-icon>
        </button>
      </div>
    `
  }

  renderSummary() {
    if (this.groupedChanges.length === 0) {
      return nothing
    }
    return html`
      <div class="summary">
        <h2>${msg("Suggested changes:")}</h2>
        ${this.renderSummaryContent()}
      </div>
    `
  }

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

  updateBatchResult(validate: boolean) {
    this.groupedChanges.forEach((item) => this.updateResult(validate, item))
  }

  dispatchSubmitEvent(detail: { correction?: string; type: QuestionAnnotationAnswer }) {
    this.dispatchEvent(new CustomEvent(EventType.SUBMIT, { detail }))
  }

  acceptTextWithCorrection() {
    this.dispatchSubmitEvent({
      correction: this.value,
      type: QuestionAnnotationAnswer.ACCEPT_AND_ADD_DATA,
    })
  }
  acceptText() {
    this.dispatchSubmitEvent({ type: QuestionAnnotationAnswer.ACCEPT })
  }
  confirmText() {
    if (this.correction === this.value) {
      this.acceptText()
    } else if (this.original === this.value) {
      this.rejectText()
    } else {
      this.acceptTextWithCorrection()
    }
  }
  rejectText() {
    this.dispatchSubmitEvent({ type: QuestionAnnotationAnswer.REFUSE })
  }
  skip() {
    this.dispatchSubmitEvent({ type: QuestionAnnotationAnswer.SKIP })
  }

  getResult() {
    return this.diffResult.map((change) => change.value).join("")
  }
  renderButtons() {
    const confirmTitle = this.isConfirmDisabled ? this.updateTextMsg : ""
    return html`
        <div class="buttons-row">
            <button class="button success-button with-icon" @click=${this.confirmText} ?disabled=${this.isConfirmDisabled} title=${confirmTitle}>
              <span>${msg("Confirm the text")}</span><check-icon></check-icon>
            </button>

            <button class="button cappucino-button with-icon" @click=${this.skip}>
              <span>${msg("Skip")}</span><skip-icon></skip-icon>
            </button>
          </div>
        </div>
      `
  }
  override render() {
    return html`
      <div class="container">
        <div class="text-section">
          <h2>${msg("Text to be validated")}</h2>
          <p class="text-content">${this.renderHighlightedDiff()}</p>
        </div>

        <div class="text-section">${this.renderSummary()}</div>
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
