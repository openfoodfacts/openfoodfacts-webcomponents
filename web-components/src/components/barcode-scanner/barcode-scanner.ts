import { LitElement, html, css } from "lit"
import { customElement, query, state } from "lit/decorators.js"
import { MultiFormatReader, NotFoundException, Result } from "@zxing/library"

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
  `

  @state() barcode = ""

  @query("video") private video!: HTMLVideoElement
  @query("canvas") private canvas!: HTMLCanvasElement

  @state()
  private stream: MediaStream | null = null

  @state()
  private codeReader: any

  @state()
  private detectFn?: (imageData: ImageBitmap) => Promise<string | undefined>

  constructor() {
    super()
    this.initializeDector()
  }

  setupBarcodeDetector() {
    this.codeReader = new BarcodeDetector()
    this.detectFn = this.detectWithBarcodeDetector
    alert("BarcodeDetector is supported by this browser.")
  }
  setupZxing() {
    this.codeReader = new MultiFormatReader()
    this.detectFn = this.detectWithZxing
  }
  async detectWithBarcodeDetector(imageData: ImageBitmap): Promise<string | undefined> {
    try {
      const value = await this.codeReader.detect(imageData)
      if (value.length > 0) {
        return value[0].rawValue
      }
    } catch (error) {
      console.error("Error detecting barcode:", error)
      return undefined
    }
  }

  async detectWithZxing(imageData: ImageBitmap): Promise<string | undefined> {
    try {
      let result: Result = await this.codeReader.decode(this.video)
      alert("Barcode detected: " + result.getText())
      let value = result.getText()
      if (value) {
        return value
      }
    } catch (e) {
      if (e instanceof NotFoundException) {
        return ""
      }
      alert(e)
      throw e
    }
  }

  initializeDector() {
    if ("BarcodeDetector" in window) {
      this.setupBarcodeDetector()
    } else {
      this.setupZxing()
    }
  }

  override async firstUpdated() {
    // Start camera
    await this.askPermission()
  }

  askPermission() {
    navigator.permissions.query({ name: "camera" }).then((permissionStatus) => {
      if (["granted", "prompt"].includes(permissionStatus.state)) {
        this.startCamera()
      } else {
        alert("Camera permission denied. Please enable it in your browser settings.")
      }
    })
  }

  async startCamera() {
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
        this.video.play()

        // Set up video frame capture
        this.setupFrameCapture()
      }
    } catch (err) {
      console.error("Error accessing camera: ", err)
    }
  }

  updateCanvasFromVideo() {
    const context = this.canvas.getContext("2d")
    if (context) {
      context.drawImage(this.video, 0, 0, this.video.width, this.video.height)
    }
  }

  stopVideo() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }
  }

  private setupFrameCapture() {
    const canvas = this.canvas
    const video = this.video

    const processFrame = async () => {
      if (video.paused || video.ended) {
        requestAnimationFrame(processFrame)
        return
      }
      let imageBitmap
      try {
        imageBitmap = await createImageBitmap(video, 0, 0, video.videoWidth, video.videoHeight)
        this.updateCanvasFromVideo()
      } catch (e) {
        console.log(e)
      }

      if (imageBitmap) {
        const result: string | undefined = await this.detectFn!(imageBitmap)
        if (result) {
          console.log(result)
          debugger
          this.barcode = result
          console.log(this.barcode)
          alert("barcode " + JSON.stringify(this.barcode))
          this.stopVideo()
        }
      }

      requestAnimationFrame(processFrame)
    }

    video.addEventListener("play", () => {
      // Adjust canvas to match video dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      processFrame()
    })
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    // Stop all tracks to release camera
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }
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
