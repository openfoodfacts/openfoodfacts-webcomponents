import { localized, msg } from "@lit/localize"
import { LitElement, html, css } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import "../icons/barcode"
import "../icons/search"
import "../icons/close"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType } from "../../constants"

export enum BarcodeState {
  EXITED,
  DETECTED,
  DETECTOR_AVAILABLE,
  DETECTOR_NOT_AVAILABLE,
}

@customElement("barcode-scanner")
@localized()
export class BarcodeScanner extends LitElement {
  static override styles = [
    BASE,
    getButtonClasses([ButtonType.White]),
    css`
      .barcode-scanner {
        position: relative;
        max-width: 300px;
        width: 100%;
        height: 300px;
      }
      video {
        background-color: black;
        border-radius: 8px;
        width: 100%;
        height: 100%;
      }
      .overlay-wrapper {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        cursor: pointer;
        z-index: 1;
      }
      .centered-overlay {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        max-width: 100%;
        width: 100%;
        height: 100%;
      }

      .video-frame {
        border: 3px solid #fff;
        border-radius: 8px;
        box-sizing: border-box;
      }
      .cta-overlay-wrapper {
        width: 100%;
        height: 100%;
        padding: 10%;
        cursor: pointer;
        box-sizing: border-box;
      }

      .cta-exit-button {
        position: absolute;
        display: flex;
        align-items: baseline;
        justify-content: center;

        top: 3px;
        left: 3px;
        z-index: 2;
      }

      .cta-overlay-text {
        text-align: center;
        color: white;
      }
      .cta-overlay-icon {
        display: flex;
        justify-content: center;
      }
      .cta-overlay-button {
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: none;
        margin-top: 1rem;
        cursor: pointer;
        margin-bottom: 1rem;
        background-color: transparent;
      }
      .cta-overlay-button.start-scanning {
        background-color: #4c4c4d;
      }

      .cta-overlay {
        position: relative;
      }

      .cta-overlay-frame {
        width: 15%;
        height: 15%;
        position: absolute;
      }

      .cta-overlay-frame.left-top-border {
        top: 40px;
        left: 0px;
        border-left: 2px solid white;
        border-top: 2px solid white;
        border-radius: 8px 0 0 0;
      }

      .cta-overlay-frame.left-bottom-border {
        left: 0px;
        bottom: 40px;
        border-left: 2px solid white;
        border-bottom: 2px solid white;
        border-radius: 0 0 0 8px;
      }
      .cta-overlay-frame.right-bottom-border {
        right: 0px;
        bottom: 40px;
        border-right: 2px solid white;
        border-bottom: 2px solid white;
        border-radius: 0 0 8px 0;
      }

      .cta-overlay-frame.right-top-border {
        right: 0px;
        top: 40px;
        border-right: 2px solid white;
        border-top: 2px solid white;
        border-radius: 0 8px 0 0;
      }
    `,
  ]

  @property({ type: Boolean })
  runScanner = false
  @state() barcode = ""

  @query("video") private video!: HTMLVideoElement

  @state()
  private stream: MediaStream | null = null

  @state()
  private codeReader: BarcodeDetector | null = null

  @state()
  private detectFn?: (imageData: ImageBitmap) => Promise<string | undefined>

  get isVideoPlaying() {
    return this.stream !== null
  }

  constructor() {
    super()
    this.setupBarcodeDetector()
  }

  override async firstUpdated() {
    if (this.codeReader && this.runScanner) {
      await this.askPermission()
    }
  }

  private setupBarcodeDetector() {
    try {
      this.codeReader = new BarcodeDetector()
      this.detectFn = this.detectWithBarcodeDetector
      this.sendBarcodeStateEvent({ state: BarcodeState.DETECTOR_AVAILABLE })
    } catch (error) {
      this.sendBarcodeStateEvent({ state: BarcodeState.DETECTOR_NOT_AVAILABLE })
      console.warn("BarcodeDetector not available:", error)
    }
  }

  private async detectWithBarcodeDetector(imageData: ImageBitmap): Promise<string | undefined> {
    try {
      // Type assertion for BarcodeDetector
      const detector = this.codeReader
      if (detector) {
        const barcodes = await detector.detect(imageData)
        if (barcodes.length > 0) {
          return barcodes[0].rawValue
        }
      }
    } catch (error) {
      console.error("Error detecting barcode:", error)
    }
    return undefined
  }

  private async askPermission() {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" })

      if (["granted", "prompt"].includes(permissionStatus.state)) {
        await this.startCamera()
      } else {
        console.warn("Camera permission denied. Please enable it in your browser settings.")
      }
    } catch (error) {
      console.error("Permission query error:", error)
    }
  }

  private async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
      })

      if (this.video) {
        this.video.srcObject = this.stream
        await this.video.play()

        // Set up video frame capture
        this.setupFrameCapture()
      }
    } catch (err) {
      console.error("Error accessing camera: ", err)
    }
  }

  private stopVideo() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      // clean video
      this.video.srcObject = null
      this.stream = null
    }
  }

  private sendBarcodeStateEvent(detail: { barcode?: string; state: BarcodeState }) {
    this.dispatchEvent(new CustomEvent(EventType.BARCODE_STATE, { detail }))
  }

  private exit(event: Event) {
    event.stopPropagation()
    this.stopVideo()
    this.sendBarcodeStateEvent({
      state: BarcodeState.EXITED,
    })
  }

  private setupFrameCapture() {
    const video = this.video
    const processFrame = async () => {
      if (video.paused || video.ended) {
        requestAnimationFrame(processFrame)
        return
      }

      let imageBitmap: ImageBitmap | undefined
      try {
        imageBitmap = await createImageBitmap(video, 0, 0, video.videoWidth, video.videoHeight)
      } catch (e) {
        console.error("Error creating image bitmap:", e)
      }

      if (imageBitmap) {
        try {
          const result = await this.detectFn!(imageBitmap)
          if (result) {
            this.barcode = result
            this.sendBarcodeStateEvent({ barcode: this.barcode, state: BarcodeState.DETECTED })

            this.stopVideo()
            return
          }
        } catch (error) {
          console.error("Barcode detection error:", error)
        }
      }

      requestAnimationFrame(processFrame)
    }

    requestAnimationFrame(processFrame)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    this.stopVideo()
  }

  private renderOverlay() {
    if (!this.codeReader) {
      return html` <div class="cta-overlay-wrapper">
        <div class="centered-overlay">
          <div class="cta-overlay">
            <div class="cta-overlay-text">
              ${msg("Your browser does not support barcode scanning.")}
            </div>
          </div>
        </div>
      </div>`
    }
    if (this.isVideoPlaying) {
      return html`
        <div class="cta-overlay-wrapper" @click=${this.askPermission}>
          <div class="cta-exit-button">
            <button class="button white-button small" @click=${this.exit}>
              <close-icon></close-icon><span>${msg("Close")}</span>
            </button>
          </div>
          <div class="centered-overlay">
            <div class="cta-overlay-frame right-top-border"></div>
            <div class="cta-overlay-frame left-top-border"></div>
            <div class="cta-overlay-frame right-bottom-border"></div>
            <div class="cta-overlay-frame left-bottom-border"></div>
            <div class="cta-overlay">
              <div class="cta-overlay-icon">
                <button class="cta-overlay-button">
                  <search-icon></search-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      `
    }
    return html`
      <div class="cta-overlay-wrapper" @click=${this.askPermission}>
        <div class="centered-overlay">
          <div class="cta-overlay">
            <div class="cta-overlay-icon">
              <button class="cta-overlay-button start-scanning">
                <barcode-icon></barcode-icon>
              </button>
            </div>
            <div class="cta-overlay-text">
              ${msg("Click to scan a barcode and find out its details (health, preferences, etc.)")}
            </div>
          </div>
        </div>
      </div>
    `
  }

  override render() {
    return html`
      <div class="barcode-scanner">
        <video></video>
        <div class="overlay-wrapper">${this.renderOverlay()}</div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "barcode-scanner": BarcodeScanner
  }
}
