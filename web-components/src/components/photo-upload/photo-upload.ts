import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { msg } from "@lit/localize"
import { LanguageCodesMixin } from "../../mixins/language-codes-mixin"
import { setLanguageCode } from "../../localization"
import { uploadProductImage } from "../../api/openfoodfacts"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { ALERT } from "../../styles/alert"
import { INPUT, SELECT } from "../../styles/form"
import "../icons/loading-spin"

export type PhotoUploadType = "image" | "front" | "ingredients" | "nutrition" | "packaging"

export const VALID_UPLOAD_TYPES: PhotoUploadType[] = [
  "image",
  "front",
  "ingredients",
  "nutrition",
  "packaging",
]

/**
 * Reusable Lit Web Component for photo upload supporting Open Food Facts photo categories.
 *
 * @element photo-upload
 * @fires file-selected - Fired when a valid file is selected
 * @fires upload-start - Fired when upload process starts
 * @fires upload-success - Fired when photo is successfully uploaded
 * @fires upload-error - Fired when upload or validation fails
 * @fires file-removed - Fired when selected photo is cleared
 */
@customElement("photo-upload")
export class PhotoUpload extends LanguageCodesMixin(LitElement) {
  static override styles = [
    ALERT,
    INPUT,
    SELECT,
    ...getButtonClasses([
      ButtonType.Chocolate,
      ButtonType.ChocolateOutline,
      ButtonType.Danger,
      ButtonType.LightRed,
    ]),
    css`
      :host {
        display: block;
        font-family: inherit;
        box-sizing: border-box;
      }

      .photo-upload-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border: 1px dashed var(--photo-upload-border-color, #ccc);
        border-radius: 8px;
        background-color: var(--photo-upload-bg-color, #fafafa);
        transition:
          border-color 0.2s ease,
          background-color 0.2s ease;
      }

      .photo-upload-container.disabled {
        opacity: 0.6;
        pointer-events: none;
        background-color: #f0f0f0;
      }

      .photo-upload-container.dragover {
        border-color: #2196f3;
        background-color: #e3f2fd;
      }

      .controls-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
        min-width: 140px;
      }

      .field-group label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #333;
      }

      .dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem 1rem;
        border: 2px dashed #bbb;
        border-radius: 6px;
        background-color: #ffffff;
        cursor: pointer;
        text-align: center;
        gap: 0.5rem;
      }

      .dropzone:focus-visible {
        outline: 2px solid #2196f3;
        outline-offset: 2px;
      }

      .dropzone p {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
      }

      .preview-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        position: relative;
        padding: 0.5rem;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
      }

      .preview-image {
        max-width: 100%;
        max-height: 250px;
        object-fit: contain;
        border-radius: 4px;
      }

      .file-info {
        font-size: 0.85rem;
        color: #555;
        text-align: center;
        word-break: break-all;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
        width: 100%;
        justify-content: center;
      }

      .hidden-input {
        display: none;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ]

  /**
   * Upload category type (image, front, ingredients, nutrition, packaging).
   */
  @property({ type: String, attribute: "upload-type", reflect: true })
  uploadType: PhotoUploadType = "image"

  /**
   * The language written on the image (e.g. 'en', 'fr', 'hi', 'de').
   */
  @property({ type: String, attribute: "language", reflect: true })
  language: string = "en"

  /**
   * Interface language override. If provided, sets component locale.
   */
  @property({ type: String, attribute: "ui-language", reflect: true })
  uiLanguage?: string

  /**
   * Whether the upload component is disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false

  /**
   * External loading state override.
   */
  @property({ type: Boolean, reflect: true })
  loading: boolean = false

  /**
   * Product barcode if direct API upload to Open Food Facts is desired.
   */
  @property({ type: String, attribute: "barcode", reflect: true })
  barcode?: string

  /**
   * Accepted file mime types.
   */
  @property({ type: String })
  accept: string = "image/*"

  /**
   * Maximum allowed file size in bytes (default: 15MB).
   */
  @property({ type: Number, attribute: "max-file-size" })
  maxFileSize: number = 15 * 1024 * 1024

  @state()
  private selectedFile: File | null = null

  @state()
  private previewUrl: string | null = null

  @state()
  private isDragOver: boolean = false

  @state()
  private internalLoading: boolean = false

  @state()
  private errorMessage: string | null = null

  @state()
  private successMessage: string | null = null

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties)
    if (changedProperties.has("uiLanguage") && this.uiLanguage) {
      try {
        setLanguageCode(this.uiLanguage)
      } catch (err) {
        console.warn(`[photo-upload] Invalid uiLanguage: ${this.uiLanguage}`, err)
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanUpPreviewUrl()
  }

  private cleanUpPreviewUrl() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl)
      this.previewUrl = null
    }
  }

  private get isLoading(): boolean {
    return this.loading || this.internalLoading
  }

  private validateFile(file: File): string | null {
    if (!file.type.startsWith("image/")) {
      return msg("Please select a valid image file.")
    }
    if (file.size > this.maxFileSize) {
      const maxMb = (this.maxFileSize / (1024 * 1024)).toFixed(1)
      return `${msg("File size exceeds maximum limit.")} (${maxMb} MB)`
    }
    return null
  }

  private handleFileSelection(file: File) {
    this.errorMessage = null
    this.successMessage = null

    const validationError = this.validateFile(file)
    if (validationError) {
      this.errorMessage = validationError
      this.dispatchEvent(
        new CustomEvent("upload-error", {
          detail: {
            error: validationError,
            file,
            uploadType: this.uploadType,
            language: this.language,
          },
          bubbles: true,
          composed: true,
        })
      )
      return
    }

    this.cleanUpPreviewUrl()
    this.selectedFile = file
    this.previewUrl = URL.createObjectURL(file)

    this.dispatchEvent(
      new CustomEvent("file-selected", {
        detail: {
          file: this.selectedFile,
          previewUrl: this.previewUrl,
          uploadType: this.uploadType,
          language: this.language,
        },
        bubbles: true,
        composed: true,
      })
    )
  }

  private onFileInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      this.handleFileSelection(target.files[0])
    }
  }

  private triggerFileInput() {
    if (this.disabled || this.isLoading) return
    const fileInput = this.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")
    fileInput?.click()
  }

  private onDragOver(e: DragEvent) {
    e.preventDefault()
    if (this.disabled || this.isLoading) return
    this.isDragOver = true
  }

  private onDragLeave(e: DragEvent) {
    e.preventDefault()
    this.isDragOver = false
  }

  private onDrop(e: DragEvent) {
    e.preventDefault()
    this.isDragOver = false
    if (this.disabled || this.isLoading) return

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.handleFileSelection(e.dataTransfer.files[0])
    }
  }

  /**
   * Clear current file selection.
   */
  public clearSelection() {
    this.selectedFile = null
    this.cleanUpPreviewUrl()
    this.errorMessage = null
    this.successMessage = null

    const fileInput = this.shadowRoot?.querySelector<HTMLInputElement>(".hidden-input")
    if (fileInput) {
      fileInput.value = ""
    }

    this.dispatchEvent(
      new CustomEvent("file-removed", {
        detail: {},
        bubbles: true,
        composed: true,
      })
    )
  }

  /**
   * Initiate upload of selected file.
   */
  public async upload(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = msg("No file selected.")
      return
    }

    this.internalLoading = true
    this.errorMessage = null
    this.successMessage = null

    const uploadDetail = {
      file: this.selectedFile,
      uploadType: this.uploadType,
      language: this.language,
      barcode: this.barcode,
    }

    this.dispatchEvent(
      new CustomEvent("upload-start", {
        detail: uploadDetail,
        bubbles: true,
        composed: true,
      })
    )

    try {
      let result: any = null
      if (this.barcode) {
        result = await uploadProductImage({
          code: this.barcode,
          imagefield: this.uploadType,
          file: this.selectedFile,
          imgupload_lang: this.language,
        })
      } else {
        // Parent application will process custom upload via events
        result = { status: "pending_parent_handler" }
      }

      this.successMessage = msg("Upload Successful")
      this.dispatchEvent(
        new CustomEvent("upload-success", {
          detail: {
            result,
            file: this.selectedFile,
            uploadType: this.uploadType,
            language: this.language,
          },
          bubbles: true,
          composed: true,
        })
      )
    } catch (err: any) {
      const errorMsg = err?.message || msg("Upload Failed")
      this.errorMessage = `${msg("Upload Failed")}: ${errorMsg}`
      this.dispatchEvent(
        new CustomEvent("upload-error", {
          detail: {
            error: err,
            file: this.selectedFile,
            uploadType: this.uploadType,
            language: this.language,
          },
          bubbles: true,
          composed: true,
        })
      )
    } finally {
      this.internalLoading = false
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  private renderCategoryLabel(type: PhotoUploadType) {
    switch (type) {
      case "front":
        return msg("Front")
      case "ingredients":
        return msg("Ingredients")
      case "nutrition":
        return msg("Nutrition")
      case "packaging":
        return msg("Packaging")
      case "image":
      default:
        return msg("General Image")
    }
  }

  override render() {
    return html`
      <div
        class="photo-upload-container ${this.disabled ? "disabled" : ""} ${this.isDragOver
          ? "dragover"
          : ""}"
      >
        <input
          type="file"
          class="hidden-input"
          accept=${this.accept}
          ?disabled=${this.disabled || this.isLoading}
          @change=${this.onFileInputChange}
          aria-label=${msg("Choose Image")}
        />

        <div class="controls-row">
          <div class="field-group">
            <label for="upload-type-select">${msg("Upload Type")}</label>
            <select
              id="upload-type-select"
              class="select"
              ?disabled=${this.disabled || this.isLoading}
              .value=${this.uploadType}
              @change=${(e: Event) => {
                this.uploadType = (e.target as HTMLSelectElement).value as PhotoUploadType
              }}
            >
              ${VALID_UPLOAD_TYPES.map(
                (type) => html`
                  <option value=${type} ?selected=${this.uploadType === type}>
                    ${this.renderCategoryLabel(type)}
                  </option>
                `
              )}
            </select>
          </div>

          <div class="field-group">
            <label for="upload-lang-input">${msg("Image Language")}</label>
            <input
              id="upload-lang-input"
              type="text"
              class="input"
              ?disabled=${this.disabled || this.isLoading}
              .value=${this.language}
              @input=${(e: Event) => {
                this.language = (e.target as HTMLInputElement).value
              }}
              placeholder="e.g. en, fr, hi, de"
            />
          </div>
        </div>

        ${!this.selectedFile
          ? html`
              <div
                class="dropzone"
                tabindex=${this.disabled || this.isLoading ? "-1" : "0"}
                role="button"
                aria-label=${msg("Choose Image")}
                @click=${this.triggerFileInput}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    this.triggerFileInput()
                  }
                }}
                @dragover=${this.onDragOver}
                @dragleave=${this.onDragLeave}
                @drop=${this.onDrop}
              >
                <p><strong>${msg("Choose Image")}</strong></p>
                <p>${msg("or drag and drop photo here")}</p>
                <button
                  type="button"
                  class="button chocolate-button"
                  ?disabled=${this.disabled || this.isLoading}
                >
                  ${this.isLoading ? html`<loading-spin size="15px"></loading-spin>` : nothing}
                  ${msg("Choose Image")}
                </button>
              </div>
            `
          : html`
              <div class="preview-container">
                <img
                  class="preview-image"
                  src=${this.previewUrl ?? ""}
                  alt=${msg("Preview of uploaded photo")}
                />
                <div class="file-info">
                  <strong>${this.selectedFile.name}</strong> (${this.formatFileSize(
                    this.selectedFile.size
                  )})
                </div>
                <div class="actions">
                  <button
                    type="button"
                    class="button chocolate-button"
                    ?disabled=${this.disabled || this.isLoading}
                    @click=${this.upload}
                  >
                    ${this.isLoading ? html`<loading-spin size="15px"></loading-spin>` : nothing}
                    ${msg("Upload")}
                  </button>
                  <button
                    type="button"
                    class="button danger-button"
                    ?disabled=${this.disabled || this.isLoading}
                    @click=${this.clearSelection}
                  >
                    ${msg("Cancel")}
                  </button>
                </div>
              </div>
            `}
        ${this.errorMessage
          ? html`<div class="error" role="alert">${this.errorMessage}</div>`
          : nothing}
        ${this.successMessage
          ? html`<div class="success" role="status">${this.successMessage}</div>`
          : nothing}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "photo-upload": PhotoUpload
  }
}
