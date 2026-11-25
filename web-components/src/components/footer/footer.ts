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
        font-family: "Public Sans", Helvetica, Roboto, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
      }

      .container {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 24px;
        box-sizing: border-box;
      }

      /* App promotion section */

      .app-section {
        background-color: #fff;
        padding: 16px 24px;
      }

      .app-section mobile-badges {
        max-width: 1280px;
        margin: 0 auto;
      }

      /* Community and project section */

      .community-section {
        background-color: #ede0db;
        color: #000;
        padding: 32px 0 64px;
      }

      .community-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 2rem;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        line-height: 1.4;
        margin: 2.8px 0 7px;
      }

      p {
        font-size: 14px;
        line-height: 1.6;
        margin: 0 0 7px;
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
        gap: 12px;
        list-style: none;
        padding: 0;
        margin: 16px 0 0;
      }

      .project-links .button {
        display: inline-block;
        border-radius: 8px;
        padding: 7px 10.5px;
        font-size: 13px;
        font-weight: 400;
        line-height: normal;
        text-decoration: none;
        margin: 0;
      }

      /* Bottom footer section */

      .bottom-section {
        background-color: #201a17;
        background-image:
          url("https://static.openfoodfacts.org/images/illustrations/footer-planet.svg"),
          url("https://static.openfoodfacts.org/images/illustrations/footer-orange.svg");
        background-position:
          left top,
          right bottom;
        background-repeat: no-repeat, no-repeat;
        background-size: auto, auto;
        color: #fff;
        text-align: center;
        padding: 24px 0 32px;
      }

      .footer-logo {
        height: 48px;
        width: auto;
        max-width: 100%;
        object-fit: contain;
        margin: 8px;
      }

      .footer-description {
        margin: 0 0 20px;
        font-size: 14px;
        line-height: 1.6;
      }

      .legal-links {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 10.5px;
        line-height: 1.6;
      }

      @media (prefers-color-scheme: dark) {
        .app-section {
          background-color: #201a17;
          color: #f9f7f5;
        }

        .community-section {
          background-color: #302824;
          color: #f9f7f5;
        }

        .project-links .button {
          background-color: #493d37;
          color: #f9f7f5;
        }

        .project-links .button:hover {
          background-color: #5c4d45;
        }

        .social-icon {
          filter: brightness(0) invert(1);
        }
      }

      @media (max-width: 1023px) {
        .container {
          padding: 0 16px;
        }

        .community-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .community-section {
          padding: 24px 0;
        }

        .bottom-section {
          padding: 24px 0;
        }

        .project-links {
          gap: 8px;
        }

        .legal-links {
          gap: 10px;
        }
      }

      @media (max-width: 767px) {
        .bottom-section {
          background-image: none;
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
