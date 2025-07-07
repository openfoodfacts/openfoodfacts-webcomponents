import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"
import { KP_ATTRIBUTE_IMG } from "../../utils/openfoodfacts"
import { getImageUrl } from "../../signals/app"
import { darkModeListener } from "../../utils/dark-mode-listener"

interface NavigationState {
  to: {
    params: {
      barcode: string
    }
  } | null
}

interface Product {
  code: string
  product_name: string
  brands: string
  quantity: string
  image_front_small_url: string
  product_type: string
  nutriscore_grade?: string
  nova_group?: number
  greenscore_grade?: string // Assuming this is the name of the ecoscore attribute (need to confirm with actual data, when available)
}

/**
 * Product Card component to display a food product with its image and nutrition scores
 * @element product-card
 */
@customElement("product-card")
export class ProductCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
    }

    .card-container {
      display: flex;
      height: 10rem;
      width: 100%;
      max-width: 100%;
      border-radius: 1rem;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .dark-mode {
      background-color: #2d2724;
      color: #f9f7f5;
    }

    .image-container {
      height: 100%;
      width: 40%;
      text-align: center;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (min-width: 640px) {
      .image-container {
        width: 7rem;
      }
    }

    @media (min-width: 1024px) {
      .image-container {
        width: 9rem;
      }
    }

    .loading-container {
      display: flex;
      height: 100%;
      width: 100%;
      align-items: center;
      justify-content: center;
    }

    .loading-ring {
      display: inline-block;
      position: relative;
      width: 64px;
      height: 64px;
    }

    .loading-ring:after {
      content: " ";
      display: block;
      width: 46px;
      height: 46px;
      margin: 8px;
      border-radius: 50%;
      border: 5px solid currentColor;
      border-color: currentColor transparent currentColor transparent;
      animation: loading-ring 1.2s linear infinite;
    }

    @keyframes loading-ring {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .product-image {
      height: 100%;
      width: 100%;
      overflow: hidden;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
      object-fit: cover;
    }

    .placeholder-container {
      display: flex;
      height: 100%;
      width: 100%;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      color: black;
    }

    .placeholder-image {
      height: 4rem;
      border-radius: 0.5rem;
      background-color: transparent;
      object-fit: cover;
      opacity: 0.7;
    }

    .dark-mode .placeholder-image {
      filter: invert(1);
    }

    .content-container {
      display: flex;
      flex-direction: column;
      width: 60%;
      align-items: center;
      justify-content: space-evenly;
      padding: 0.5rem;
      padding-left: 0.75rem;
      font-weight: 600;
    }

    @media (min-width: 640px) {
      .content-container {
        width: 10rem;
      }
    }

    @media (min-width: 768px) {
      .content-container {
        width: 14rem;
      }
    }

    @media (min-width: 1024px) {
      .content-container {
        width: 13rem;
      }
    }

    .title {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 1.125rem;
      font-weight: 600;
    }

    @media (min-width: 640px) {
      .title {
        font-size: 1rem;
      }
    }

    .brand-quantity {
      display: flex;
      width: 100%;
      justify-content: flex-start;
    }

    .brand-quantity p {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.875rem;
      margin: 0;
    }

    .scores-container {
      display: flex;
      height: 3rem;
      width: 100%;
      flex-direction: row;
      margin-top: 0.5rem;
      align-items: stretch;
      justify-content: space-evenly;
      gap: 0.25rem;
    }

    .score-item {
      display: flex;
      align-items: center;
    }

    .score-image {
      height: 100%;
      max-height: 2.5rem;
    }

    @media (min-width: 640px) {
      .score-image {
        max-height: 2.5rem;
      }
    }
  `

  /**
   * The product object containing product details
   */
  @property({ type: Object })
  product: Product = {
    code: "",
    product_name: "",
    brands: "",
    quantity: "",
    image_front_small_url: "",
    product_type: "",
    nutriscore_grade: undefined,
    nova_group: undefined,
    greenscore_grade: undefined,
  }

  /**
   * Indicates if we're currently navigating to this product
   */
  @property({ type: Object })
  navigating: NavigationState = {
    to: null,
  }

  @state()
  nutriscoreSrc = ""

  @state()
  novaSrc = ""

  @state()
  greenscoreSrc = ""

  /**
   * Placeholder image URL for products without an image
   */
  @property({ type: String })
  placeholderImage = getImageUrl("Placeholder.svg")

  /**
   * Whether to apply dark mode styling (auto-detected from prefers-color-scheme)
   */
  isDarkMode = darkModeListener.darkMode
  private _darkModeCb = (isDark: boolean) => {
    this.isDarkMode = isDark
    this.requestUpdate()
  }

  override connectedCallback() {
    super.connectedCallback()
    darkModeListener.subscribe(this._darkModeCb)
  }

  override disconnectedCallback() {
    darkModeListener.unsubscribe(this._darkModeCb)
    super.disconnectedCallback()
  }

  /**
   * Updates score image URLs based on the product's nutrition grades, nova group, and greenscore
   */
  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties)
    this.nutriscoreSrc = KP_ATTRIBUTE_IMG(
      `nutriscore-${this.product.nutriscore_grade?.toLowerCase() || "unknown"}.svg`
    )
    this.novaSrc = KP_ATTRIBUTE_IMG(`nova-group-${this.product.nova_group || "unknown"}.svg`)
    this.greenscoreSrc = KP_ATTRIBUTE_IMG(
      `green-score-${this.product.greenscore_grade?.toLowerCase() || "unknown"}.svg`
    )
  }

  override render() {
    const isNavigatingToProduct = this.navigating.to?.params?.barcode === this.product.code
    const hasProductImage = Boolean(this.product.image_front_small_url)
    const cardClasses = {
      "card-container": true,
      "dark-mode": this.isDarkMode,
    }

    return html`
      <div class=${classMap(cardClasses)}>
        <div class="image-container">
          ${isNavigatingToProduct
            ? html`
                <div class="loading-container">
                  <span class="loading-ring"></span>
                </div>
              `
            : hasProductImage
              ? html`
                  <div class="loading-container">
                    <img
                      src=${this.product.image_front_small_url}
                      class="product-image"
                      alt="Product front"
                    />
                  </div>
                `
              : html`
                  <div class="placeholder-container">
                    <img
                      src=${this.placeholderImage}
                      class="placeholder-image"
                      alt="Product front"
                    />
                  </div>
                `}
        </div>
        <div class="content-container">
          <div
            class="title"
            title=${this.product.product_name ? this.product.product_name : this.product.code}
          >
            ${this.product.product_name ? this.product.product_name : this.product.code}
          </div>

          <div class="brand-quantity">
            <p title="${this.product.brands} - ${this.product.quantity}">
              ${this.product.brands} - ${this.product.quantity}
            </p>
          </div>

          ${this.product.product_type === "food"
            ? html`
                <div class="scores-container">
                  <div class="score-item">
                    <img src=${this.nutriscoreSrc} alt="nutriscore" class="score-image" />
                  </div>
                  <div class="score-item">
                    <img src=${this.novaSrc} alt="nova" class="score-image" />
                  </div>
                  <div class="score-item">
                    <img src=${this.greenscoreSrc} alt="greenscore" class="score-image" />
                  </div>
                </div>
              `
            : nothing}
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "product-card": ProductCard
  }
}
