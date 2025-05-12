import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import "./delete-modal"
import "../shared/autocomplete-input"
import folksonomyApi from "../../api/folksonomy"
import { msg } from "@lit/localize"
import { getButtonClasses, ButtonType } from "../../styles/buttons"
import { FOLKSONOMY_INPUT } from "../../styles/folksonomy-input"

/**
 * FolksonomyEditorRow Component
 * @element folksonomy-editor-row
 * @description A component for adding and editing product properties in a table row format.
 * @fires update-row - Fired when a row is updated.
 * @fires delete-row - Fired when a row is deleted.
 * @fires add-row - Fired when a new row is added.
 */
@customElement("folksonomy-editor-row")
export class FolksonomyEditorRow extends LitElement {
  /**
   * Input value for the key field.
   * @private
   */
  @state() private keyInput = ""

  /**
   * Input value for the value field.
   * @private
   */
  @state() private valueInput = ""

  /**
   * Suggestions for the key field.
   * @private
   */
  @state() private keySuggestions: string[] = []

  /**
   * Suggestions for the value field.
   * @private
   */
  @state() private valueSuggestions: string[] = []

  /**
   * Temporary value used during editing.
   * @private
   */
  @state() private tempValue = ""

  /**
   * Product code associated with the row.
   */
  @property({ type: String, attribute: "product-code" }) productCode = ""

  /**
   * Version number of the product property.
   */
  @property({ type: Number }) version = 1

  /**
   * Row number in the table.
   */
  @property({ type: Number, attribute: "row-number" }) rowNumber = 1

  /**
   * Key of the product property.
   */
  @property({ type: String }) key = ""

  /**
   * Value of the product property.
   */
  @property({ type: String }) value = ""

  /**
   * Page type (e.g., view or edit).
   */
  @property({ type: String, attribute: "page-type" }) pageType = "view"

  /**
   * Indicates whether the row is empty.
   */
  @property({ type: Boolean }) empty = false

  /**
   * Indicates whether the row is editable.
   * @private
   */
  @state() editable = false

  private originalKeySuggestions: string[] = []
  private originalValueSuggestions: string[] = []

  override connectedCallback() {
    super.connectedCallback()
    if (this.pageType === "edit") {
      this.editable = true
      this.tempValue = this.value
    }

    folksonomyApi
      .fetchKeys()
      .then((keys) => {
        this.originalKeySuggestions = keys.map((key) => key.k)
        this.keySuggestions = [...this.originalKeySuggestions]
      })
      .catch((error) => console.error("Error fetching keys:", error))
  }

  /**
   * Fetches values for a given key and updates suggestions.
   * @param key - The key to fetch values for.
   * @private
   */
  private async fetchValuesForKey(key: string) {
    try {
      const values = await folksonomyApi.fetchValues(key)
      this.originalValueSuggestions = values.map((value) => value.v)
      this.valueSuggestions = [...this.originalValueSuggestions]
    } catch (error) {
      console.error("Error fetching values for key:", error)
    }
  }

  /**
   * Handles input changes for the key field.
   * @param e - The input event.
   * @private
   */
  private onKeyInput(e: Event) {
    const value = (e.target as HTMLInputElement).value
    this.keyInput = value
    this.key = value

    if (value) {
      this.keySuggestions = this.originalKeySuggestions.filter((k) =>
        k.toLowerCase().includes(value.toLowerCase())
      )

      if (this.keySuggestions.length === 1 && this.keySuggestions[0] === value) {
        this.fetchValuesForKey(value)
      }
    } else {
      this.keySuggestions = [...this.originalKeySuggestions]
    }
  }

  /**
   * Handles input changes for the value field.
   * @param e - The input event.
   * @private
   */
  private onValueInput(e: Event) {
    const value = (e.target as HTMLInputElement).value
    this.valueInput = value
    this.value = value

    if (value) {
      this.valueSuggestions = this.originalValueSuggestions.filter((v) =>
        v.toLowerCase().includes(value.toLowerCase())
      )

      if (this.valueSuggestions.length === 1 && this.valueSuggestions[0] === value) {
        this.fetchValuesForKey(this.keyInput)
      }
    } else {
      // Show all values in the dropdown when input is empty
      this.valueSuggestions = [...this.originalValueSuggestions]
    }
  }

  /**
   * Selects a key suggestion and updates the key field.
   * @param suggestion - The selected key suggestion.
   * @private
   */
  private selectKeySuggestion(suggestion: string) {
    this.keyInput = suggestion
    this.key = suggestion
    this.fetchValuesForKey(suggestion)
  }

  /**
   * Selects a value suggestion and updates the value field.
   * @param suggestion - The selected value suggestion.
   * @private
   */
  private selectValueSuggestion(suggestion: string) {
    this.valueInput = suggestion
    this.value = suggestion
  }

  /**
   * Enables editing mode for the row.
   * @private
   */
  private handleEdit() {
    this.editable = true
    this.tempValue = this.value
  }

  /**
   * Saves the edited property and dispatches an update-row event.
   * @private
   */
  private async handleSave() {
    try {
      const updatedProperty = await folksonomyApi.updateProductProperty(
        this.productCode,
        this.key,
        this.tempValue,
        this.version
      )
      this.editable = false

      this.dispatchEvent(
        new CustomEvent("update-row", {
          detail: {
            key: updatedProperty.key,
            value: updatedProperty.value,
            version: updatedProperty.version,
          },
          bubbles: true,
          composed: true,
        })
      )
    } catch (error) {
      console.error("Failed to update property", error)
    }
  }

  /**
   * Cancels editing mode and restores the original value.
   * @private
   */
  private handleCancel() {
    this.editable = false
    this.tempValue = this.value
  }

  /**
   * Deletes the property and dispatches a delete-row event.
   * @private
   */
  private async handleDelete() {
    const deleteModal = document.createElement("delete-modal")
    deleteModal.addEventListener("confirm-delete", async () => {
      try {
        await folksonomyApi.deleteProductProperty(this.productCode, this.key, this.version)
        this.dispatchEvent(
          new CustomEvent("delete-row", {
            detail: { key: this.key },
            bubbles: true,
            composed: true,
          })
        )
      } catch (error) {
        console.error("Failed to delete property", error)
      } finally {
        deleteModal.remove()
      }
    })
    document.body.appendChild(deleteModal)
  }

  /**
   * Adds a custom key and value to the product properties.
   * @private
   */
  private async addCustomKeyAndValue() {
    if (this.keyInput && this.valueInput) {
      try {
        const newProperty = await folksonomyApi.addProductProperty(
          this.productCode,
          this.keyInput,
          this.valueInput,
          this.version
        )
        this.dispatchEvent(
          new CustomEvent("add-row", {
            detail: { key: newProperty.key, value: newProperty.value },
            bubbles: true,
            composed: true,
          })
        )
        this.keyInput = ""
        this.valueInput = ""
      } catch (error) {
        console.error("Failed to add custom key and value", error)
      }
    }
  }

  /**
   * Handles input changes during editing.
   * @param e - The input event.
   * @private
   */
  private handleInputChange(e: Event) {
    this.tempValue = (e.target as HTMLInputElement).value
  }

  static override styles = [
    FOLKSONOMY_INPUT,
    ...getButtonClasses([ButtonType.Chocolate]),
    css`
      :host {
        font-family: Arial, sans-serif;
        font-size: 0.9rem;
        color: #333;
        width: 100%;
        display: contents;
      }

      .odd-row {
        background-color: #ffffff;
      }

      .even-row {
        background-color: #f2f2f2;
      }

      .button-container {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        width: 10rem;
      }

      .button-container button {
        width: 10rem;
      }

      td {
        padding: 0.5rem 1.2rem;
        text-align: left;
        border: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .property-link {
        color: black;
      }

      #create-button {
        width: 10rem;
        padding: 0.4rem 0.8rem;
      }

      @media (max-width: 768px) {
        .button-container {
          flex-direction: column;
        }

        .button-container {
          width: 7rem;
        }

        .button-container button {
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
          height: 2rem;
          width: 7rem;
        }

        #create-button {
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
          height: 2rem;
          width: 7rem;
        }
      }

      @media (max-width: 480px) {
        .button-container {
          width: 5rem;
        }

        .button-container button {
          width: 5rem;
          font-size: 0.7rem;
          padding: 0.3rem 0.5rem;
          height: 1.6rem;
        }

        #create-button {
          width: 5rem;
          font-size: 0.7rem;
          padding: 0.3rem 0.5rem;
          height: 1.6rem;
        }

        td {
          padding: 0.4rem 0.5rem;
        }
      }
    `,
  ]

  override render() {
    if (this.empty) {
      return html`
        <tr class="${this.rowNumber % 2 === 0 ? "even-row" : "odd-row"}">
          <td>
            <autocomplete-input
              placeholder=${msg("New key")}
              .value=${this.keyInput}
              .suggestions=${this.keySuggestions}
              @input-change=${(e: CustomEvent) => this.onKeyInput(e)}
              @suggestion-select=${(e: CustomEvent) => this.selectKeySuggestion(e.detail.value)}
            ></autocomplete-input>
          </td>
          <td>
            <autocomplete-input
              placeholder=${msg("New value")}
              .value=${this.valueInput}
              .suggestions=${this.valueSuggestions}
              @input-change=${(e: CustomEvent) => this.onValueInput(e)}
              @suggestion-select=${(e: CustomEvent) => this.selectValueSuggestion(e.detail.value)}
            ></autocomplete-input>
          </td>
          <td>
            <div class="button-container">
              <button
                class="button chocolate-button"
                @click=${this.addCustomKeyAndValue}
                id="create-button"
              >
                ${msg("Submit")}
              </button>
            </div>
          </td>
        </tr>
      `
    }

    return html`
      <tr class="${this.rowNumber % 2 === 0 ? "even-row" : "odd-row"}">
        <td>
          <a
            class="property-link"
            href="https://wiki.openfoodfacts.org/Folksonomy/Property/${this.key}"
            >${this.key}</a
          >
        </td>
        <td>
          ${this.editable
            ? html`<input
                type="text"
                class="input"
                .value=${this.tempValue}
                @input=${this.handleInputChange}
              />`
            : this.value}
        </td>
        <td>
          <div class="button-container">
            ${this.editable
              ? html`
                  <button class="button chocolate-button" @click=${this.handleSave}>
                    ${msg("Save")}
                  </button>
                  <button class="button chocolate-button" @click=${this.handleCancel}>
                    ${msg("Cancel")}
                  </button>
                `
              : html`<button class="button chocolate-button" @click=${this.handleEdit}>
                  ${msg("Edit")}
                </button>`}
            <button class="button chocolate-button" @click=${this.handleDelete}>
              ${msg("Delete")}
            </button>
          </div>
        </td>
      </tr>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "folksonomy-editor-row": FolksonomyEditorRow
  }
}
