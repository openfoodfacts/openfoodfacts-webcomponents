import { css, html, LitElement, svg } from "lit"
import { customElement, state, property } from "lit/decorators.js"
import { SignalWatcher } from "@lit-labs/signals"
import { languageCode } from "../../signals/app"
import { Breakpoints } from "../../utils/breakpoints"
import { darkModeListener } from "../../utils/dark-mode-listener"
import type { TemplateResult } from "lit"



interface SocialPlatform {
  name: string
  imageUrl?: string
  inlineSvg?: TemplateResult
  url: string
  ariaLabel: string
}

// Inline SVG icons for platforms that need crisp, reliable rendering
const newsletterIcon = svg`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <rect x="2" y="4" width="20" height="16" rx="2.5" fill="#c0392b"/>
    <path d="M2 7.5l10 6.5 10-6.5" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <rect x="2" y="4" width="20" height="16" rx="2.5" fill="none" stroke="#a93226" stroke-width="0.5"/>
  </svg>
`

const forumIcon = svg`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <!-- Discourse-style stacked speech bubbles -->
    <circle cx="9" cy="10" r="7" fill="#00aeef"/>
    <path d="M9 17c0 3.5-4 5-4 5s9.5-.5 11-5c.5-1.5 0-3-.5-4" fill="#0090c9"/>
    <circle cx="6.5" cy="10" r="1" fill="#fff"/>
    <circle cx="9.5" cy="10" r="1" fill="#fff"/>
    <circle cx="12.5" cy="10" r="1" fill="#fff"/>
  </svg>
`

const xTwitterIcon = svg`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <rect width="24" height="24" rx="4" fill="#000"/>
    <path d="M17.53 4h2.23L14.23 10.52 20.75 20h-5.37l-3.9-5.1L7.13 20H4.9l6.02-6.88L4 4h5.48l3.53 4.61L17.53 4zm-.78 14.4h1.23L7.36 5.27H6.03l10.72 13.13z" fill="#fff"/>
  </svg>
`

const platforms: SocialPlatform[] = [
  { name: "Newsletter", inlineSvg: newsletterIcon, url: "https://world.openfoodfacts.org/newsletter", ariaLabel: "Subscribe to our Newsletter" },
  { name: "Forum", inlineSvg: forumIcon, url: "https://forum.openfoodfacts.org", ariaLabel: "Visit the Open Food Facts Forum" },
  { name: "X", inlineSvg: xTwitterIcon, url: "https://x.com/OpenFoodFacts", ariaLabel: "Follow us on X (Twitter)" },
  { name: "Instagram", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png", url: "https://www.instagram.com/open.food.facts", ariaLabel: "Follow us on Instagram" },
  { name: "Facebook", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", url: "https://www.facebook.com/OpenFoodFacts", ariaLabel: "Follow us on Facebook" },
  { name: "GitHub", imageUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png", url: "https://github.com/openfoodfacts", ariaLabel: "Visit our GitHub" },
  { name: "Mastodon", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/48/Mastodon_Logotype_%28Simple%29.svg", url: "https://mastodon.social/@openfoodfacts", ariaLabel: "Follow us on Mastodon" },
  { name: "Bluesky", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Bluesky_Logo.svg", url: "https://bsky.app/profile/openfoodfacts.org", ariaLabel: "Follow us on Bluesky" },
  { name: "Slack", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg", url: "https://slack.openfoodfacts.org", ariaLabel: "Join our Slack" }
]

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
