import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { localized, msg } from "@lit/localize"

import { BASE } from "../../styles/base"
import { ButtonType, getButtonClasses } from "../../styles/buttons"
import { SAFE_CAPPUCINO } from "../../utils/colors"
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
 * @cssprop --off-footer-bg - App section background color.
 * @cssprop --off-footer-text-color - App section text color.
 * @cssprop --off-footer-link-color - Footer link color; defaults to its inherited text color.
 * @cssprop --off-footer-link-hover-color - Footer link hover color.
 * @cssprop --off-footer-border-color - Project link border color.
 * @cssprop --off-footer-project-link-hover-border-color - Project link hover border color.
 * @cssprop --off-footer-accent-color - Community section accent/background color.
 * @cssprop --off-footer-community-bg - Community section background color.
 * @cssprop --off-footer-community-text-color - Community section text color.
 * @cssprop --off-footer-project-link-bg - Project link background color.
 * @cssprop --off-footer-project-link-text-color - Project link text color.
 * @cssprop --off-footer-project-link-hover-bg - Project link hover background color.
 * @cssprop --off-footer-project-link-hover-text-color - Project link hover text color.
 * @cssprop --off-footer-bottom-bg - Bottom section background color.
 * @cssprop --off-footer-bottom-text-color - Bottom section text color.
 * @cssprop --off-footer-app-padding - App section padding.
 * @cssprop --off-footer-container-padding - Desktop container inline padding.
 * @cssprop --off-footer-container-padding-mobile - Narrow container inline padding.
 * @cssprop --off-footer-community-padding - Desktop community section padding.
 * @cssprop --off-footer-community-padding-mobile - Narrow community section padding.
 * @cssprop --off-footer-community-gap - Desktop community grid gap.
 * @cssprop --off-footer-community-gap-mobile - Narrow community grid gap.
 * @cssprop --off-footer-bottom-padding - Desktop bottom section padding.
 * @cssprop --off-footer-bottom-padding-mobile - Narrow bottom section padding.
 * @cssprop --off-footer-project-link-gap - Desktop project link gap.
 * @cssprop --off-footer-project-link-gap-mobile - Narrow project link gap.
 * @cssprop --off-footer-legal-link-gap - Desktop legal link gap.
 * @cssprop --off-footer-legal-link-gap-mobile - Narrow legal link gap.
 * @cssprop --off-footer-social-link-gap - Social link gap.
 * @cssprop --off-footer-project-link-radius - Project link corner radius.
 * @cssprop --off-footer-brand-logo-margin - Footer logo margin.
 * @cssprop --off-footer-brand-description-margin-bottom - Brand description bottom margin.
 * @csspart container - Content containers in the link and bottom sections.
 * @csspart brand - Brand logo and description region.
 * @csspart links - Link group region.
 * @csspart social - Social links region.
 * @csspart legal - Legal links region.
 * @csspart bottom - Bottom footer region.
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
        --off-footer-bg: #fff;
        --off-footer-text-color: #000;
        --off-footer-link-color: currentColor;
        --off-footer-link-hover-color: currentColor;
        --off-footer-border-color: #fff;
        --off-footer-project-link-hover-border-color: #000;
        --off-footer-accent-color: ${SAFE_CAPPUCINO};
        --off-footer-community-bg: var(--off-footer-accent-color, ${SAFE_CAPPUCINO});
        --off-footer-community-text-color: var(--off-footer-text-color, #000);
        --off-footer-project-link-bg: #fff;
        --off-footer-project-link-text-color: #000;
        --off-footer-project-link-hover-bg: #000;
        --off-footer-project-link-hover-text-color: #fff;
        --off-footer-bottom-bg: #201a17;
        --off-footer-bottom-text-color: #fff;
        --off-footer-app-padding: 16px 24px;
        --off-footer-container-padding: 24px;
        --off-footer-container-padding-mobile: 16px;
        --off-footer-community-padding: 32px 0 64px;
        --off-footer-community-padding-mobile: 24px 0;
        --off-footer-community-gap: 2rem;
        --off-footer-community-gap-mobile: 24px;
        --off-footer-bottom-padding: 24px 0 32px;
        --off-footer-bottom-padding-mobile: 24px 0;
        --off-footer-project-link-gap: 12px;
        --off-footer-project-link-gap-mobile: 8px;
        --off-footer-legal-link-gap: 12px;
        --off-footer-legal-link-gap-mobile: 10px;
        --off-footer-social-link-gap: 0.4rem;
        --off-footer-project-link-radius: 8px;
        --off-footer-brand-logo-margin: 8px;
        --off-footer-brand-description-margin-bottom: 20px;
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
        padding: 0 var(--off-footer-container-padding, 24px);
        box-sizing: border-box;
      }

      /* App promotion section */

      .app-section {
        background-color: var(--off-footer-bg, #fff);
        color: var(--off-footer-text-color, #000);
        padding: var(--off-footer-app-padding, 16px 24px);
      }

      .app-section mobile-badges {
        max-width: 1280px;
        margin: 0 auto;
      }

      /* Community and project section */

      .community-section {
        background-color: var(--off-footer-community-bg, ${SAFE_CAPPUCINO});
        color: var(--off-footer-community-text-color, #000);
        padding: var(--off-footer-community-padding, 32px 0 64px);
      }

      .community-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--off-footer-community-gap, 2rem);
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
        color: var(--off-footer-link-color, inherit);
      }

      a:hover {
        color: var(--off-footer-link-hover-color, inherit);
      }

      a:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 4px;
      }

      .social-links {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--off-footer-social-link-gap, 0.4rem);
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
        gap: var(--off-footer-project-link-gap, 12px);
        list-style: none;
        padding: 0;
        margin: 16px 0 0;
      }

      .project-links .button {
        display: inline-block;
        border-radius: var(--off-footer-project-link-radius, 8px);
        padding: 7px 10.5px;
        font-size: 13px;
        font-weight: 400;
        line-height: normal;
        text-decoration: none;
        margin: 0;
        background-color: var(--off-footer-project-link-bg, #fff);
        border-color: var(--off-footer-border-color, #fff);
        color: var(--off-footer-project-link-text-color, #000);
      }

      .project-links .button:hover {
        background-color: var(--off-footer-project-link-hover-bg, #000);
        border-color: var(--off-footer-project-link-hover-border-color, #000);
        color: var(--off-footer-project-link-hover-text-color, #fff);
      }

      /* Bottom footer section */

      .bottom-section {
        background-color: var(--off-footer-bottom-bg, #201a17);
        background-image:
          url("https://static.openfoodfacts.org/images/illustrations/footer-planet.svg"),
          url("https://static.openfoodfacts.org/images/illustrations/footer-orange.svg");
        background-position:
          left top,
          right bottom;
        background-repeat: no-repeat, no-repeat;
        background-size: auto, auto;
        color: var(--off-footer-bottom-text-color, #fff);
        text-align: center;
        padding: var(--off-footer-bottom-padding, 24px 0 32px);
      }

      .footer-logo {
        height: 48px;
        width: auto;
        max-width: 100%;
        object-fit: contain;
        margin: var(--off-footer-brand-logo-margin, 8px);
      }

      .footer-description {
        margin: 0 0 var(--off-footer-brand-description-margin-bottom, 20px);
        font-size: 14px;
        line-height: 1.6;
      }

      .legal-links {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: var(--off-footer-legal-link-gap, 12px);
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 10.5px;
        line-height: 1.6;
      }

      @media (prefers-color-scheme: dark) {
        :host {
          --off-footer-bg: #201a17;
          --off-footer-text-color: #f9f7f5;
          --off-footer-accent-color: #302824;
          --off-footer-community-bg: var(--off-footer-accent-color, #302824);
          --off-footer-community-text-color: #f9f7f5;
          --off-footer-border-color: #493d37;
          --off-footer-project-link-hover-border-color: #000;
          --off-footer-project-link-bg: #493d37;
          --off-footer-project-link-text-color: #f9f7f5;
          --off-footer-project-link-hover-bg: #5c4d45;
          --off-footer-project-link-hover-text-color: #f9f7f5;
        }

        .social-icon {
          filter: brightness(0) invert(1);
        }
      }

      @media (max-width: 1023px) {
        .container {
          padding: 0 var(--off-footer-container-padding-mobile, 16px);
        }

        .community-grid {
          grid-template-columns: 1fr;
          gap: var(--off-footer-community-gap-mobile, 24px);
        }

        .community-section {
          padding: var(--off-footer-community-padding-mobile, 24px 0);
        }

        .bottom-section {
          padding: var(--off-footer-bottom-padding-mobile, 24px 0);
        }

        .project-links {
          gap: var(--off-footer-project-link-gap-mobile, 8px);
        }

        .legal-links {
          gap: var(--off-footer-legal-link-gap-mobile, 10px);
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
      <slot name="social" part="social">
        <p class="social-links" part="social">
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
        <section aria-labelledby=${headingId} part="links">
          <h3 id=${headingId}>${heading}</h3>
          ${content}
        </section>
      `
    }

    return html`
      <section aria-labelledby=${headingId} part="links">
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
        <div class="container community-grid" part="container">
          <slot name="links" part="links">
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
      <slot name="brand" part="brand">
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
      <slot name="legal" part="legal">
        <ul class="legal-links" part="legal">
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
      <div class="bottom-section" id="footer_block" part="bottom">
        <div class="container" part="container">
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
