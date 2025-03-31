import { localized, msg } from "@lit/localize"
import { LitElement, html, css } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import "../icons/barcode"
import "../icons/search"

@customElement("barcode-scanner")
@localized()
export class BarcodeScanner extends LitElement {
  static override styles = [
    BASE,
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
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        max-width: 100%;
        padding-right: 10%;
        padding-left: 10%;
        width: 100%;
        box-sizing: border-box;
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
        cursor: pointer;
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
      }
      .cta-overlay-button.start-scanning {
        background-color: #4c4c4d;
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
    } catch (error) {
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
      this.stream = null
    }
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
            alert("Barcode detected: " + this.barcode)

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
          <div class="centered-overlay">
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
