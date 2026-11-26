import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import { repeat } from "lit/directives/repeat.js"
import type { PackagingComponent } from "@openfoodfacts/openfoodfacts-nodejs"
import { AutocompleteInput } from "../shared/autocomplete-input"
import type { AutocompleteSuggestionSelectEvent } from "../../types"
import { BASE } from "../../styles/base"
import { INPUT } from "../../styles/form"
import {
  SAFE_BLUE,
  SAFE_CAPPUCINO,
  SAFE_CHOCOLATE,
  SAFE_DARKER_WHITE,
  SAFE_GREY,
  SAFE_LIGHT_BLACK,
} from "../../utils/colors"

export interface PackagingChangeEventDetail {
  packagings: PackagingComponent[]
}

export type PackagingChangeEvent = CustomEvent<PackagingChangeEventDetail>

/**
 * Basic packaging editor. The host application is responsible for saving changes.
 * @element packaging-input
 * @fires packaging-change - A snapshot of the list after a user edit.
 */
@customElement("packaging-input")
@localized()
export class PackagingInput extends LitElement {
  private nextPartKey = 0
  private partKeys: number[] = []
  private lastInternalPackagings: readonly PackagingComponent[] | null | undefined
  static override styles = [
    BASE,
    INPUT,
    css`
      :host {
        display: block;
        color: ${SAFE_LIGHT_BLACK};
        line-height: 1.5;
      }
      fieldset {
        min-width: 0;
        margin: 0 0 1rem;
        padding: 1rem;
        border: 1px solid ${SAFE_GREY};
        border-radius: 0.5rem;
        background: ${SAFE_DARKER_WHITE};
      }
      legend {
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
        background: ${SAFE_CAPPUCINO};
        color: ${SAFE_CHOCOLATE};
        font-weight: 600;
      }
      label {
        display: grid;
        gap: 0.5rem;
        font-weight: 600;
      }
      .taxonomy-field {
        display: grid;
        gap: 0.5rem;
        margin-top: 1rem;
        font-weight: 600;
      }
      input {
        box-sizing: border-box;
        width: 100%;
        min-height: 2.75rem;
        padding: 0.5rem;
        font: inherit;
        font-weight: 400;
      }
      /* Keep native number controls: the shared INPUT styles hide them. */
      .input-number {
        appearance: auto;
        -webkit-appearance: auto !important;
        -moz-appearance: auto !important;
      }
      .input-number::-webkit-outer-spin-button,
      .input-number::-webkit-inner-spin-button {
        -webkit-appearance: auto;
      }
      input:focus-visible {
        outline: 2px solid ${SAFE_BLUE};
        outline-offset: 2px;
      }
      dl {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
        gap: 0.5rem 1rem;
        margin-bottom: 0;
      }
      dt {
        font-weight: 600;
        overflow-wrap: anywhere;
      }
      dd {
        margin: 0;
        overflow-wrap: anywhere;
      }
      p {
        padding: 1rem;
        border: 1px dashed ${SAFE_GREY};
        border-radius: 0.5rem;
        background: ${SAFE_DARKER_WHITE};
      }
    `,
  ]

  /** Replace the array to apply external updates. Null and undefined mean an empty list. */
  @property({ attribute: false })
  packagings: readonly PackagingComponent[] | null | undefined = []

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has("packagings")) {
      const newParts = this.packagings ?? []
      if (this.packagings !== this.lastInternalPackagings) {
        this.partKeys = newParts.map(() => this.nextPartKey++)
      }
    }
  }

  private emit(next: PackagingComponent[], keys: number[]) {
    this.partKeys = keys
    this.packagings = next
    this.lastInternalPackagings = next
    this.dispatchEvent(
      new CustomEvent<PackagingChangeEventDetail>("packaging-change", {
        detail: { packagings: structuredClone(next) },
        bubbles: true,
        composed: true,
      })
    )
  }

  private async focusUnits(index: number) {
    await this.updateComplete
    if (index < 0) {
      this.shadowRoot?.querySelector<HTMLButtonElement>("[data-add-focus]")?.focus()
      return
    }
    this.shadowRoot?.querySelector<HTMLInputElement>(`[data-part-index="${index}"]`)?.focus()
  }

  private async addPart() {
    const next = structuredClone(this.packagings ?? []) as PackagingComponent[]
    const keys = [...this.partKeys, this.nextPartKey++]
    next.push({})
    this.emit(next, keys)
    await this.focusUnits(next.length - 1)
  }

  private async removePart(index: number) {
    const next = structuredClone(this.packagings ?? []) as PackagingComponent[]
    const keys = [...this.partKeys]
    next.splice(index, 1)
    keys.splice(index, 1)
    this.emit(next, keys)
    await this.focusUnits(next.length === 0 ? -1 : Math.min(index, next.length - 1))
  }

  private changeUnits(index: number, input: HTMLInputElement) {
    // Let the browser explain invalid input. Keep the last accepted data unchanged.
    if (!input.reportValidity()) return
    const parts = this.packagings ?? []
    const current = parts[index]
    if (!current) return
    const units = input.value === "" ? undefined : input.valueAsNumber
    if (current.number_of_units === units) return

    const next = structuredClone(parts) as PackagingComponent[]
    if (units === undefined) {
      delete next[index].number_of_units
    } else {
      next[index].number_of_units = units
    }
    this.emit(next, [...this.partKeys])
  }
  private changeTaxonomyField(
    index: number,
    field: "shape" | "material",
    input: AutocompleteInput
  ) {
    const parts = this.packagings ?? []
    const currentPart = parts[index]
    if (!currentPart) return

    const currentTag = currentPart[field]
    const currentText = currentTag?.lc_name || currentTag?.id || ""
    const newText = input.value.trim()

    // Show the same trimmed value that will be stored.
    input.value = newText

    if (newText === currentText) return

    const next = structuredClone(parts) as PackagingComponent[]

    if (newText === "") {
      delete next[index][field]
    } else {
      const updatedTag: NonNullable<PackagingComponent["shape"]> = {
        ...next[index][field],
        lc_name: newText,
      }
      delete updatedTag.id
      next[index][field] = updatedTag
    }

    this.emit(next, [...this.partKeys])
  }

  override render() {
    const parts = this.packagings ?? []
    return html`
      ${parts.length === 0 ? html`<p>${msg("No packaging parts.")}</p>` : null}
      ${repeat(
        parts,
        (_part, index) => this.partKeys[index],
        (part, index) => html`
          <fieldset data-part-key=${this.partKeys[index]}>
            <legend>${msg(str`Packaging part ${index + 1}`)}</legend>
            <label>
              ${msg("Number of units")}
              <input
                class="input-number"
                data-part-index=${index}
                type="number"
                min="1"
                step="any"
                .value=${part.number_of_units === undefined ? "" : String(part.number_of_units)}
                @change=${(event: Event) =>
                  this.changeUnits(index, event.currentTarget as HTMLInputElement)}
              />
            </label>
            <div class="taxonomy-field">
              <span>${msg("Shape")}</span>
              <autocomplete-input
                data-taxonomy-field="shape"
                .inputLabel=${msg("Shape")}
                .value=${part.shape?.lc_name || part.shape?.id || ""}
                .openOnSuggestionsUpdate=${true}
                .preventTabNavigation=${false}
                @suggestion-select=${(event: AutocompleteSuggestionSelectEvent) =>
                  this.changeTaxonomyField(
                    index,
                    "shape",
                    event.currentTarget as AutocompleteInput
                  )}
                @focusout=${(event: FocusEvent) =>
                  this.changeTaxonomyField(
                    index,
                    "shape",
                    event.currentTarget as AutocompleteInput
                  )}
                @keydown=${(event: KeyboardEvent) => {
                  if (event.key === "Enter" && !event.isComposing) {
                    this.changeTaxonomyField(
                      index,
                      "shape",
                      event.currentTarget as AutocompleteInput
                    )
                  }
                }}
              ></autocomplete-input>
            </div>

            <div class="taxonomy-field">
              <span>${msg("Material")}</span>
              <autocomplete-input
                data-taxonomy-field="material"
                .inputLabel=${msg("Material")}
                .value=${part.material?.lc_name || part.material?.id || ""}
                .openOnSuggestionsUpdate=${true}
                .preventTabNavigation=${false}
                @suggestion-select=${(event: AutocompleteSuggestionSelectEvent) =>
                  this.changeTaxonomyField(
                    index,
                    "material",
                    event.currentTarget as AutocompleteInput
                  )}
                @focusout=${(event: FocusEvent) =>
                  this.changeTaxonomyField(
                    index,
                    "material",
                    event.currentTarget as AutocompleteInput
                  )}
                @keydown=${(event: KeyboardEvent) => {
                  if (event.key === "Enter" && !event.isComposing) {
                    this.changeTaxonomyField(
                      index,
                      "material",
                      event.currentTarget as AutocompleteInput
                    )
                  }
                }}
              ></autocomplete-input>
            </div>
            <button
              type="button"
              aria-label=${msg(str`Remove packaging part ${index + 1}`)}
              @click=${() => this.removePart(index)}
            >
              ${msg("Remove")}
            </button>
          </fieldset>
        `
      )}
      <button type="button" data-add-focus @click=${this.addPart}>
        ${msg("Add packaging part")}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "packaging-input": PackagingInput
  }
  interface HTMLElementEventMap {
    "packaging-change": PackagingChangeEvent
  }
}
