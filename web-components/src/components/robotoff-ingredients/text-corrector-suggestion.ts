import { LitElement, html, nothing } from "lit"
import { customElement } from "lit/decorators.js"
import { msg } from "@lit/localize"
import { TextCorrectorMixin, IndexedGroupedChange, ChangeType } from "./text-corrector-mixin"
import "../icons/check"
import "../icons/cross"

@customElement("text-corrector-suggestion")
export class TextCorrectorSuggestion extends TextCorrectorMixin(LitElement) {
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    debugger
    super.attributeChangedCallback(name, _old, value)
    debugger
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
        <button
          class="button success-button small"
          @click="${() => this.updateResult(true, item)}"
          title="${this.getAcceptSuggestionMsg(item)}"
        >
          <check-icon></check-icon>
        </button>
        <button
          class="button danger-button small"
          @click="${() => this.updateResult(false, item)}"
          title="${this.getRejectSuggestionMsg(item)}"
        >
          <cross-icon></cross-icon>
        </button>
      </span>
    `
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

  renderSummaryContent() {
    return html`<div class="summary">
      <p>${msg("Please fix the errors or modify the text before confirming")}</p>
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

  override render() {
    return html`
      <div class="container">
        <div class="text-section">
          <p class="text-content">${this.renderHighlightedDiff()}</p>
        </div>

        <div class="text-section">${this.renderSummary()}</div>

        <slot name="buttons"></slot>
      </div>
    `
  }
}

// Define the custom element
declare global {
  interface HTMLElementTagNameMap {
    "text-corrector-suggestion": TextCorrectorSuggestion
  }
}
