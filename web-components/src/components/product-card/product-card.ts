import { LitElement, html, css, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"
import { localized, msg, str } from "@lit/localize"
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

interface PersonalScore {
  score: number
  matchStatus:
    | "very_good_match"
    | "good_match"
    | "poor_match"
    | "does_not_match"
    | "may_not_match"
    | "unknown_match"
  totalWeights: number
  totalWeightedScore: number
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
@localized()
export class ProductCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
    }

    .card-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      max-width: 100%;
      border-radius: 1rem;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      position: relative;
      background-color: white;
      overflow: hidden;
    }

    .card-content {
      display: flex;
      flex: 1;
      border-radius: 1rem;
      height: 100%;
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
      object-fit: cover;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
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
      height: 100%;
      width: 100%;
      border-radius: 0.5rem;
      background-color: transparent;
      object-fit: cover;
      opacity: 0.7;
      overflow: hidden;
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
      padding-top: 1rem;
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

    .match-tag {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      color: white;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      z-index: 10;
      width: 100%;
      box-sizing: border-box;
    }

    /* Match score color variants */
    .match-tag-very-good-match {
      background-color: #10b981; /* Dark green */
    }

    .match-tag-good-match {
      background-color: #34d399; /* Light green */
    }

    .match-tag-poor-match {
      background-color: #f59e0b; /* Yellow/Orange */
    }

    .match-tag-does-not-match {
      background-color: #ef4444; /* Red */
    }

    .match-tag-may-not-match {
      background-color: #f97316; /* Orange */
    }

    .match-tag-unknown-match {
      background-color: #6b7280; /* Gray */
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
   * The personal score object containing match scoring information
   */
  @property({ type: Object })
  personalScore: PersonalScore | undefined = undefined

  /**
   * Whether to show the match score tag on the product card
   */
  @property({ type: Boolean })
  showMatchTag: boolean = false

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

  /**
   * Gets match tag information based on personalScore from product
   */
  private getMatchTagInfo(): { text: string; cssClass: string } {
    if (this.personalScore) {
      const { score, matchStatus } = this.personalScore
      switch (matchStatus) {
        case "very_good_match":
          return {
            text: msg(str`Very Good Match ${score}%`),
            cssClass: "match-tag-very-good-match",
          }
        case "good_match":
          return {
            text: msg(str`Good Match ${score}%`),
            cssClass: "match-tag-good-match",
          }
        case "poor_match":
          return {
            text: msg(str`Poor Match ${score}%`),
            cssClass: "match-tag-poor-match",
          }
        case "does_not_match":
          return {
            text: msg("Does Not Match"),
            cssClass: "match-tag-does-not-match",
          }
        case "may_not_match":
          return {
            text: msg("May Not Match"),
            cssClass: "match-tag-may-not-match",
          }
        case "unknown_match":
          return {
            text: msg("Unknown Match"),
            cssClass: "match-tag-unknown-match",
          }
        default:
          return {
            text: msg("Unknown Match"),
            cssClass: "match-tag-unknown-match",
          }
      }
    }

    // Return default if no personalScore available
    return {
      text: msg("No Score Available"),
      cssClass: "match-tag-unknown-match",
    }
  }

  override render() {
    const isNavigatingToProduct = this.navigating.to?.params?.barcode === this.product.code
    const hasProductImage = Boolean(this.product.image_front_small_url)
    const matchTagInfo = this.getMatchTagInfo()
    const cardClasses = {
      "card-container": true,
      "dark-mode": this.isDarkMode,
    }

    return html`
      <div class=${classMap(cardClasses)}>
        ${this.showMatchTag
          ? html`<div class="match-tag ${matchTagInfo.cssClass}">${matchTagInfo.text}</div>`
          : nothing}
        <div class="card-content">
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
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "product-card": ProductCard
  }
}
