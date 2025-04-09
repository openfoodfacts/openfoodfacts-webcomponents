import { LitElement, html, css, nothing } from "lit"
import { Change, diffWords } from "diff"
import { customElement, property, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import { msg } from "@lit/localize"
import { EventType } from "../../constants"
import { QuestionAnnotationAnswer } from "../../types/robotoff"

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
@customElement("spellchecker")
export class Spellchecker extends LitElement {
  @property({ type: String })
  value = ""

  @property({ type: String })
  original = ""

  @property({ type: String })
  correction = ""

  @state()
  diffResult: IndexedChange[] = []

  @state()
  groupedChanges: IndexedGroupedChange[] = []

  static override styles = [
    BASE,
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
      .summary-item {
        margin-bottom: 0.5rem;
      }
      .summary-label {
        font-weight: bold;
      }
      .code {
        font-family: monospace;
      }
    `,
  ]

  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    if (name === "original" || name === "correction") {
      this.computeWordDiff()
    }
  }

  computeGroupedChanges(): void {
    this.groupedChanges = []

    const changes = this.diffResult.filter((part) => part.added || part.removed)
    if (changes.length === 0) {
      return
    }

    for (let i = 0; i < changes.length; i++) {
      const current = changes[i]
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
    this.diffResult = diffWords(this.value, this.correction).map((part, index) => {
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

  renderSuggestionButtons(item: IndexedGroupedChange) {
    return html`
      <span class="button-section">
        <button @click="${() => this.updateResult(true, item)}">Allow Changes</button>
        <button @click="${() => this.updateResult(false, item)}">Reject Changes</button>
      </div>
    `
  }

  renderSummaryContent() {
    if (this.groupedChanges.length === 0) {
      return html`<p>${msg("No suggestions.")}</p>`
    }
    return html`<div class="summary">
      ${this.groupedChanges.map((item) => {
        if (item.type === ChangeType.CHANGED) {
          return html`
            <div class="summary-item">
              <span class="summary-label">${msg("Change:")}</span>
              <span class="code deletion">${item.oldValue}</span> →
              <span class="code addition">${item.newValue}</span>
              ${this.renderSuggestionButtons(item)}
            </div>
          `
        } else if (item.type === ChangeType.REMOVED) {
          return html`
            <div class="summary-item">
              <span class="summary-label">${msg("Remove:")}</span>
              <span class="code">${item.value}</span>
              ${this.renderSuggestionButtons(item)}
            </div>
          `
        } else if (item.type === ChangeType.ADDED) {
          return html`
            <div class="summary-item">
              <span class="summary-label">${msg("Add:")}:</span>
              <span class="code">${item.value}</span>
              ${this.renderSuggestionButtons(item)}
            </div>
          `
        }
        return nothing
      })}
    </div> `
  }

  renderSummary() {
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

    for (const [index, change] of this.diffResult.entries()) {
      if (item.indexes.includes(index)) {
        if (item.type === ChangeType.REMOVED) {
          value += validate ? "" : change.value
        } else if (item.type === ChangeType.ADDED) {
          value += validate ? change.value : ""
        } else if (item.type === ChangeType.CHANGED) {
          // If the change is a change, we need to check if the index is the first or second index to skip the other one
          if (item.indexes[1] === index) {
            continue
          }
          value += validate ? item.newValue : item.oldValue
        }
      } else {
        value += change.value
      }
    }

    this.dispatchEvent(new CustomEvent("update", { detail: { result: value } }))
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
    return html`
        <div>
            <button class="button success-button" @click=${this.confirmText}>
              ${msg("Accepter le texte")}
            </button>

            <button class="button cappucino-button" @click=${this.skip()}>${msg("Skip")}</button>
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
    spellchecker: Spellchecker
  }
}
