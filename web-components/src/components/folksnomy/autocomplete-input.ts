import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { FOLKSONOMY_INPUT } from "../../styles/folksonomy-input";

/**
 * AutocompleteInput Component
 * @element autocomplete-input
 * @description A reusable autocomplete input field with suggestions.
 */
@customElement("autocomplete-input")
export class AutocompleteInput extends LitElement {
  @property({ type: String }) placeholder = "";
  @property({ type: String }) value = "";
  @property({ type: Array }) suggestions: string[] = [];
  @state() private showSuggestions = false;

  private onInput(e: Event) {
    const inputValue = (e.target as HTMLInputElement).value;
    this.value = inputValue;
    this.dispatchEvent(
      new CustomEvent("input-change", {
        detail: { value: inputValue },
        bubbles: true,
        composed: true,
      })
    );
  }

  private selectSuggestion(suggestion: string) {
    this.value = suggestion;
    this.showSuggestions = false;
    this.dispatchEvent(
      new CustomEvent("suggestion-select", {
        detail: { value: suggestion },
        bubbles: true,
        composed: true,
      })
    );
  }

  static override styles = [
    FOLKSONOMY_INPUT,
    css`
      .autocomplete-wrapper {
        position: relative;
        width: 100%;
      }

      .autocomplete-list {
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .autocomplete-item {
        padding: 10px;
        cursor: pointer;
      }

      .autocomplete-item:hover {
        background-color: #f0f0f0;
      }



      input[type="text"]:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
      }
    `,
  ];

  override render() {
    return html`
      <div class="autocomplete-wrapper">
        <input
          type="text"
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${this.onInput}
          @focus=${() => (this.showSuggestions = this.suggestions.length > 0)}
          @blur=${() => setTimeout(() => (this.showSuggestions = false), 150)}
        />
        ${this.showSuggestions
          ? html`<ul class="autocomplete-list">
              ${this.suggestions.map(
                (s) => html`<li class="autocomplete-item" @mousedown=${() => this.selectSuggestion(s)}>${s}</li>`
              )}
            </ul>`
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "autocomplete-input": AutocompleteInput;
  }
}
