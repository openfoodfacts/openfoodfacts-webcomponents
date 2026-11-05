import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state, query } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"
import { NutriPatrol } from "@openfoodfacts/openfoodfacts-nodejs"
import { BASE } from "../../styles/base"
import { SHARED_THEME, type ThemeMode } from "../../styles/theme"

const VALID_TYPES = ["product", "image", "search"] as const
const VALID_FLAVORS = ["off", "obf", "opff", "opf", "off-pro"] as const

type FlagType = (typeof VALID_TYPES)[number]
type FlagFlavor = (typeof VALID_FLAVORS)[number]

/**
 * Interface mimicking the NutriPatrol API's FlagCreate schema.
 * We define it locally because the current SDK alpha version installed
 * does not export the type directly.
 */
interface FlagCreatePayload {
  type: FlagType
  url: string
  user_id: string
  source: "web" | "mobile" | "robotoff"
  flavor: FlagFlavor
  barcode?: string
  image_id?: string
  reason?: string
  comment?: string
}

/**
 * Nutri-Patrol Flag Form component
 * Allows reporting a product or image issue directly from the page.
 * @element nutripatrol-flag-form
 */
@customElement("nutripatrol-flag-form")
@localized()
export class NutriPatrolFlagForm extends LitElement {
  static override styles = [
    BASE,
    SHARED_THEME,
    css`
      :host {
        display: block;
        font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
        --off-nutripatrol-dialog-background-default: #fdfaf5;
        --off-nutripatrol-dialog-text-default: #333;
        --off-nutripatrol-dialog-shadow-default: 0 4px 12px rgba(0, 0, 0, 0.15);
        --off-nutripatrol-header-border-default: #e0e0e0;
        --off-nutripatrol-title-default: #000;
        --off-nutripatrol-close-default: #666;
        --off-nutripatrol-label-default: #555;
        --off-nutripatrol-input-background-default: #fafafa;
        --off-nutripatrol-input-border-default: #ccc;
        --off-nutripatrol-input-text-default: #333;
        --off-nutripatrol-disabled-background-default: #f0f0f0;
        --off-nutripatrol-disabled-text-default: #888;
        --off-nutripatrol-submit-default: #32863b;
        --off-nutripatrol-submit-hover-default: #2b7433;
        --off-nutripatrol-submit-disabled-default: #92bfa4;
        --off-nutripatrol-error-background-default: #ffebee;
        --off-nutripatrol-error-border-default: #ef9a9a;
        --off-nutripatrol-error-text-default: #c62828;
        --off-nutripatrol-success-background-default: #e8f5e9;
        --off-nutripatrol-success-border-default: #a5d6a7;
        --off-nutripatrol-success-text-default: #2e7d32;
      }

      :host([theme="dark"]) {
        --off-nutripatrol-dialog-background-default: #1e1e1e;
        --off-nutripatrol-dialog-text-default: #eee;
        --off-nutripatrol-dialog-shadow-default: 0 4px 12px rgba(255, 255, 255, 0.15);
        --off-nutripatrol-header-border-default: #444;
        --off-nutripatrol-title-default: #fff;
        --off-nutripatrol-close-default: #aaa;
        --off-nutripatrol-label-default: #ccc;
        --off-nutripatrol-input-background-default: #2b2b2b;
        --off-nutripatrol-input-border-default: #555;
        --off-nutripatrol-input-text-default: #eee;
        --off-nutripatrol-disabled-background-default: #333;
        --off-nutripatrol-disabled-text-default: #999;
        --off-nutripatrol-submit-default: #4a9c4f;
        --off-nutripatrol-submit-hover-default: #3b7e3d;
        --off-nutripatrol-submit-disabled-default: #555;
        --off-nutripatrol-error-background-default: #5f2120;
        --off-nutripatrol-error-border-default: #873c3c;
        --off-nutripatrol-error-text-default: #ffbaba;
        --off-nutripatrol-success-background-default: #1b4332;
        --off-nutripatrol-success-border-default: #2e7d32;
        --off-nutripatrol-success-text-default: #a7f3d0;
      }

      @media (prefers-color-scheme: dark) {
        :host([theme="auto"]),
        :host(:not([theme])) {
          --off-nutripatrol-dialog-background-default: #1e1e1e;
          --off-nutripatrol-dialog-text-default: #eee;
          --off-nutripatrol-dialog-shadow-default: 0 4px 12px rgba(255, 255, 255, 0.15);
          --off-nutripatrol-header-border-default: #444;
          --off-nutripatrol-title-default: #fff;
          --off-nutripatrol-close-default: #aaa;
          --off-nutripatrol-label-default: #ccc;
          --off-nutripatrol-input-background-default: #2b2b2b;
          --off-nutripatrol-input-border-default: #555;
          --off-nutripatrol-input-text-default: #eee;
          --off-nutripatrol-disabled-background-default: #333;
          --off-nutripatrol-disabled-text-default: #999;
          --off-nutripatrol-submit-default: #4a9c4f;
          --off-nutripatrol-submit-hover-default: #3b7e3d;
          --off-nutripatrol-submit-disabled-default: #555;
          --off-nutripatrol-error-background-default: #5f2120;
          --off-nutripatrol-error-border-default: #873c3c;
          --off-nutripatrol-error-text-default: #ffbaba;
          --off-nutripatrol-success-background-default: #1b4332;
          --off-nutripatrol-success-border-default: #2e7d32;
          --off-nutripatrol-success-text-default: #a7f3d0;
        }
      }

      dialog {
        padding: 0;
        border: none;
        border-radius: 8px;
        box-shadow: var(--nutripatrol-dialog-shadow, var(--off-nutripatrol-dialog-shadow-default));
        background: var(
          --nutripatrol-dialog-background,
          var(--off-color-surface, var(--off-nutripatrol-dialog-background-default))
        );
        color: var(
          --nutripatrol-dialog-text,
          var(--off-color-text, var(--off-nutripatrol-dialog-text-default))
        );
        max-width: 500px;
        width: 100%;
      }

      dialog::backdrop {
        background: rgba(0, 0, 0, 0.4);
      }

      .modal-header {
        padding: 1rem;
        border-bottom: 1px solid
          var(--nutripatrol-header-border, var(--off-nutripatrol-header-border-default));
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-title {
        font-size: 1.5rem;
        margin: 0;
        text-align: center;
        width: 100%;
        font-weight: 500;
        color: var(--nutripatrol-title, var(--off-nutripatrol-title-default));
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--nutripatrol-close, var(--off-nutripatrol-close-default));
        padding: 0 0.5rem;
        position: absolute;
        right: 1rem;
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      label {
        font-size: 0.85rem;
        color: var(--nutripatrol-label, var(--off-nutripatrol-label-default));
      }

      input,
      select,
      textarea {
        font-family: inherit;
        padding: 0.5rem;
        border: 1px solid
          var(--nutripatrol-input-border, var(--off-nutripatrol-input-border-default));
        border-radius: 4px;
        font-size: 1rem;
        width: 100%;
        box-sizing: border-box;
        background: var(
          --nutripatrol-input-background,
          var(--off-nutripatrol-input-background-default)
        );
        color: var(--nutripatrol-input-text, var(--off-nutripatrol-input-text-default));
      }

      input:disabled {
        background: var(
          --nutripatrol-disabled-background,
          var(--off-nutripatrol-disabled-background-default)
        );
        color: var(--nutripatrol-disabled-text, var(--off-nutripatrol-disabled-text-default));
      }

      textarea {
        resize: vertical;
        min-height: 80px;
      }

      .submit-btn {
        background-color: var(--nutripatrol-submit, var(--off-nutripatrol-submit-default));
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
        width: 100%;
        transition: background-color 0.2s;
      }

      .submit-btn:hover {
        background-color: var(
          --nutripatrol-submit-hover,
          var(--off-nutripatrol-submit-hover-default)
        );
      }

      .submit-btn:disabled {
        background-color: var(
          --nutripatrol-submit-disabled,
          var(--off-nutripatrol-submit-disabled-default)
        );
        cursor: not-allowed;
      }

      .message {
        padding: 1rem;
        text-align: center;
        border-radius: 4px;
        margin-top: 1rem;
      }

      .message.error {
        background-color: var(
          --nutripatrol-error-background,
          var(--off-color-error-surface, var(--off-nutripatrol-error-background-default))
        );
        color: var(
          --nutripatrol-error-text,
          var(--off-color-error, var(--off-nutripatrol-error-text-default))
        );
        border: 1px solid
          var(--nutripatrol-error-border, var(--off-nutripatrol-error-border-default));
      }

      .message.success {
        background-color: var(
          --nutripatrol-success-background,
          var(--off-nutripatrol-success-background-default)
        );
        color: var(--nutripatrol-success-text, var(--off-nutripatrol-success-text-default));
        border: 1px solid
          var(--nutripatrol-success-border, var(--off-nutripatrol-success-border-default));
      }
    `,
  ]

  @property({ reflect: true })
  theme: ThemeMode = "auto"

  @property({ type: String })
  barcode = ""

  @property({ type: String })
  type: FlagType = "product"

  @property({ type: String, attribute: "image-id" })
  imageId = ""

  @property({ type: String })
  flavor: FlagFlavor = "off"

  @property({ type: String, attribute: "user-id" })
  userId = ""

  @property({ type: String })
  url = ""

  @property({ type: Boolean, reflect: true })
  open = false

  @state()
  private loading = false

  @state()
  private error: string | null = null

  @state()
  private success = false

  @state()
  private reason = "wrong_data"

  @state()
  private comment = ""

  @query("dialog")
  private dialog!: HTMLDialogElement

  private client = new NutriPatrol(globalThis.fetch)
  private autoCloseTimer?: ReturnType<typeof setTimeout>

  private get modalTitle(): string {
    switch (this.type) {
      case "image":
        return msg("Flag an image")
      case "search":
        return msg("Flag a search result")
      default:
        return msg("Flag a product")
    }
  }

  private get reasonOptions(): { value: string; label: string }[] {
    switch (this.type) {
      case "image":
        return [
          { value: "inappropriate", label: msg("Inappropriate") },
          { value: "outdated", label: msg("Outdated") },
          { value: "includes_personal_infos", label: msg("Includes Personal Information") },
          { value: "duplicate", label: msg("Duplicate") },
          { value: "other", label: msg("Other") },
        ]
      case "search":
        return [{ value: "other", label: msg("Other") }]
      default:
        return [
          { value: "wrong_barcode", label: msg("Wrong Barcode") },
          { value: "missing_data", label: msg("Missing Data") },
          { value: "wrong_data", label: msg("Wrong Data") },
          { value: "other", label: msg("Other") },
        ]
    }
  }

  private get submitLabel(): string {
    switch (this.type) {
      case "image":
        return msg("FLAG IMAGE")
      case "search":
        return msg("FLAG SEARCH")
      default:
        return msg("FLAG PRODUCT")
    }
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("open")) {
      if (this.open) {
        if (this.dialog && !this.dialog.open) {
          this.dialog.showModal()
        }
        this.resetForm()
      } else {
        this.dialog?.close()
      }
    }

    if (changedProperties.has("type")) {
      this.reason = this.reasonOptions[0].value
    }
  }

  private resetForm() {
    this.success = false
    this.error = null
    this.loading = false
    // Reset reason to the first valid option for the current type
    this.reason = this.reasonOptions[0].value
    this.comment = ""
  }

  private handleClose() {
    if (!this.open) return

    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer)
      this.autoCloseTimer = undefined
    }
    this.open = false
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }))
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer)
      this.autoCloseTimer = undefined
    }
  }

  private async handleSubmit(e: Event) {
    e.preventDefault()

    if (!VALID_TYPES.includes(this.type as FlagType)) {
      this.error = msg("Invalid flag type.")
      return
    }

    if (!VALID_FLAVORS.includes(this.flavor as FlagFlavor)) {
      this.error = msg("Invalid flavor.")
      return
    }

    if (!this.userId) {
      this.error = msg("User ID is required to submit a flag. Please log in.")
      return
    }

    if (this.type === "image" && !this.imageId) {
      this.error = msg("Image ID is required to flag an image.")
      return
    }

    this.loading = true
    this.error = null

    // As per the SDK types, url, user_id, source, flavor, and type are required
    const payload: FlagCreatePayload = {
      type: this.type,
      url: this.url || window.location.href,
      user_id: this.userId,
      source: "web",
      flavor: this.flavor as FlagCreatePayload["flavor"],
      reason: this.reason,
      comment: this.comment || undefined,
    }

    if (this.barcode && this.type !== "search") {
      payload.barcode = this.barcode
    }

    if (this.type === "image") {
      payload.image_id = this.imageId
    }

    try {
      // Temporary bypass until the SDK version is bumped and types align
      const { error } = await this.client.createFlag(payload)
      if (error) {
        console.error("Failed to create flag:", error)
        this.error = msg("Failed to submit flag. Please try again later.")
      } else {
        this.success = true
        // Close modal automatically after delay
        this.autoCloseTimer = setTimeout(() => this.handleClose(), 3000)
      }
    } catch (err) {
      console.error("Flag API submission error:", err)
      this.error = msg("An unexpected error occurred.")
    } finally {
      this.loading = false
    }
  }

  override render() {
    return html`
      <dialog @close=${this.handleClose}>
        <div class="modal-header">
          <h2 class="modal-title">${this.modalTitle}</h2>
          <!-- Close button -->
          <button class="close-btn" @click=${this.handleClose} aria-label="${msg("Close")}">
            &times;
          </button>
        </div>

        <div class="modal-body">
          ${
            this.success
              ? html`
                  <div class="message success">
                    ${msg("Thank you for reporting. Your flag has been submitted successfully.")}
                  </div>
                `
              : html`
                  <form @submit=${this.handleSubmit}>
                    ${
                      this.type === "image" && this.url
                        ? html`
                            <div class="form-group image-preview">
                              <img
                                src=${this.url}
                                alt=${msg("Image to flag")}
                                style="max-width: 100%; max-height: 200px; object-fit: contain; border: 1px solid #e0e0e0; border-radius: 4px;"
                              />
                            </div>
                          `
                        : nothing
                    }
                    ${
                      this.barcode && this.type !== "search"
                        ? html`
                            <div class="form-group">
                              <label for="barcode">${msg("Barcode")} *</label>
                              <input type="text" id="barcode" .value=${this.barcode} disabled />
                            </div>
                          `
                        : nothing
                    }
                    ${
                      this.type === "image" && this.imageId
                        ? html`
                            <div class="form-group">
                              <label for="image-id">${msg("Image ID")} *</label>
                              <input type="text" id="image-id" .value=${this.imageId} disabled />
                            </div>
                          `
                        : nothing
                    }

                    <div class="form-group">
                      <label for="reason">${msg("Reason")} *</label>
                      <select
                        id="reason"
                        .value=${this.reason}
                        @change=${(e: Event) => (this.reason = (e.target as HTMLSelectElement).value)}
                        required
                      >
                        ${this.reasonOptions.map(
                          (opt) => html`
                            <option value="${opt.value}" ?selected=${this.reason === opt.value}>
                              ${opt.label}
                            </option>
                          `
                        )}
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="comment">${msg("Comment")}</label>
                      <textarea
                        id="comment"
                        .value=${this.comment}
                        @input=${(e: Event) =>
                          (this.comment = (e.target as HTMLTextAreaElement).value)}
                        placeholder=${msg("Optional details")}
                      ></textarea>
                    </div>

                    ${this.error ? html`<div class="message error">${this.error}</div>` : nothing}

                    <button type="submit" class="submit-btn" ?disabled=${this.loading}>
                      ${this.loading ? msg("Submitting...") : this.submitLabel}
                    </button>
                  </form>
                `
          }
        </div>
      </dialog>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nutripatrol-flag-form": NutriPatrolFlagForm
  }
}
