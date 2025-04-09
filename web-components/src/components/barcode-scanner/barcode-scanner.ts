import { localized, msg } from "@lit/localize"
import { LitElement, html, css } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import { BASE } from "../../styles/base"
import "../icons/barcode"
import "../icons/search"
import "../icons/close"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { EventType } from "../../constants"
import { StyleInfo, styleMap } from "lit-html/directives/style-map.js"
import { ConsoleLogMixin } from "../../mixins/console-log-mixin"

export enum BarcodeScannerState {
  EXITED = "exited",
  DETECTED = "detected",
  DETECTOR_AVAILABLE = "detector-available",
  DETECTOR_NOT_AVAILABLE = "detector-not-available",
  STARTED = "started",
  NO_PERMISSION = "no-permission",
}

interface BarcodeDetector {
  detect(video: ImageBitmap): Promise<{ rawValue: string }[]>
}

/**
 * BarcodeScanner is a custom web component that allows users to scan barcodes using their device's camera.
 * It uses the BarcodeDetector API to detect barcodes in real-time and dispatches custom events with the detected barcode data.
 * The component provides a user interface with an overlay that guides the user to scan a barcode and displays the detected barcode value.
 * @fires barcode-scanner-state - Indicates the state of the barcode scanner.
 * @slot message-before-scanning - The message to display before scanning.
 */
@customElement("barcode-scanner")
@localized()
export class BarcodeScanner extends ConsoleLogMixin(LitElement) {
  /**
   * Static styles for the BarcodeScanner component.
   * These styles define the appearance of the component, including the video element, overlay, and buttons.
   */
  static override styles = [
    BASE,
    getButtonClasses([ButtonType.White]),
    css`
      :host {
        width: 100%;
      }
      .barcode-scanner {
        display: block;
        position: relative;
        width: 100%;
      }
      .barcode-scanner video {
        display: block;
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

  /**
   * The style information for the wrapper element of the BarcodeScanner component.
   * This property is reflected as an attribute on the component and can be used to customize the size and appearance of the component.
   */
  @property({ type: Object, attribute: "wrapper-style", reflect: true })
  wrapperStyle: StyleInfo = {
    height: "300px",
    width: "100%",
    "max-width": "100%",
  }

  /**
   * A boolean property that indicates whether the barcode scanner should be running.
   * When set to true, the component will attempt to start the camera and detect barcodes.
   */
  @property({ type: Boolean, attribute: "run-scanner", reflect: true })
  runScanner = false

  /**
   * The barcode detected by the scanner
   */
  /**
   * The barcode detected by the scanner.
   * This state property is updated whenever a barcode is successfully detected.
   */
  @state()
  barcode = ""

  /**
   * A reference to the video element used for displaying the camera feed.
   * This query selector is used to access the video element within the component's template.
   */
  @query("video")
  private video!: HTMLVideoElement

  /**
   * The media stream used for the camera feed.
   * This state property is updated when the camera is started and cleared when the camera is stopped.
   */
  @state()
  private stream: MediaStream | null = null

  /**
   * The BarcodeDetector instance used for detecting barcodes.
   * This state property is initialized when the component is constructed and used for barcode detection.
   */
  @state()
  private codeReader: BarcodeDetector | null = null

  /**
   * A function that detects barcodes in an image bitmap.
   * This state property is updated when the BarcodeDetector is available and used for barcode detection.
   */
  @state()
  private detectFn?: (imageData: ImageBitmap) => Promise<string | undefined>

  /**
   * A getter that returns whether the video is currently playing.
   * This getter is used to determine the state of the video element and update the component's UI accordingly.
   */
  get isVideoPlaying() {
    return this.stream !== null
  }

  get canDetect() {
    return this.detectFn !== undefined
  }

  /**
   * The constructor for the BarcodeScanner component.
   * This constructor initializes the BarcodeDetector and sets up the component's state.
   */
  constructor() {
    super()
    this.setupBarcodeDetector()
  }

  /**
   * This lifecycle method is used to start the barcode scanner if the runScanner property is set to true.
   */
  override async firstUpdated() {
    if (this.runScanner) {
      await this.askPermission()
    }
  }

  /**
   * A lifecycle method that is called when an attribute on the component is changed.
   * This method is used to handle changes to the run-scanner attribute and start or stop the barcode scanner accordingly.
   */
  override attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, _old, value)
    // if first update not run yet, do nothing
    if (!this.hasUpdated) {
      return
    }
    if (name === "run-scanner") {
      if (this.runScanner) {
        this.askPermission()
      } else if (this.stream) {
        this.stopVideo()
      }
    }
  }

  /**
   * A private method that sets up the BarcodeDetector instance.
   * This method is called when the component is constructed and initializes the BarcodeDetector and detectFn properties.
   */
  private setupBarcodeDetector() {
    try {
      // Remove the type assertion for BarcodeDetector to avoid TypeScript error
      // @ts-ignore
      this.codeReader = new BarcodeDetector({ formats: ["ean_13", "ean_8"] })
      this.detectFn = this.detectWithBarcodeDetector
      this.sendBarcodeStateEvent({ state: BarcodeScannerState.DETECTOR_AVAILABLE })
    } catch (error) {
      this.sendBarcodeStateEvent({ state: BarcodeScannerState.DETECTOR_NOT_AVAILABLE })
      console.warn("BarcodeDetector not available:", error)
    }
  }

  /**
   * A private method that detects barcodes in an image bitmap using the BarcodeDetector.
   * This method is called when a video frame is captured and used to detect barcodes in the frame.
   */
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

  /**
   * A private method that asks for camera permission and starts the barcode scanner if permission is granted.
   * This method is called when the user clicks the start scanning button or when the runScanner property is set to true.
   */
  private async askPermission() {
    // If it can't detect, don't ask for permission
    if (!this.canDetect) {
      this.sendBarcodeStateEvent({
        state: BarcodeScannerState.DETECTOR_NOT_AVAILABLE,
      })
      return
    }
    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" })

      if (["granted", "prompt"].includes(permissionStatus.state)) {
        await this.startCamera()
        return
      } else {
        console.warn("Camera permission denied. Please enable it in your browser settings.")
      }
    } catch (error) {
      console.error("Permission query error:", error)
    }
    this.sendBarcodeStateEvent({
      barcode: this.barcode,
      state: BarcodeScannerState.NO_PERMISSION,
    })
  }

  /**
   * A private method that starts the camera and sets up the video element.
   * This method is called when camera permission is granted and used to start the camera feed.
   */
  private async startCamera() {
    try {
      // Request the camera stream with specified constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
      })

      // Set the video source to the camera stream and play the video
      if (this.video) {
        this.video.srcObject = this.stream
        await this.video.play()
        this.sendBarcodeStateEvent({
          state: BarcodeScannerState.STARTED,
        })

        // Set up video frame capture
        this.setupFrameCapture()
      }
    } catch (err) {
      console.error("Error accessing camera: ", err)
    }
  }

  /**
   * A private method that stops the video and clears the media stream.
   * This method is called when the barcode scanner is stopped or when the component is disconnected.
   */
  private stopVideo() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      // clean video
      this.video.srcObject = null
      this.stream = null
    }
  }

  /**
   * A private method that sends a custom event with the barcode scanner's state.
   * This method is called whenever the barcode scanner's state changes and used to notify other components of the state change.
   */
  private sendBarcodeStateEvent(detail: { barcode?: string; state: BarcodeScannerState }) {
    this.dispatchEvent(new CustomEvent(EventType.BARCODE_SCANNER_STATE, { detail }))
  }

  /**
   * A private method that handles the exit button click event.
   * This method is called when the user clicks the exit button and used to stop the barcode scanner and clear the video element.
   */
  private exit(event: Event) {
    event.stopPropagation()
    this.stopVideo()
    this.sendBarcodeStateEvent({
      state: BarcodeScannerState.EXITED,
    })
  }

  /**
   * A private method that sets up the video frame capture for barcode detection.
   * This method is called when the camera is started and used to capture video frames and detect barcodes in the frames.
   */
  private setupFrameCapture() {
    const video = this.video
    // Process video frames for barcode detection
    const processFrame = async () => {
      // Check if the video is paused or ended
      if (video.paused || video.ended) {
        requestAnimationFrame(processFrame)
        return
      }

      let imageBitmap: ImageBitmap | undefined
      try {
        // Create an image bitmap from the current video frame
        imageBitmap = await createImageBitmap(video, 0, 0, video.videoWidth, video.videoHeight)
      } catch (e) {
        this.logToConsole("image-bitmap", `Error creating image bitmap: ${e}`)
      }

      if (imageBitmap) {
        try {
          // Detect barcodes in the image bitmap
          const result = await this.detectFn!(imageBitmap)
          if (result) {
            this.barcode = result
            this.sendBarcodeStateEvent({
              barcode: this.barcode,
              state: BarcodeScannerState.DETECTED,
            })

            // Stop the video after detecting a barcode
            this.stopVideo()
            return
          }
        } catch (error) {
          console.error("Barcode detection error:", error)
        }
      }

      // Continue processing frames if no barcode is detected
      requestAnimationFrame(processFrame)
    }

    requestAnimationFrame(processFrame)
  }

  /**
   * A lifecycle method that is called when the component is disconnected from the DOM.
   * This method is used to stop the barcode scanner and clear the video element when the component is removed from the DOM.
   */
  override disconnectedCallback() {
    super.disconnectedCallback()
    this.stopVideo()
  }

  /**
   * A private method that renders the overlay for the barcode scanner.
   * This method is called whenever the component's UI needs to be updated and used to render the overlay based on the component's state.
   */
  private renderOverlay() {
    if (!this.canDetect) {
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
              <slot name="message-before-scanning">
                ${msg(
                  "Click to scan a barcode and find out its details (health, preferences, etc.)"
                )}
              </slot>
            </div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * A lifecycle method that renders the component's template.
   * This method is called whenever the component's UI needs to be updated and used to render the component's template based on its state.
   */
  override render() {
    return html`
      <div class="barcode-scanner" style=${styleMap(this.wrapperStyle)}>
        <video width="100%"></video>
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
