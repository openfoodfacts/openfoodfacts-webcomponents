import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg, str } from "@lit/localize"
import type { PackagingComponent } from "@openfoodfacts/openfoodfacts-nodejs"
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
    this.packagings = next
    this.dispatchEvent(
      new CustomEvent<PackagingChangeEventDetail>("packaging-change", {
        detail: { packagings: structuredClone(next) },
        bubbles: true,
        composed: true,
      })
    )
  }

  override render() {
    const parts = this.packagings ?? []
    return html`
      ${parts.length === 0 ? html`<p>${msg("No packaging parts.")}</p>` : null}
      ${parts.map(
        (part, index) => html`
          <fieldset>
            <legend>${msg(str`Packaging part ${index + 1}`)}</legend>
            <label>
              ${msg("Number of units")}
              <input
                class="input-number"
                type="number"
                min="1"
                step="any"
                .value=${part.number_of_units === undefined ? "" : String(part.number_of_units)}
                @change=${(event: Event) =>
                  this.changeUnits(index, event.currentTarget as HTMLInputElement)}
              />
            </label>
            <dl>
              <dt>${msg("Shape")}</dt>
              <dd>${part.shape?.lc_name || part.shape?.id || msg("Not specified")}</dd>
              <dt>${msg("Material")}</dt>
              <dd>${part.material?.lc_name || part.material?.id || msg("Not specified")}</dd>
            </dl>
          </fieldset>
        `
      )}
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
