import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"

import { BASE } from "../../styles/base"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import {
  DEFAULT_FOOTER_BASE_URL,
  DEFAULT_FOOTER_BRAND,
  DEFAULT_FOOTER_LEGAL_LINKS,
  DEFAULT_FOOTER_LINK_GROUPS,
  DEFAULT_FOOTER_SOCIAL_LINKS,
} from "./footer-defaults"
import type { FooterBrand, FooterLink, FooterLinkGroup, FooterSocialLink } from "./footer-types"
import {
  jsonAttributeConverter,
  sanitizeHref,
  trueByDefaultBooleanAttributeConverter,
} from "./footer-utils"

import "../mobile-badges/mobile-badges"

/**
 * Harmonized footer for Open Food Facts applications.
 * @element off-footer
 * @slot brand - Replaces the default footer logo and description.
 * @slot app-badges - Replaces the default mobile app badges.
 * @slot links - Replaces the default community and project links.
 * @slot social - Replaces the default social links.
 * @slot legal - Replaces the default legal links.
 * @slot bottom - Replaces all content in the bottom footer section.
 */
@customElement("off-footer")
@localized()
export class Footer extends LitElement {
  /**
   * Footer identity and logo.
   * @attr brand
   */
  @property({ attribute: "brand", converter: jsonAttributeConverter(DEFAULT_FOOTER_BRAND) })
  brand: FooterBrand = DEFAULT_FOOTER_BRAND

  /**
   * Base URL used to resolve relative footer links.
   * @attr base-url
   */
  @property({ type: String, attribute: "base-url" })
  baseUrl = DEFAULT_FOOTER_BASE_URL

  /**
   * Link groups displayed in the community and project section.
   * @attr link-groups
   */
  @property({
    attribute: "link-groups",
    converter: jsonAttributeConverter(DEFAULT_FOOTER_LINK_GROUPS),
  })
  linkGroups: FooterLinkGroup[] = DEFAULT_FOOTER_LINK_GROUPS

  /**
   * Social links displayed in the community section.
   * @attr social-links
   */
  @property({
    attribute: "social-links",
    converter: jsonAttributeConverter(DEFAULT_FOOTER_SOCIAL_LINKS),
  })
  socialLinks: FooterSocialLink[] = DEFAULT_FOOTER_SOCIAL_LINKS

  /**
   * Legal and donation links displayed at the bottom of the footer.
   * @attr legal-links
   */
  @property({
    attribute: "legal-links",
    converter: jsonAttributeConverter(DEFAULT_FOOTER_LEGAL_LINKS),
  })
  legalLinks: FooterLink[] = DEFAULT_FOOTER_LEGAL_LINKS

  /**
   * Whether the mobile app badges are displayed.
   * @attr show-app-badges
   */
  @property({
    attribute: "show-app-badges",
    converter: trueByDefaultBooleanAttributeConverter,
  })
  showAppBadges = true

  /**
   * Whether links marked with type "donation" are displayed.
   * @attr show-donation
   */
  @property({
    attribute: "show-donation",
    converter: trueByDefaultBooleanAttributeConverter,
  })
  showDonation = true

  /**
   * Whether the social links section is displayed.
   * @attr show-social
   */
  @property({
    attribute: "show-social",
    converter: trueByDefaultBooleanAttributeConverter,
  })
  showSocial = true

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

  private getSafeBaseUrl(): string {
    const safeBaseUrl = sanitizeHref(this.baseUrl)
    if (!safeBaseUrl || !["http:", "https:"].includes(new URL(safeBaseUrl).protocol)) {
      return DEFAULT_FOOTER_BASE_URL
    }
    return safeBaseUrl
  }

  private isExternalLink(href: string, explicitlyExternal = false): boolean {
    if (explicitlyExternal) {
      return true
    }

    try {
      const url = new URL(href)
      return (
        ["http:", "https:"].includes(url.protocol) &&
        url.origin !== new URL(this.getSafeBaseUrl()).origin
      )
    } catch {
      return false
    }
  }

  private renderAnchor(link: FooterLink, label: unknown) {
    const href = sanitizeHref(link.href, this.getSafeBaseUrl())
    if (!href) {
      return label
    }

    const external = this.isExternalLink(href, link.external)
    return html`
      <a
        href=${href}
        target=${external ? "_blank" : nothing}
        rel=${external ? "noopener noreferrer" : nothing}
      >
        ${label}
      </a>
    `
  }

  private renderLinkLabel(label: string, useDefaultTranslations: boolean): string {
    if (!useDefaultTranslations) {
      return label
    }

    switch (label) {
      case "Forum":
        return msg("Forum")
      case "Who we are":
        return msg("Who we are")
      case "Vision, Mission, Values and Programs":
        return msg("Vision, Mission, Values and Programs")
      case "Frequently asked questions":
        return msg("Frequently asked questions")
      case "Open Food Facts blog":
        return msg("Open Food Facts blog")
      case "Press":
        return msg("Press")
      case "Open Food Facts wiki (en)":
        return msg("Open Food Facts wiki (en)")
      case "Translators":
        return msg("Translators")
      case "Partners":
        return msg("Partners")
      case "Data, API and SDKs":
        return msg("Data, API and SDKs")
      case "Open Beauty Facts - Cosmetics":
        return msg("Open Beauty Facts - Cosmetics")
      case "Open Products Facts":
        return msg("Open Products Facts")
      case "Open Pet Food Facts":
        return msg("Open Pet Food Facts")
      case "Open Prices":
        return msg("Open Prices")
      case "Open Food Facts for Producers":
        return msg("Open Food Facts for Producers")
      case "Legal":
        return msg("Legal")
      case "Privacy":
        return msg("Privacy")
      case "Terms of use":
        return msg("Terms of use")
      case "Donate to Open Food Facts":
        return msg("Donate to Open Food Facts")
      case "Producers":
        return msg("Producers")
      case "Subscribe to our newsletter":
        return msg("Subscribe to our newsletter")
      case "X formerly Twitter":
        return msg("X formerly Twitter")
      case "Facebook":
        return msg("Facebook")
      case "Instagram":
        return msg("Instagram")
      default:
        return label
    }
  }

  private renderAppSection() {
    if (!this.showAppBadges) {
      return nothing
    }

    return html`
      <div class="app-section" id="install_the_app_block">
        <slot name="app-badges"><mobile-badges></mobile-badges></slot>
      </div>
    `
  }

  private renderSocialSection() {
    if (!this.showSocial) {
      return nothing
    }

    const useDefaultTranslations = this.socialLinks === DEFAULT_FOOTER_SOCIAL_LINKS
    return html`
      <slot name="social">
        <p class="social-links">
          ${msg("Follow us:")}
          ${this.socialLinks.map((link) => {
            const href = sanitizeHref(link.href, this.getSafeBaseUrl())
            const label = this.renderLinkLabel(link.label, useDefaultTranslations)
            const logo = sanitizeHref(link.icon, this.getSafeBaseUrl())
            const image = logo
              ? html` <img class="social-icon" src=${logo} alt=${label} loading="lazy" /> `
              : label

            if (!href) {
              return image
            }

            const external = this.isExternalLink(href, link.external)
            return html`
              <a
                href=${href}
                target=${external ? "_blank" : nothing}
                rel=${external ? "noopener noreferrer" : nothing}
              >
                ${image}
              </a>
            `
          })}
        </p>
      </slot>
    `
  }

  private renderCommunityLink(link: FooterLink, useDefaultTranslations: boolean) {
    const href = sanitizeHref(link.href, this.getSafeBaseUrl())
    const target = href && this.isExternalLink(href, link.external) ? "_blank" : ""
    const rel = target ? "noopener noreferrer" : ""

    if (link.message === "code-of-conduct" && href) {
      return html`
        <p>
          ${msg(
            html`Discover our
              <a href="${href}" target="${target}" rel="${rel}"> Code of conduct </a>`
          )}
        </p>
      `
    }

    if (link.message === "slack" && href) {
      return html`
        <p>${msg(html`Join us on <a href="${href}" target="${target}" rel="${rel}">Slack</a>`)}</p>
      `
    }

    return html`<p>
      ${this.renderAnchor(link, this.renderLinkLabel(link.label, useDefaultTranslations))}
    </p>`
  }

  private renderGroup(group: FooterLinkGroup, index: number, useDefaultTranslations: boolean) {
    const headingId =
      useDefaultTranslations && group.layout === "community"
        ? "community-heading"
        : useDefaultTranslations && group.layout === "buttons"
          ? "project-heading"
          : `footer-link-group-${index}`
    const heading =
      useDefaultTranslations && group.layout === "community"
        ? msg("Join the community")
        : useDefaultTranslations && group.layout === "buttons"
          ? msg("Discover the project")
          : group.label

    if (group.layout === "community") {
      const content = group.links.map(
        (link, linkIndex) => html`
          ${this.renderCommunityLink(link, useDefaultTranslations)}
          ${linkIndex === 2 ? this.renderSocialSection() : nothing}
        `
      )

      if (group.links.length < 3) {
        content.push(this.renderSocialSection())
      }

      return html`
        <section aria-labelledby=${headingId}>
          <h3 id=${headingId}>${heading}</h3>
          ${content}
        </section>
      `
    }

    return html`
      <section aria-labelledby=${headingId}>
        <h3 id=${headingId}>${heading}</h3>
        <ul class="project-links">
          ${group.links.map((link) => {
            const label = this.renderLinkLabel(link.label, useDefaultTranslations)
            const href = sanitizeHref(link.href, this.getSafeBaseUrl())
            const external = href && this.isExternalLink(href, link.external)
            return html`
              <li>
                ${
                  href
                    ? html`
                        <a
                          class="button small white-button"
                          href=${href}
                          target=${external ? "_blank" : nothing}
                          rel=${external ? "noopener noreferrer" : nothing}
                        >
                          ${label}
                        </a>
                      `
                    : html`<span class="button small white-button">${label}</span>`
                }
              </li>
            `
          })}
        </ul>
      </section>
    `
  }

  private renderLinkGroups() {
    const useDefaultTranslations = this.linkGroups === DEFAULT_FOOTER_LINK_GROUPS
    const hasCommunityGroup = this.linkGroups.some((group) => group.layout === "community")

    return html`
      <div class="community-section" id="contribute_and_discover_links_block">
        <div class="container community-grid">
          <slot name="links">
            ${this.linkGroups.map((group, index) =>
              this.renderGroup(group, index, useDefaultTranslations)
            )}
            ${this.showSocial && !hasCommunityGroup ? this.renderSocialSection() : nothing}
          </slot>
        </div>
      </div>
    `
  }

  private renderBrand() {
    const useDefaultTranslations = this.brand === DEFAULT_FOOTER_BRAND
    const brandName = useDefaultTranslations ? msg("Open Food Facts") : this.brand.name
    const description = useDefaultTranslations
      ? msg("A collaborative, free and open database of food products from around the world.")
      : this.brand.description
    const logo = sanitizeHref(this.brand.logo, this.getSafeBaseUrl())

    return html`
      <slot name="brand">
        ${this.renderAnchor(
          { label: brandName, href: this.getSafeBaseUrl() },
          logo
            ? html`<img class="footer-logo" src=${logo} alt=${brandName} loading="lazy" />`
            : brandName
        )}
        <p class="footer-description">${description}</p>
      </slot>
    `
  }

  private renderLegalLinks() {
    const useDefaultTranslations = this.legalLinks === DEFAULT_FOOTER_LEGAL_LINKS
    const links = this.legalLinks.filter((link) => this.showDonation || link.type !== "donation")

    return html`
      <slot name="legal">
        <ul class="legal-links">
          ${links.map(
            (link) =>
              html`<li>
                ${this.renderAnchor(link, this.renderLinkLabel(link.label, useDefaultTranslations))}
              </li>`
          )}
        </ul>
      </slot>
    `
  }

  private renderBottomSection() {
    return html`
      <div class="bottom-section" id="footer_block">
        <div class="container">
          <slot name="bottom"> ${this.renderBrand()} ${this.renderLegalLinks()} </slot>
        </div>
      </div>
    `
  }

  override render() {
    return html`
      <footer>
        ${this.renderAppSection()} ${this.renderLinkGroups()} ${this.renderBottomSection()}
      </footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "off-footer": Footer
  }
}
