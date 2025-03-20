import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  Insight,
  InsightDatum,
  InsightAnnotatationData,
  InsightAnnotationType,
  InsightAnnotationAnswer,
} from "../../types/robotoff"
import { localized, msg } from "@lit/localize"
import {
  getTaxonomyNameByIdAndLang,
  getTaxonomyUnitById,
  getTaxonomyNameByLang,
  nutrientTaxonomies,
} from "../../signals/taxonomies"
import { getLocale } from "../../localization"
import {
  getPossibleUnits,
  NUTRIENT_SERVING_SIZE_KEY,
  NUTRIENT_SUFFIX,
  NUTRIENT_UNIT_NAME_PREFIX,
} from "../../utils/nutrients"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType } from "../../constants"
import { INPUT, SELECT } from "../../styles/form"
import { FLEX } from "../../styles/utils"

// A handy data structure for nutrients information
export type FormatedNutrients = {
  // nutrients per 100g
  "100g": Record<string, InsightDatum>
  // nutrients per serving
  serving: Record<string, InsightDatum>
  // all nutrients present per 100g or serving
  keys: string[]
  servingSize?: InsightDatum
}
/**
 * Variable store all size of the input to calculate the width of serving size input
 */
const INPUT_VALUE_MAX_SIZE = 4
const INPUT_UNIT_MAX_SIZE = 4
const INPUTS_GAP = 0.5
const SERVING_MAX_SIZE = INPUT_VALUE_MAX_SIZE + INPUT_UNIT_MAX_SIZE + INPUTS_GAP

const SERVING_SIZE_SELECT_NAME = "serving_size_select"

/**
 * Display a table of nutrients for a given product
 * @element robotoff-nutrients-table
 * @fires submit - when the user submit the form
 */
@customElement("robotoff-nutrients-table")
@localized()
export class RobotoffNutrientsTable extends LitElement {
  static override styles = [
    ...getButtonClasses([ButtonType.Chocolate]),
    SELECT,
    INPUT,
    FLEX,
    css`
      :host {
        font-weight: normal;
        font-size: 0.8rem;
      }
      table th[scope="col"] {
        vertical-align: top;
        font-weight: bold;
      }

      table th:first-child {
        max-width: 6rem;
      }
      table thead th {
        padding-bottom: 0.25rem;
      }
      table td,
      table th[scope="row"] {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }
      .inputs-wrapper {
        gap: ${INPUTS_GAP}rem;
      }
      .serving-size-wrapper {
        gap: 0.3rem;
      }
      .serving-size-wrapper {
        font-weight: bold;
      }
      .serving-size-wrapper input {
        width: ${SERVING_MAX_SIZE}rem;
        text-align: center;
        box-sizing: border-box;
        margin-bottom: 0.5rem;
      }

      table .input-nutritional-value {
        width: ${INPUT_VALUE_MAX_SIZE}rem;
        box-sizing: border-box;
      }

      table .select {
        font-size: 0.7rem;
      }

      table .unit-select {
        box-sizing: border-box;
        height: 100%;
        width: ${INPUT_UNIT_MAX_SIZE}rem !important;
      }

      table .submit-row td {
        padding-top: 0.5rem;
      }

      .submit-row button {
        width: 100%;
      }
      .input-error-message {
        display: block;
        box-sizing: border-box;
        margin-top: 0.2rem;
        width: ${SERVING_MAX_SIZE}rem;
        font-size: 0.7rem;
        color: var(--error-color, red);
      }

      .fieldset-annotation-type {
        display: flex;
        justify-content: center;
        border: none;
        padding: 0;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .fieldset-annotation-type legend {
        font-weight: bold;
      }
      label,
      legend {
        font-size: 0.8rem;
      }
      .add-nutrient-row select {
        width: 10rem;
      }
    `,
  ]

  /**
   * The insight to edit
   */
  @property({ type: Object })
  insight?: Insight

  /**
   * Insight type
   */
  @state()
  insightAnnotationType: InsightAnnotationType = InsightAnnotationType.CENTGRAMS

  /**
   * Error message by key
   *
   */
  @state()
  private errors: Record<string, string> = {}

  /**
   * Nutrient keys that were added to the table
   */
  @state()
  private _addedNutrientKey: string[] = []

  /**
   * Serving size value to display
   */
  @state()
  private _servingSizeValue = ""

  /**
   * Update properties when the insight is updated
   *
   */
  onUpdateInsight = () => {
    // Update the serving size value to dislay
    this._servingSizeValue = this.insight!.data.nutrients.serving_size?.value || ""
    // Update the insight type by checking the nutrient keys
    this.insightAnnotationType = Object.keys(this.insight!.data.nutrients).filter((key) =>
      key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationType.SERVING])
    ).length
      ? InsightAnnotationType.SERVING
      : InsightAnnotationType.CENTGRAMS
  }

  /**
   * Update the insight type on connected callback
   */
  override connectedCallback() {
    super.connectedCallback()
    this.onUpdateInsight()
  }

  /**
   * Update the insight type on attribute changed callback
   */
  override attributeChangedCallback(name: string, oldval: string, newval: string) {
    super.attributeChangedCallback(name, oldval, newval)
    if (name === "insight") {
      this.onUpdateInsight()
    }
  }

  /**
   * Get the nutrients in a formated way to manipulate it easily in the template
   * @returns {FormatedNutrients}
   */
  getFormatedNutrients(): FormatedNutrients {
    const nutrients: FormatedNutrients = {
      servingSize: undefined,
      keys: [],
      "100g": {},
      serving: {},
    }
    const keysSet = new Set<string>()

    Object.entries(this.insight!.data.nutrients)
      // Sort by start position to keep the same order as the image
      .sort((entryA, entryB) => entryA[1].start - entryB[1].start)
      .forEach(([key, value]) => {
        let nutrientKey
        if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationType.CENTGRAMS])) {
          nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationType.CENTGRAMS], "")
          nutrients[InsightAnnotationType.CENTGRAMS][nutrientKey] = value
        } else if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationType.SERVING])) {
          nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationType.SERVING], "")
          nutrients[InsightAnnotationType.SERVING][nutrientKey] = value
        } else if (key === NUTRIENT_SERVING_SIZE_KEY) {
          nutrients.servingSize = value
          return
        } else {
          console.log("Unknown nutrient key", key, value)
          return
        }
        keysSet.add(nutrientKey)
      })

    nutrients.keys = [...Array.from(keysSet), ...this._addedNutrientKey]
    return nutrients
  }

  getInputValueName = (key: string, column: InsightAnnotationType) => `${key}_${column}`
  getInputUnitName = (key: string, column: InsightAnnotationType) =>
    `${NUTRIENT_UNIT_NAME_PREFIX}${this.getInputValueName(key, column)}`

  getServingSizeInputName = () =>
    this.getInputValueName(NUTRIENT_SERVING_SIZE_KEY, InsightAnnotationType.SERVING)
  getServingSizeValue = () => {}

  /**
   * Render the inputs for the given nutrient key and column
   * @param nutrients - The nutrients to render
   * @returns
   */
  renderRows(nutrients: FormatedNutrients) {
    return nutrients.keys.map((key) => {
      const label = getTaxonomyNameByIdAndLang(key, getLocale())
      return html`
        <tr>
          <th scope="row">${label}</th>
          <td>
            <div>
              ${this.renderInputs(
                key,
                this.insightAnnotationType,
                nutrients[this.insightAnnotationType][key]
              )}
            </div>
          </td>
        </tr>
      `
    })
  }

  /**
   * Render the unit input for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The rendered inputs.
   */
  renderUnit(
    key: string,
    column: InsightAnnotationType,
    nutrient: Pick<InsightDatum, "unit"> | undefined
  ) {
    const possibleUnits = getPossibleUnits(key, nutrient?.unit)
    const inputName = this.getInputUnitName(key, column)
    const currentUnit = nutrient?.unit ?? getTaxonomyUnitById(key)
    const selectsClasses = "select unit-select"
    if (possibleUnits.length > 1) {
      return html`
        <select name=${inputName} class=${selectsClasses}>
          ${possibleUnits.map(
            (unit) =>
              html`<option value="${unit}" ?selected=${unit === currentUnit}>${unit}</option>`
          )}
        </select>
      `
    } else {
      return possibleUnits[0]
        ? html`<input type="hidden" name="${inputName}" value="${possibleUnits[0]}" />
            <select name=${inputName} class=${selectsClasses} disabled>
              <option value="${possibleUnits[0]!}" selected>${possibleUnits[0]}</option>
            </select>`
        : nothing
    }
  }

  /**
   * Render the nutrient value inputs for the given key and column.
   * We use a method instead a component to have input in form data when submitting.
   * @param key The key of the nutrient.
   * @param column The column of the nutrient.
   * @param nutrient The nutrient to render.
   * @returns The inputs for the given key and column.
   */
  renderInputs(
    key: string,
    column: InsightAnnotationType,
    nutrient: Pick<InsightDatum, "value" | "unit"> | undefined
  ) {
    const inputName = this.getInputValueName(key, column)
    const value = nutrient?.value ?? ""

    return html`
      <span class="flex inputs-wrapper">
        <input
          type="text"
          name="${inputName}"
          value="${value}"
          title="${msg("value")}"
          class="input input-nutritional-value"
        />
        <span title=${msg("unit")}> ${this.renderUnit(key, column, nutrient)} </span>
      </span>
      ${this.errors[inputName]
        ? html`<span class="input-error-message" role="alert">${this.errors[inputName]}</span>`
        : nothing}
    `
  }

  /**
   * Emit a custom submit event to submit the form data well formatted.
   *
   * @param insightAnnotationAnswer
   */
  emitSubmitEvent(insightAnnotationAnswer: InsightAnnotationAnswer) {
    this.dispatchEvent(
      new CustomEvent(EventType.SUBMIT, {
        bubbles: true,
        composed: true,
        detail: insightAnnotationAnswer,
      })
    )
  }

  isUnitInput(key: string) {
    return key.startsWith(NUTRIENT_UNIT_NAME_PREFIX)
  }

  /**
   * Validate the input value.
   */
  validateInputValue(value: string | null): {
    error?: string
    value?: string
  } {
    const valueCleaned = value?.replace(" ", "").replace(",", ".") ?? ""

    if (["", "-"].includes(valueCleaned)) {
      return {
        value: valueCleaned,
      }
    }
    // Check if the value is a number and a multiple of 0.01. Replace < by nothing to allow to enter a value like <1
    const numberValue = Number(valueCleaned.replace(/^</gm, ""))
    if (isNaN(numberValue)) {
      return {
        error: msg("Error: Invalid value."),
      }
    }
    // Check number have maximum of 2 decimal
    if (valueCleaned.split(".")[1]?.length > 2) {
      return {
        error: msg("Error: Value must have only 2 decimal"),
      }
    }

    return {
      value: valueCleaned,
    }
  }

  /**
   * Validate the form data.
   * It will return the form data well formatted.
   */
  validateFormData(data: InsightAnnotatationData): {
    isValid: boolean
    validatedData: InsightAnnotatationData
  } {
    this.errors = {}
    for (const [key, item] of Object.entries(data)) {
      // Skip serving size inputs
      if (key === NUTRIENT_SERVING_SIZE_KEY) {
        continue
      }

      const { error, value } = this.validateInputValue(item.value)

      if (error) {
        this.errors[key] = error
      } else {
        item.value = value!
      }
    }

    // raise error if there is any error
    if (Object.keys(this.errors).length > 0) {
      return { isValid: false, validatedData: data }
    }
    return { isValid: true, validatedData: data }
  }

  /**
   * Submit the form data.
   * It will send the data to the server.
   */
  submitFormData(formData: FormData, column: InsightAnnotationType) {
    const nutrientAnotationForm: InsightAnnotatationData = {}
    const formValues = formData.entries()

    const servingSizeInputName = this.getServingSizeInputName()

    for (const [key, value] of formValues) {
      let name = key
      const isUnit = this.isUnitInput(name)
      if (isUnit) {
        name = name.replace(NUTRIENT_UNIT_NAME_PREFIX, "")
      }
      // Remove the suffix for serving_size
      // We add suffix to match the column condition
      if (key === servingSizeInputName) {
        name = name.replace(NUTRIENT_SUFFIX[column], "")
      }

      if (!nutrientAnotationForm[name]) {
        nutrientAnotationForm[name] = {
          value: "",
          unit: null,
        }
      }

      nutrientAnotationForm[name][isUnit ? "unit" : "value"] = value as string
    }

    const { isValid, validatedData } = this.validateFormData(nutrientAnotationForm)
    if (!isValid) {
      return
    }

    this.emitSubmitEvent({
      type: column,
      data: validatedData!,
      insightId: this.insight!.id,
    })
  }

  /**
   * Handle the change event of the annotation type selection.
   * It will update the annotation type.
   */
  onInsightAnnotationTypeChange(event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value as InsightAnnotationType
    this.insightAnnotationType = value
  }

  /**
   * Render the submit row.
   * It will render a submit button.
   */
  renderSubmitRow() {
    return html`
      <tr class="submit-row">
        <td colspan="2">
          <div class="flex justify-center">
            <button type="submit" class="button chocolate-button">Valider</button>
          </div>
        </td>
      </tr>
    `
  }

  onChangeServingSize(event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value
    this._servingSizeValue = value
  }

  renderServingSizeInput(nutrients: FormatedNutrients) {
    const inputServingSizeName = this.getServingSizeInputName()
    const servingSize = nutrients.servingSize?.value ?? ""
    return html`<div class="">
      <label class="serving-size-wrapper flex align-center flex-col">
        <span>${msg("Serving size")}</span>
        <input
          class="input"
          name=${inputServingSizeName}
          type="text"
          value=${servingSize}
          @change=${this.onChangeServingSize}
        />
      </label>
    </div> `
  }

  /**
   * Render the annotation type selection.
   * It will render a radio button for each annotation type.
   */
  renderInsightAnnotationTypeSelection() {
    return html`
      <div class="flex justify-center">
        <fieldset class="fieldset-annotation-type">
          <legend>${msg("Nutrition facts are displayed on the packaging:")}</legend>
          <div>
            <label>
              <span>${msg("per 100g")}</span>
              <input
                type="radio"
                name="${SERVING_SIZE_SELECT_NAME}"
                value=${InsightAnnotationType.CENTGRAMS}
                ?checked=${this.insightAnnotationType === InsightAnnotationType.CENTGRAMS}
                @change=${this.onInsightAnnotationTypeChange}
              />
            </label>
            <label>
              <span>${msg(`per specified serving "${this._servingSizeValue}"`)}</span>
              <input
                type="radio"
                name="${SERVING_SIZE_SELECT_NAME}"
                value=${InsightAnnotationType.SERVING}
                ?checked=${this.insightAnnotationType === InsightAnnotationType.SERVING}
                @change=${this.onInsightAnnotationTypeChange}
              />
            </label>
          </div>
        </fieldset>
      </div>
    `
  }

  onAddNutrient(event: Event) {
    event.preventDefault()
    event.stopPropagation()

    const selectElement = event.target as HTMLSelectElement
    const nutrientId = selectElement.value
    this._addedNutrientKey.push(nutrientId)
    selectElement.value = ""
    // Force the component to update to render the new rows
    this.requestUpdate()
  }

  /**
   * Handle the form submission.
   * It will emit a custom submit event to submit the form data well formatted.
   * It only sent the data for the column that was submitted.
   * @param event
   */
  onSubmit(event: SubmitEvent) {
    event.preventDefault()
    event.stopPropagation()
    const formData = new FormData(event.target as HTMLFormElement)
    this.submitFormData(formData, this.insightAnnotationType)
  }

  /**
   * Render the row to add a new nutrient.
   * @param alreadyAddedNutrients
   */
  renderAddNutrientRow(alreadyAddedNutrients: string[]) {
    const lang = getLocale()
    const filteredNutrientTaxonomies = nutrientTaxonomies
      .get()
      .filter((nutrientTaxonomy) => !alreadyAddedNutrients.includes(nutrientTaxonomy.id))
    if (filteredNutrientTaxonomies.length === 0) {
      return nothing
    }

    return html`
      <tr class="add-nutrient-row">
        <td>
          <select class="select" @change=${this.onAddNutrient}>
            <option>${msg("Add a nutrient")}</option>
            ${filteredNutrientTaxonomies.map(
              (taxonomy) => html`
                <option value=${taxonomy.id}>${getTaxonomyNameByLang(taxonomy, lang)}</option>
              `
            )}
          </select>
        </td>
      </tr>
    `
  }

  /**
   * Render the table with the nutrients data.
   */
  renderTable(nutrients: FormatedNutrients) {
    return html`
      <table>
        <thead>
          <tr>
            <th scope="col">${msg("Nutrients")}</th>
            ${this.insightAnnotationType === InsightAnnotationType.CENTGRAMS
              ? html` <th scope="col">100g</th> `
              : html`
                  <th scope="col" class="flex flex-col align-center serving-size-wrapper">
                    <span>${msg(`Specified serving "${this._servingSizeValue}"`)}</span>
                  </th>
                `}
          </tr>
        </thead>
        <tbody>
          ${this.renderRows(nutrients)} ${this.renderAddNutrientRow(nutrients.keys)}
          ${this.renderSubmitRow()}
        </tbody>
      </table>
    `
  }

  override render() {
    const nutrients = this.getFormatedNutrients()
    return html`
      <div>
        <div>${this.renderServingSizeInput(nutrients)}</div>
        <div>${this.renderInsightAnnotationTypeSelection()}</div>

        <form @submit=${this.onSubmit}>
          <div class="flex justify-center">${this.renderTable(nutrients)}</div>
        </form>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "robotoff-nutrients-table": RobotoffNutrientsTable
  }
}
