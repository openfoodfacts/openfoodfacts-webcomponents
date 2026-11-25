import { LitElement, html, css } from "lit"
import { customElement } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"

import { BASE } from "../../styles/base"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { STATIC_HOST } from "../../constants"

import "../mobile-badges/mobile-badges"

const OFF_WEBSITE = "https://world.openfoodfacts.org"

/**
 * Harmonized footer for Open Food Facts applications.
 * @element off-footer
 */
@customElement("off-footer")
@localized()
export class Footer extends LitElement {
  static override styles = [
    BASE,
    ...getButtonClasses([ButtonType.White]),
    css`
      :host {
        display: block;
      }

      footer {
        width: 100%;
        line-height: 1.5;
      }

      .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1rem;
        box-sizing: border-box;
      }

      /* App promotion section */

      .app-section {
        background-color: #fff;
        padding: 1rem 0;
      }

      /* Community and project section */

      .community-section {
        background-color: #ebdfd8;
        color: #201a17;
        padding: 2rem 0 4rem;
      }

      .community-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 2rem;
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0 0 0.5rem;
      }

      p {
        margin: 0 0 0.6rem;
      }

      a {
        color: inherit;
      }

      a:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 4px;
      }

      .social-links {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .social-links a {
        display: inline-flex;
        align-items: center;
      }

      .social-icon {
        width: 22px;
        height: 22px;
        object-fit: contain;
      }

      .project-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;
      }

      .project-links .button {
        display: inline-block;
        border-radius: 0.5rem;
        padding: 0.35rem 0.6rem;
        font-size: 0.875rem;
        text-decoration: none;
      }

      /* Bottom footer section */

      .bottom-section {
        background-color: #201a17;
        color: #fff;
        text-align: center;
        padding: 1.5rem 0 2rem;
      }

      .footer-logo {
        height: 48px;
        max-width: 100%;
        object-fit: contain;
        margin: 8px;
      }

      .footer-description {
        margin: 0.5rem 0 1.5rem;
      }

      .legal-links {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.75rem;
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.75rem;
      }

      @media (max-width: 767px) {
        .community-grid {
          grid-template-columns: 1fr;
        }

        .community-section {
          padding: 1.5rem 0;
        }

        .bottom-section {
          padding: 1.5rem 0;
        }
      }
    `,
  ]

  private renderAppSection() {
    return html`
      <div class="app-section" id="install_the_app_block">
        <mobile-badges></mobile-badges>
      </div>
    `
  }

  private renderCommunityLinks() {
    return html`
      <section aria-labelledby="community-heading">
        <h3 id="community-heading">${msg("Join the community")}</h3>

        <p>
          ${msg(html`Discover our <a href="${OFF_WEBSITE}/code-of-conduct"> Code of conduct </a>`)}
        </p>

        <p>${msg(html`Join us on <a href="https://slack.openfoodfacts.org">Slack</a>`)}</p>

        <p>
          <a href="https://forum.openfoodfacts.org/"> ${msg("Forum")} </a>
        </p>

        <p class="social-links">
          ${msg("Follow us:")}

          <a href="https://x.com/OpenFoodFacts">
            <img
              class="social-icon"
              src="${STATIC_HOST}/images/icons/dist/x.svg"
              alt=${msg("X formerly Twitter")}
              loading="lazy"
            />
          </a>

          <a href="https://www.facebook.com/OpenFoodFacts?utm_source=off&amp;utm_medium=web">
            <img
              class="social-icon"
              src="${STATIC_HOST}/images/icons/dist/facebook.svg"
              alt="Facebook"
              loading="lazy"
            />
          </a>

          <a href="https://www.instagram.com/open.food.facts/">
            <img
              class="social-icon"
              src="${STATIC_HOST}/images/icons/dist/instagram.svg"
              alt="Instagram"
              loading="lazy"
            />
          </a>
        </p>

        <p>
          <a href="https://link.openfoodfacts.org/newsletter-en">
            ${msg("Subscribe to our newsletter")}
          </a>
        </p>
      </section>
    `
  }

  private renderProjectLinks() {
    const links = [
      {
        label: msg("Who we are"),
        href: `${OFF_WEBSITE}/who-we-are`,
      },
      {
        label: msg("Vision, Mission, Values and Programs"),
        href: `${OFF_WEBSITE}/open-food-facts-vision-mission-values-and-programs`,
      },
      {
        label: msg("Frequently asked questions"),
        href: `${OFF_WEBSITE}/faq`,
      },
      {
        label: msg("Open Food Facts blog"),
        href: "https://blog.openfoodfacts.org/en/",
      },
      {
        label: msg("Press"),
        href: `${OFF_WEBSITE}/press`,
      },
      {
        label: msg("Open Food Facts wiki (en)"),
        href: "https://wiki.openfoodfacts.org",
      },
      {
        label: msg("Translators"),
        href: `${OFF_WEBSITE}/cgi/top_translators.pl`,
      },
      {
        label: msg("Partners"),
        href: `${OFF_WEBSITE}/partners`,
      },
      {
        label: msg("Data, API and SDKs"),
        href: `${OFF_WEBSITE}/data`,
      },
      {
        label: msg("Open Beauty Facts - Cosmetics"),
        href: "https://world.openbeautyfacts.org",
      },
      {
        label: msg("Open Products Facts"),
        href: "https://world.openproductsfacts.org",
      },
      {
        label: msg("Open Pet Food Facts"),
        href: "https://world.openpetfoodfacts.org",
      },
      {
        label: msg("Open Prices"),
        href: "https://prices.openfoodfacts.org/",
      },
      {
        label: msg("Open Food Facts for Producers"),
        href: "https://world.pro.openfoodfacts.org/",
      },
    ]

    return html`
      <section aria-labelledby="project-heading">
        <h3 id="project-heading">${msg("Discover the project")}</h3>

        <ul class="project-links">
          ${links.map(
            (link) => html`
              <li>
                <a class="button small white-button" href=${link.href}> ${link.label} </a>
              </li>
            `
          )}
        </ul>
      </section>
    `
  }

  private renderCommunitySection() {
    return html`
      <div class="community-section" id="contribute_and_discover_links_block">
        <div class="container community-grid">
          ${this.renderCommunityLinks()} ${this.renderProjectLinks()}
        </div>
      </div>
    `
  }

  private renderBottomSection() {
    const links = [
      {
        label: msg("Legal"),
        href: `${OFF_WEBSITE}/legal`,
      },
      {
        label: msg("Privacy"),
        href: `${OFF_WEBSITE}/privacy`,
      },
      {
        label: msg("Terms of use"),
        href: `${OFF_WEBSITE}/terms-of-use`,
      },
      {
        label: msg("Donate to Open Food Facts"),
        href: `${OFF_WEBSITE}/donate-to-open-food-facts`,
      },
      {
        label: msg("Producers"),
        href: "https://world.pro.openfoodfacts.org/",
      },
      {
        label: msg("Subscribe to our newsletter"),
        href: "https://link.openfoodfacts.org/newsletter-en",
      },
    ]

    return html`
      <div class="bottom-section" id="footer_block">
        <div class="container">
          <a href="${OFF_WEBSITE}/">
            <img
              class="footer-logo"
              src="${STATIC_HOST}/images/logos/off-logo-horizontal-mono-white.svg"
              alt="Open Food Facts"
              loading="lazy"
            />
          </a>

          <p class="footer-description">
            ${msg(
              "A collaborative, free and open database of food products from around the world."
            )}
          </p>

          <ul class="legal-links">
            ${links.map(
              (link) => html`
                <li>
                  <a href=${link.href}>${link.label}</a>
                </li>
              `
            )}
          </ul>
        </div>
      </div>
    `
  }

  override render() {
    return html`
      <footer>
        ${this.renderAppSection()} ${this.renderCommunitySection()} ${this.renderBottomSection()}
      </footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "off-footer": Footer
  }
}
