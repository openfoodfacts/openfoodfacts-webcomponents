import { LitElement, html, css } from "lit"
import { customElement, query, state } from "lit/decorators.js"

@customElement("barcode-scanner")
export class BarcodeScanner extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    video {
      width: 400px;
      height: 400px;
      max-width: 100%;
      background-color: black;
    }
  `

  @state() barcode = ""

  @query("video") private video!: HTMLVideoElement

  @state()
  private stream: MediaStream | null = null

  @state()
  private codeReader: BarcodeDetector | null = null

  @state()
  private detectFn?: (imageData: ImageBitmap) => Promise<string | undefined>

  constructor() {
    super()
    this.setupBarcodeDetector()
  }

  override async firstUpdated() {
    if (this.codeReader) {
      await this.askPermission()
    }
  }

  private setupBarcodeDetector() {
    try {
      this.codeReader = new BarcodeDetector()
      this.detectFn = this.detectWithBarcodeDetector
      console.log("BarcodeDetector is supported by this browser.")
    } catch (error) {
      alert("BarcodeDetector not available. Please use a browser that supports BarcodeDetector.")
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
      const permissionStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      })

      if (["granted", "prompt"].includes(permissionStatus.state)) {
        await this.startCamera()
      } else {
        alert("Camera permission denied. Please enable it in your browser settings.")

        console.warn("Camera permission denied. Please enable it in your browser settings.")
      }
    } catch (error) {
      alert("Camera permission denied. Please enable it in your browser settings.")
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
            console.log("Barcode detected:", this.barcode)
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

  override render() {
    return html`
      <div>
        <div>Scanned Barcode: ${this.barcode}</div>
        <video></video>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "barcode-scanner": BarcodeScanner
  }
}
