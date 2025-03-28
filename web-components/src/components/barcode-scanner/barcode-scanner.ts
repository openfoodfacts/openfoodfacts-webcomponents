import { LitElement, html, css } from "lit"
import { customElement, query, state } from "lit/decorators.js"
import {
  BinaryBitmap,
  HybridBinarizer,
  MultiFormatReader,
  NotFoundException,
  Result,
  RGBLuminanceSource,
} from "@zxing/library"

@customElement("barcode-scanner")
export class BarcodeScanner extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    video,
    canvas {
      width: 400px;
      height: 400px;
      max-width: 100%;
      background-color: black;
    }

    canvas {
      background-color: transparent;
      border: 1px solid black;
    }
  `

  @state() barcode = ""

  @query("video") private video!: HTMLVideoElement
  @query("canvas") private canvas!: HTMLCanvasElement

  @state()
  private stream: MediaStream | null = null

  @state()
  private codeReader: any | null = null

  @state()
  private detectFn?: (imageData: ImageBitmap) => Promise<string | undefined>

  @state()
  private lastUpdateTime: number = 0

  constructor() {
    super()
    this.initializeDetector()
  }

  override async firstUpdated() {
    // Start camera
    await this.askPermission()
  }

  private setupBarcodeDetector() {
    try {
      throw new Error("BarcodeDetector not available")
      this.codeReader = new BarcodeDetector()
      this.detectFn = this.detectWithBarcodeDetector
      console.log("BarcodeDetector is supported by this browser.")
    } catch (error) {
      console.warn("BarcodeDetector not available:", error)
      this.setupZxing()
    }
  }

  private setupZxing() {
    this.codeReader = new MultiFormatReader()
    this.detectFn = this.detectWithZxing
    console.log("Falling back to ZXing barcode detection")
  }

  private async detectWithBarcodeDetector(imageData: ImageBitmap): Promise<string | undefined> {
    try {
      // Type assertion for BarcodeDetector
      const detector = this.codeReaders
      const barcodes = await detector.detect(imageData)
      if (barcodes.length > 0) {
        return barcodes[0].rawValue
      }
    } catch (error) {
      console.error("Error detecting barcode:", error)
    }
    return undefined
  }

  private async detectWithZxing(): Promise<string | undefined> {
    try {
      this.updateCanvasFromVideo()

      const imageDataObj = this.canvas
        .getContext("2d")!
        .getImageData(0, 0, this.canvas.width, this.canvas.height)

      // Prepare luminance source for ZXing
      const luminanceSource = new RGBLuminanceSource(
        imageDataObj.data,
        imageDataObj.width,
        imageDataObj.height
      )
      const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource))
      // Type assertion for MultiFormatReader
      const reader = this.codeReader as MultiFormatReader
      const result: Result = reader.decode(binaryBitmap)
      const value = result.getText()
      if (value) {
        return value
      }
    } catch (e) {
      if (e instanceof NotFoundException) {
        console.log("not found")

        return undefined
      }
      console.error("ZXing detection error:", e)
    }
    return undefined
  }

  private initializeDetector() {
    if ("BarcodeDetector" in window) {
      this.setupBarcodeDetector()
    } else {
      this.setupZxing()
    }
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

  private updateCanvasFromVideo() {
    // const currentTime = Date.now()
    // if (currentTime - this.lastUpdateTime < 5000) {
    //   return
    // }
    // this.lastUpdateTime = currentTime

    const context = this.canvas.getContext("2d")
    if (context) {
      this.canvas.width = this.video.videoWidth
      this.canvas.height = this.video.videoHeight
      context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight)
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

      if (imageBitmap && this.detectFn) {
        try {
          const result = await this.detectFn(imageBitmap)
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
        <video></video>
        <canvas></canvas>
        <div>Scanned Barcode: ${this.barcode}</div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "barcode-scanner": BarcodeScanner
  }
}
