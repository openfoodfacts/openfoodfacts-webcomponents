import { css, html, LitElement, svg } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import { SignalWatcher } from "@lit-labs/signals"
import { languageCode } from "../../signals/app"
import { Breakpoints } from "../../utils/breakpoints"
import { darkModeListener } from "../../utils/dark-mode-listener"
import type { TemplateResult } from "lit"




/**
 * @element community-links
 */
@customElement("community-links")
export class CommunityLinks extends SignalWatcher(LitElement) {
  @property({ type: String })
  theme?: "light" | "dark"

  @state()
  private systemIsDark = darkModeListener.darkMode

  private darkModeCallback = (isDark: boolean) => {
    this.systemIsDark = isDark
  }

  override connectedCallback() {
    super.connectedCallback()
    darkModeListener.subscribe(this.darkModeCallback)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    darkModeListener.unsubscribe(this.darkModeCallback)
  }

  static override styles = css`
    :host {
      display: block;
      font-family: inherit;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      border-radius: 8px;
      max-width: 600px;
      margin: 0 auto;
      transition: background-color 0.3s ease;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .icons-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .icon-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      background-color: transparent;
      border: 1px solid transparent;
    }

    .icon-link:hover,
    .icon-link:focus-visible {
      transform: scale(1.1);
      opacity: 0.8;
      outline: none;
    }

    .icon-link:focus-visible {
      border-color: currentColor;
    }

    .icon-link svg, .icon-link > * {
      width: 24px;
      height: 24px;
    }

    .main-link {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      transition: all 0.2s ease;
    }

    .main-link:hover {
      text-decoration: underline;
      opacity: 0.9;
    }

    /* Light Theme */
    .theme-light {
      background-color: #f9fafb;
      color: #1f2937;
    }
    
    .theme-light .icon-link {
      background-color: #f3f4f6;
      color: #374151;
    }

    .theme-light .icon-link:hover {
      background-color: #e5e7eb;
      color: #111827;
    }

    .theme-light .main-link {
      background-color: #111827;
      color: #ffffff;
    }

    /* Dark Theme */
    .theme-dark {
      background-color: #1f2937;
      color: #f9fafb;
    }

    .theme-dark .icon-link {
      background-color: #374151;
      color: #d1d5db;
    }

    .theme-dark .icon-link:hover {
      background-color: #4b5563;
      color: #ffffff;
    }

    .theme-dark .main-link {
      background-color: #f9fafb;
      color: #111827;
    }

    @media (min-width: ${Breakpoints.SM}px) {
      .icons-grid {
        gap: 1.5rem;
      }
    }
  `

  override render() {
    const lang = languageCode.get() || "world"
    const followUrl = `https://${lang}.openfoodfacts.org/follow-open-food-facts`
    const isDarkMode = this.theme ? this.theme === "dark" : this.systemIsDark

    return html`
      <div class="container ${isDarkMode ? "theme-dark" : "theme-light"}">
        <div class="title">Stay Connected</div>
        
        <div class="icons-grid">
          ${platforms.map(
            (platform) => html`
              <a
                href="${platform.url}"
                class="icon-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="${platform.ariaLabel}"
                title="${platform.name}"
              >
                ${platform.inlineSvg
                  ? platform.inlineSvg
                  : html`<img src="${platform.imageUrl}" alt="${platform.name}" width="24" height="24" style="border-radius: 50%; object-fit: contain;" />`}
              </a>
            `
          )}
        </div>

        <a 
          href="${followUrl}" 
          class="main-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow Open Food Facts →
        </a>
      </div>
    `
  }
}
