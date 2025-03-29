import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import { createFlag } from "../../api/nutripatrol"
import { FlagCreate, IssueType, SourceType, Flavor } from "../../types/nutripatrol"

/**
 * Report Product Component
 * @element report-product
 * A reusable component for reporting products or images across
 * Open Food Facts and related platforms.
 */
@customElement("report-product")
@localized()
export class ReportProduct extends LitElement {
  /**
   * Barcode of the product
   * @type {string|null}
   */
  @property({ type: String })
  barcode: string | null = null

  /**
   * Type of issue
   * @type {IssueType}
   */
  @property({ type: String })
  type: IssueType = IssueType.PRODUCT

  /**
   * URL of the product or flagged image
   * @type {string}
   */
  @property({ type: String })
  url: string = ""

  /**
   * Open Food Facts User ID of the reporter
   * @type {string}
   */
  @property({ type: String })
  userId: string = ""

  /**
   * Source of the flag
   * @type {SourceType}
   */
  @property({ type: String })
  source: SourceType = "" as SourceType

  /**
   * ID of the flagged image
   * @type {string}
   */
  @property({ type: String })
  imageId: string | null = null

  /**
   * Project associated with the ticket
   * @type {Flavor}
   */
  @property({ type: String })
  flavor: Flavor = "" as Flavor

  /**
   * Confidence score for robotoff-generated flags
   * @type {number}
   */
  @property({ type: Number })
  confidence: number | null = null

  /**
   * Display mode: 'button' or 'dropdown'
   * @type {string}
   */
  @property({ type: String })
  display: "button" | "dropdown" = "button"

  /**
   * Button text
   * @type {string}
   */
  @property({ type: String })
  buttonText: string = ""

  /**
   * Button style variant
   * @type {string}
   */
  @property({ type: String })
  variant: "primary" | "secondary" | "outline" = "secondary"

  /**
   * Whether to show the dialog or not
   */
  @state()
  showDialog: boolean = false

  /**
   * Selected reason for reporting
   */
  @state()
  selectedReason: string | null = null

  /**
   * User comment for reporting
   */
  @state()
  comment: string = ""

  /**
   * Whether the report is being submitted
   */
  @state()
  isSubmitting: boolean = false

  /**
   * Whether the report has been submitted successfully
   */
  @state()
  isSubmitted: boolean = false

  /**
   * Error message if submission fails
   */
  @state()
  errorMessage: string | null = null

  /**
   * Get the available reasons based on the type
   */
  get reasonOptions() {
    if (this.type === IssueType.IMAGE) {
      return [
        { value: "inappropriate", label: msg("Inappropriate content") },
        { value: "human", label: msg("Contains identifiable person") },
        { value: "beauty", label: msg("Beauty product (not food)") },
        { value: "image_to_delete_spam", label: msg("Spam") },
        { value: "image_to_delete_face", label: msg("Shows face") },
        { value: "other", label: msg("Other issue") },
      ]
    } else if (this.type === IssueType.PRODUCT) {
      return [
        { value: "product_to_delete", label: msg("Product should be deleted") },
        { value: "other", label: msg("Other issue") },
      ]
    }
    return [{ value: "other", label: msg("Other issue") }]
  }

  /**
   * Open the report dialog
   */
  openDialog() {
    this.showDialog = true
  }

  /**
   * Close the report dialog
   */
  closeDialog() {
    this.showDialog = false
    this.resetForm()
  }

  /**
   * Reset the form fields
   */
  resetForm() {
    this.selectedReason = null
    this.comment = ""
    this.errorMessage = null
  }

  /**
   * Handle reason selection
   */
  handleReasonChange(e: Event) {
    const select = e.target as HTMLSelectElement
    this.selectedReason = select.value
  }

  /**
   * Handle comment input
   */
  handleCommentChange(e: Event) {
    const textarea = e.target as HTMLTextAreaElement
    this.comment = textarea.value
  }

  /**
   * Submit the report
   */
  async submitReport() {
    if (!this.url) {
      this.errorMessage = msg("URL is required")
      return
    }

    if (this.type === "image" && !this.imageId) {
      this.errorMessage = msg("Image ID is required for image reports")
      return
    }

    if (!this.userId) {
      this.errorMessage = msg("User ID is required")
      return
    }

    try {
      this.isSubmitting = true
      this.errorMessage = null

      const flag: FlagCreate = {
        barcode: this.barcode,
        type: this.type,
        url: this.url,
        user_id: this.userId,
        source: this.source,
        flavor: this.flavor || undefined,
        reason: this.selectedReason || undefined,
        comment: this.comment || undefined,
      }

      if (this.type === "image" && this.imageId) {
        flag.image_id = this.imageId
      }

      if (this.source === "robotoff" && this.confidence !== null) {
        flag.confidence = this.confidence
      }

      await createFlag(flag)
      this.isSubmitted = true
      setTimeout(() => {
        this.closeDialog()
        this.isSubmitted = false
      }, 2000)
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : msg("An error occurred")
    } finally {
      this.isSubmitting = false
    }
  }

  static override styles = css`
    :host {
      display: inline-block;
    }

    .report-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: 4px;
      font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition:
        background-color 0.2s,
        border-color 0.2s;
      border: 1px solid;
    }

    .report-button.primary {
      background-color: #ff6e78;
      color: white;
      border-color: #ff6e78;
    }

    .report-button.primary:hover {
      background-color: rgba(255, 110, 120, 0.8);
    }

    .report-button.secondary {
      background-color: #008c8c;
      color: white;
      border-color: #008c8c;
    }

    .report-button.secondary:hover {
      background-color: rgba(0, 140, 140, 0.8);
    }

    .report-button.outline {
      background-color: transparent;
      color: #008c8c;
      border-color: #008c8c;
    }

    .report-button.outline:hover {
      background-color: rgba(0, 140, 140, 0.1);
    }

    .report-button svg {
      margin-right: 6px;
    }

    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background-color: white;
      border-radius: 8px;
      padding: 24px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .dialog-title {
      font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #008c8c;
    }

    .close-button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #666;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
    }

    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
    }

    select:focus,
    textarea:focus {
      outline: none;
      border-color: #008c8c;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .dialog-button {
      padding: 8px 16px;
      border-radius: 4px;
      font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      border: none;
    }

    .cancel-button {
      background-color: #f2f2f2;
      color: #333;
    }

    .cancel-button:hover {
      background-color: #e5e5e5;
    }

    .submit-button {
      background-color: #008c8c;
      color: white;
    }

    .submit-button:hover {
      background-color: rgba(0, 140, 140, 0.8);
    }

    .submit-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .error-message {
      color: #d32f2f;
      font-size: 14px;
      margin-top: 8px;
    }

    .success-message {
      color: #2e7d32;
      font-size: 14px;
      text-align: center;
      padding: 16px;
    }

    .flag-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
  `

  /**
   * Render method
   */
  override render() {
    return html`
      <!-- Report Button -->
      <button
        @click=${this.openDialog}
        class="report-button ${this.variant}"
        aria-label=${msg("Report this product")}
      >
        <svg class="flag-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"></path>
        </svg>
        ${this.buttonText || msg("Report")}
      </button>

      <!-- Dialog -->
      ${this.showDialog
        ? html`
            <div class="dialog-backdrop">
              <div class="dialog">
                ${this.isSubmitted
                  ? html`
                      <div class="success-message">
                        <svg
                          viewBox="0 0 24 24"
                          width="48"
                          height="48"
                          fill="#2e7d32"
                          style="margin-bottom: 16px;"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                          ></path>
                        </svg>
                        <p>
                          ${msg("Thank you for your report. It has been submitted successfully.")}
                        </p>
                      </div>
                    `
                  : html`
                      <div class="dialog-header">
                        <h3 class="dialog-title">
                          ${this.type === IssueType.PRODUCT
                            ? msg("Report Product")
                            : this.type === IssueType.IMAGE
                              ? msg("Report Image")
                              : msg("Report Search Issue")}
                        </h3>
                        <button
                          @click=${this.closeDialog}
                          class="close-button"
                          aria-label=${msg("Close")}
                        >
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path
                              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                            ></path>
                          </svg>
                        </button>
                      </div>

                      <div class="form-group">
                        <label class="form-label">${msg("Reason for reporting")}</label>
                        <select @change=${this.handleReasonChange}>
                          <option value="" selected disabled>${msg("Select a reason")}</option>
                          ${this.reasonOptions.map(
                            (option) => html`
                              <option value=${option.value}>${option.label}</option>
                            `
                          )}
                        </select>
                      </div>

                      <div class="form-group">
                        <label class="form-label">${msg("Additional comments")}</label>
                        <textarea
                          @input=${this.handleCommentChange}
                          placeholder=${msg("Please describe the issue in detail")}
                        ></textarea>
                      </div>

                      ${this.errorMessage
                        ? html` <div class="error-message">${this.errorMessage}</div> `
                        : ""}

                      <div class="dialog-footer">
                        <button @click=${this.closeDialog} class="dialog-button cancel-button">
                          ${msg("Cancel")}
                        </button>
                        <button
                          @click=${this.submitReport}
                          class="dialog-button submit-button"
                          ?disabled=${this.isSubmitting}
                        >
                          ${this.isSubmitting ? msg("Submitting...") : msg("Submit Report")}
                        </button>
                      </div>
                    `}
              </div>
            </div>
          `
        : ""}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "report-product": ReportProduct
  }
}
