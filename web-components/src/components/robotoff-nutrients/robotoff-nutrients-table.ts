import { LitElement, css, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import {
  NutrientsInsight,
  NutrientInsightDatum,
  InsightAnnotatationData,
  InsightAnnotationSize,
  InsightAnnotationAnswer,
} from "../../types/robotoff"
import { localized, msg, str } from "@lit/localize"
import {
  getTaxonomyNameByIdAndLang,
  getTaxonomyUnitById,
  getTaxonomyNameByLang,
  nutrientTaxonomies,
} from "../../signals/taxonomies"
import { getLocale } from "../../localization"
import {
  getPossibleUnits,
  INSIGHTS_ANNOTATION_SIZE,
  NUTRIENT_SERVING_SIZE_KEY,
  NUTRIENT_SUFFIX,
  NUTRIENT_UNIT_NAME_PREFIX,
  NUTRIENT_UNIT_SUFFIX,
} from "../../utils/nutrients"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType, SELECT_ICON_FILE_NAME } from "../../constants"
import { INPUT, SELECT } from "../../styles/form"
import { FLEX } from "../../styles/utils"
import { backgroundImage } from "../../directives/background-image"
import { ALERT } from "../../styles/alert"
import { NutrimentsProductType } from "../../types/openfoodfacts"

export const ALLOWED_SPECIAL_VALUES = ["", "-", "traces"]

export type FormatedNutrimentData = {
  value: string
  unit: string
}

// A handy data structure for nutrients information
export type FormatedNutrients = {
  // nutrients per 100g
  "100g": Record<string, NutrientInsightDatum>
  // nutrients per serving
  serving: Record<string, FormatedNutrimentData>
  // all nutrients present per 100g or serving
  keys: string[]

  servingSize?: string

  robotoff: {
    servingSize?: NutrientInsightDatum

    // nutrients per 100g
    "100g": Record<string, NutrientInsightDatum>
    // nutrients per serving
    serving: Record<string, NutrientInsightDatum>
  }
}
/**
 * Variable store all size of the input to calculate the width of serving size input
 */
const INPUT_VALUE_MAX_SIZE = 4
const INPUT_UNIT_MAX_SIZE = 5
const INPUTS_GAP = 0.5

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
    ALERT,
    css`
      :host {
        font-weight: normal;
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
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: ${INPUTS_GAP}rem;
      }

      .unit-wrapper select {
        height: 2.5rem;
        border-radius: 2.5rem;
        padding-left: 1rem;
        padding-right: 1rem;
        width: ${INPUT_UNIT_MAX_SIZE}rem;
      }
      .serving-size-wrapper {
        gap: 0.3rem;
      }
      .serving-size-wrapper {
        font-weight: bold;
      }
      .serving-size-wrapper input {
        width: 12rem;
        text-align: center;
        box-sizing: border-box;
        margin-bottom: 0.5rem;
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
        width: 100%;
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
      legend,
      .add-nutrient-row select {
        width: 10rem;
      }

      .input-label {
        font-weight: bold;
      }
      .info {
        display: block;
        padding: 0;
        width: 100%;
      }

      form {
        width: 20rem;
      }

      .nutrient-rows {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    `,
  ]

  /**
   * Nutriments data
   */
  @property({ type: Object, attribute: "nutriments-data" })
  nutrimentsData?: NutrimentsProductType

  /**
   * The insight to edit
   */
  @property({ type: Object })
  insight?: NutrientsInsight

  /**
   * Insight type
   */
  @state()
  insightAnnotationSize: InsightAnnotationSize = InsightAnnotationSize.CENTGRAMS

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
   * Formated Nutrients
   */
  @state()
  private nutrients?: FormatedNutrients

  /**
   * Update properties when the insight is updated
   *
   */
  onUpdateInsight = () => {
    // Update the serving size value to dislay
    this._servingSizeValue = this.insight!.data.nutrients.serving_size?.value || ""
    // Update the insight type by checking the nutrient keys
    this.insightAnnotationSize = Object.keys(this.insight!.data.nutrients).filter((key) =>
      key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationSize.SERVING])
    ).length
      ? InsightAnnotationSize.SERVING
      : InsightAnnotationSize.CENTGRAMS
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
   * Process robotoff data from insight
   * @param nutrients - The nutrients object to update
   * @param insight - The insight data
   * @returns Set of nutrient keys found
   */
  private processRobotoffData(
    nutrients: FormatedNutrients,
    insight: NutrientsInsight
  ): Set<string> {
    const keysSet = new Set<string>()

    Object.entries(insight.data.nutrients)
      // Sort by start position to keep the same order as the image
      .sort((entryA, entryB) => entryA[1].start - entryB[1].start)
      .forEach(([key, value]) => {
        let nutrientKey
        if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationSize.CENTGRAMS])) {
          nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationSize.CENTGRAMS], "")
          nutrients.robotoff[InsightAnnotationSize.CENTGRAMS][nutrientKey] = value
        } else if (key.endsWith(NUTRIENT_SUFFIX[InsightAnnotationSize.SERVING])) {
          nutrientKey = key.replace(NUTRIENT_SUFFIX[InsightAnnotationSize.SERVING], "")
          nutrients.robotoff[InsightAnnotationSize.SERVING][nutrientKey] = value
        } else if (key === NUTRIENT_SERVING_SIZE_KEY) {
          nutrients.robotoff.servingSize = value
          nutrients.servingSize = value?.value
          return
        } else {
          console.log("Unknown nutrient key", key, value)
          return
        }
        keysSet.add(nutrientKey)
      })

    return keysSet
  }

  /**
   * Process serving size data from nutrimentsData
   * @param nutrients - The nutrients object to update
   * @param nutrimentsData - The nutriments data
   */
  private processServingSize(
    nutrients: FormatedNutrients,
    nutrimentsData: NutrimentsProductType
  ): void {
    // Add serving size data
    if (nutrimentsData.serving_size) {
      nutrients.servingSize = nutrimentsData.serving_size
    }
  }

  /**
   * Process nutrient data from nutrimentsData
   * @param nutrients - The nutrients object to update
   * @param nutrimentsData - The nutriments data
   * @returns Set of nutrient keys found
   */
  private processNutrimentData(
    nutrients: FormatedNutrients,
    nutrimentsData: NutrimentsProductType
  ): Set<string> {
    const keySet = new Set<string>()
    // Process nutrients
    INSIGHTS_ANNOTATION_SIZE.forEach((size) => {
      const suffix = NUTRIENT_SUFFIX[size]
      const keys = Object.entries(nutrimentsData.nutriments).filter(([key]) => key.endsWith(suffix))
      keys.forEach(([key, value]) => {
        const nutrientKey = key.replace(suffix, "")
        const nutrientUnitKey = `${nutrientKey}${NUTRIENT_UNIT_SUFFIX}`
        nutrients[size][nutrientKey] = {
          value: value.toString(),
          unit: nutrimentsData.nutriments[nutrientUnitKey] as string,
        }
        keySet.add(nutrientKey)
      })
    })
    return keySet
  }

  /**
   * Process manually added nutrient keys
   * @param keysSet - The existing set of keys
   * @param addedKeys - Array of manually added keys
   * @returns Updated set of nutrient keys
   */
  private processAddedNutrientKeys(keysSet: Set<string>, addedKeys: string[]): Set<string> {
    if (addedKeys && addedKeys.length > 0) {
      for (const key of addedKeys) {
        if (!keysSet.has(key)) {
          keysSet.add(key)
        }
      }
    }
    return keysSet
  }

  /**
   * Initialize empty nutrients structure
   * @returns Empty nutrients structure
   */
  private initializeNutrientsStructure(): FormatedNutrients {
    return {
      servingSize: undefined,
      keys: [],
      "100g": {},
      serving: {},
      robotoff: {
        servingSize: undefined,
        "100g": {},
        serving: {},
      },
    }
  }

  /**
   * Update the nutrients in a formated way to manipulate it easily in the template
   * @returns {FormatedNutrients}
   */
  updateFormatedNutrients(): FormatedNutrients {
    // Initialize nutrients structure
    const nutrients = this.initializeNutrientsStructure()
    let keysSet = new Set<string>()

    // Process robotoff data if available
    if (this.insight) {
      keysSet = this.processRobotoffData(nutrients, this.insight)
    }

    // Process nutriment data if available
    if (this.nutrimentsData) {
      // Process serving size
      this.processServingSize(nutrients, this.nutrimentsData)

      // Process nutrients data and merge keys
      const nutrimentKeysSet = this.processNutrimentData(nutrients, this.nutrimentsData)
      nutrimentKeysSet.forEach((key) => keysSet.add(key))
    }

    // Process manually added nutrient keys
    keysSet = this.processAddedNutrientKeys(keysSet, this._addedNutrientKey)

    // Convert keys set to array
    nutrients.keys = Array.from(keysSet)

    this.nutrients = nutrients
    return this.nutrients
  }

  getInputValueName = (key: string, column: InsightAnnotationSize) => `${key}_${column}`
  getInputUnitName = (key: string, column: InsightAnnotationSize) =>
    `${NUTRIENT_UNIT_NAME_PREFIX}${this.getInputValueName(key, column)}`

  getServingSizeInputName = () =>
    this.getInputValueName(NUTRIENT_SERVING_SIZE_KEY, InsightAnnotationSize.SERVING)
  getServingSizeValue = () => {}

  renderRobotoffSuggestion(key: string, column: InsightAnnotationSize) {
    const robotoffSuggestion = this.nutrients?.robotoff[column][key]?.value
    if (!robotoffSuggestion) {
      return nothing
    }
    return html`<div class="alert success">
      ${robotoffSuggestion} ${this.nutrients?.robotoff[column][key]?.unit}
    </div>`
  }

  /**
   * Render the inputs for the given nutrient key and column
   * @param nutrients - The nutrients to render
   * @returns
   */
  renderRows() {
    const nutrients = this.nutrients!
    return nutrients.keys.map((key) => {
      return html`
        <div>
          <div>
            ${this.renderInputs(
              key,
              this.insightAnnotationSize,
              nutrients[this.insightAnnotationSize][key]
            )}
          </div>

          <div>${this.renderRobotoffSuggestion(key, this.insightAnnotationSize)}</div>
        </div>
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
    column: InsightAnnotationSize,
    nutrient: Pick<NutrientInsightDatum, "unit"> | undefined
  ) {
    const possibleUnits = getPossibleUnits(key, nutrient?.unit)
    const inputName = this.getInputUnitName(key, column)
    const currentUnit = nutrient?.unit ?? getTaxonomyUnitById(key)
    const selectsClasses = "select chocolate unit-select"
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
    column: InsightAnnotationSize,
    nutrient: { value: number | string; unit: string } | undefined
  ) {
    const inputName = this.getInputValueName(key, column)
    const value = nutrient?.value ?? ""
    const label = getTaxonomyNameByIdAndLang(key, getLocale())

    return html`
      <div class="inputs-wrapper">
        <div>
          <label class="input-label">
            <div>${label}</div>
            <input
              type="text"
              name="${inputName}"
              value="${value}"
              title="${msg("value")}"
              class="input input-nutritional-value cappucino"
            />
          </label>
        </div>

        <div title=${msg("unit")} class="unit-wrapper">
          ${this.renderUnit(key, column, nutrient)}
        </div>
      </div>
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

    // Check if the value is a special value
    if (ALLOWED_SPECIAL_VALUES.includes(valueCleaned)) {
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
  submitFormData(formData: FormData, column: InsightAnnotationSize) {
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
  onInsightAnnotationSizeChange(event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value as InsightAnnotationSize
    this.insightAnnotationSize = value
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

  renderServingSizeInput() {
    const inputServingSizeName = this.getServingSizeInputName()
    const servingSize = this.nutrients!.servingSize
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
  renderInsightAnnotationSizeSelection() {
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
                value=${InsightAnnotationSize.CENTGRAMS}
                ?checked=${this.insightAnnotationSize === InsightAnnotationSize.CENTGRAMS}
                @change=${this.onInsightAnnotationSizeChange}
              />
            </label>
            <label>
              <span>${msg(str`per specified serving "${this._servingSizeValue}"`)}</span>
              <input
                type="radio"
                name="${SERVING_SIZE_SELECT_NAME}"
                value=${InsightAnnotationSize.SERVING}
                ?checked=${this.insightAnnotationSize === InsightAnnotationSize.SERVING}
                @change=${this.onInsightAnnotationSizeChange}
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
    this.submitFormData(formData, this.insightAnnotationSize)
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
          <select
            class="select"
            @change=${this.onAddNutrient}
            style=${backgroundImage(SELECT_ICON_FILE_NAME)}
          >
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
  renderTable() {
    const nutrients = this.nutrients!
    return html`
      <div>
        <div class="nutrient-rows">${this.renderRows()}</div>
        <div>${this.renderAddNutrientRow(nutrients.keys)}</div>
        <div>${this.renderSubmitRow()}</div>
      </div>
    `
  }

  override render() {
    this.updateFormatedNutrients()

    return html`
      <div>
        <div>${this.renderServingSizeInput()}</div>
        <div>${this.renderInsightAnnotationSizeSelection()}</div>

        <form @submit=${this.onSubmit}>
          <div class="flex justify-center">${this.renderTable()}</div>
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
