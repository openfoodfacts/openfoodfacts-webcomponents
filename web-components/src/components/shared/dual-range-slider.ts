import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"

/**
 * Dual Range Slider Component
 * @element dual-range-slider
 * A reusable component for selecting a range of values with two handles
 */
@customElement("dual-range-slider")
export class DualRangeSlider extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    /* Range slider container */
    .range-filter-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    }

    .range-inputs {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .range-input {
      width: 60px;
      padding: 0.25rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.75rem;
      text-align: center;
    }

    .range-input:focus {
      outline: none;
      border-color: #341100;
    }

    .range-separator {
      font-size: 0.75rem;
      color: #666;
    }

    /* Custom range slider styles */
    .range-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
      opacity: 0.7;
      transition: opacity 0.2s;
      -webkit-appearance: none;
      appearance: none;
      position: relative;
    }

    .range-slider:hover {
      opacity: 1;
    }

    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
    }

    .range-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      border: none;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
    }

    .range-slider-container {
      position: relative;
      margin: 0.25rem 0;
    }

    .range-slider-track {
      position: absolute;
      height: 6px;
      background: #341100;
      border-radius: 3px;
      top: 0;
    }

    .dual-range-container {
      position: relative;
      width: 100%;
    }

    .dual-range-slider {
      position: relative;
      height: 6px;
      background: #ddd;
      border-radius: 3px;
      margin: 0.5rem 0;
      width: 200px;
      min-width: 180px;
    }

    .dual-range-slider input[type="range"] {
      position: absolute;
      width: 100%;
      height: 6px;
      background: transparent;
      -webkit-appearance: none;
      appearance: none;
      pointer-events: none;
      outline: none;
    }

    .dual-range-slider input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      margin-top: -5px;
      margin-left: -2px;
      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      pointer-events: all;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
      border: none;
    }

    .dual-range-slider input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      margin-top: -5px;
      border-radius: 50%;
      background: #341100;
      cursor: pointer;
      pointer-events: all;
      box-shadow: 0px 0px 0px 3px rgba(52, 17, 0, 0.2);
      border: none;
    }

    .dual-range-slider input[type="range"]:first-child::-moz-range-thumb {
      margin-left: -8px;
    }

    .dual-range-slider input[type="range"]:last-child::-moz-range-thumb {
      margin-right: -8px;
    }

    .dual-range-track {
      position: absolute;
      height: 6px;
      background: #341100;
      border-radius: 3px;
      top: 0;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .range-filter-container {
        min-width: 180px;
      }

      .range-input {
        width: 50px;
        font-size: 0.7rem;
      }
    }
  `

  @property({ type: Number })
  min = 0

  @property({ type: Number })
  max = 100

  @property({ type: Number })
  minValue = 0

  @property({ type: Number })
  maxValue = 100

  @property({ type: String })
  type = "range"

  private handleMinInput(value: string) {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return

    // Ensure min doesn't go below absolute min or above current max
    let newMinValue = Math.max(this.min, numValue)
    newMinValue = Math.min(newMinValue, this.maxValue)

    this.dispatchEvent(
      new CustomEvent("range-change", {
        detail: {
          type: this.type,
          field: "min",
          value: newMinValue,
        },
      })
    )
  }

  private handleMaxInput(value: string) {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return

    // Ensure max doesn't go above absolute max or below current min
    let newMaxValue = Math.min(this.max, numValue)
    newMaxValue = Math.max(newMaxValue, this.minValue)

    this.dispatchEvent(
      new CustomEvent("range-change", {
        detail: {
          type: this.type,
          field: "max",
          value: newMaxValue,
        },
      })
    )
  }

  override render() {
    // If range is too small, show simple inputs instead
    if (this.max - this.min < 2) {
      return html`
        <div class="range-filter-container">
          <div class="range-inputs">
            <input
              type="number"
              class="range-input"
              .value="${this.minValue.toString()}"
              min="${this.min}"
              max="${this.maxValue}"
              @input="${(e: Event) => this.handleMinInput((e.target as HTMLInputElement).value)}"
            />
            <span class="range-separator">-</span>
            <input
              type="number"
              class="range-input"
              .value="${this.maxValue.toString()}"
              min="${this.minValue}"
              max="${this.max}"
              @input="${(e: Event) => this.handleMaxInput((e.target as HTMLInputElement).value)}"
            />
          </div>
        </div>
      `
    }

    const percent1 = ((this.minValue - this.min) / (this.max - this.min)) * 100
    const percent2 = ((this.maxValue - this.min) / (this.max - this.min)) * 100

    return html`
      <div class="range-filter-container">
        <div class="range-inputs">
          <input
            type="number"
            class="range-input"
            .value="${this.minValue.toString()}"
            min="${this.min}"
            max="${this.maxValue}"
            @input="${(e: Event) => this.handleMinInput((e.target as HTMLInputElement).value)}"
          />
          <span class="range-separator">-</span>
          <input
            type="number"
            class="range-input"
            .value="${this.maxValue.toString()}"
            min="${this.minValue}"
            max="${this.max}"
            @input="${(e: Event) => this.handleMaxInput((e.target as HTMLInputElement).value)}"
          />
        </div>
        <div class="dual-range-container">
          <div class="dual-range-slider">
            <div
              class="dual-range-track"
              style="left: ${percent1}%; width: ${percent2 - percent1}%"
            ></div>
            <input
              type="range"
              min="${this.min}"
              max="${this.max}"
              .value="${this.minValue.toString()}"
              @input="${(e: Event) => this.handleMinInput((e.target as HTMLInputElement).value)}"
            />
            <input
              type="range"
              min="${this.min}"
              max="${this.max}"
              .value="${this.maxValue.toString()}"
              @input="${(e: Event) => this.handleMaxInput((e.target as HTMLInputElement).value)}"
            />
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dual-range-slider": DualRangeSlider
  }
}
