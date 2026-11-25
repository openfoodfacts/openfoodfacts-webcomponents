import { STATIC_HOST } from "../../constants"
import type { FooterBrand, FooterLink, FooterLinkGroup, FooterSocialLink } from "./footer-types"

export const DEFAULT_FOOTER_BASE_URL = "https://world.openfoodfacts.org/"

export const DEFAULT_FOOTER_BRAND: FooterBrand = {
  name: "Open Food Facts",
  logo: `${STATIC_HOST}/images/logos/off-logo-horizontal-mono-white.svg`,
  description: "A collaborative, free and open database of food products from around the world.",
}

export const DEFAULT_FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    label: "Join the community",
    layout: "community",
    links: [
      {
        label: "Code of conduct",
        href: "/code-of-conduct",
        message: "code-of-conduct",
      },
      {
        label: "Slack",
        href: "https://slack.openfoodfacts.org",
        message: "slack",
      },
      {
        label: "Forum",
        href: "https://forum.openfoodfacts.org/",
      },
      {
        label: "Subscribe to our newsletter",
        href: "https://link.openfoodfacts.org/newsletter-en",
      },
    ],
  },
  {
    label: "Discover the project",
    layout: "buttons",
    links: [
      { label: "Who we are", href: "/who-we-are" },
      {
        label: "Vision, Mission, Values and Programs",
        href: "/open-food-facts-vision-mission-values-and-programs",
      },
      { label: "Frequently asked questions", href: "/faq" },
      { label: "Open Food Facts blog", href: "https://blog.openfoodfacts.org/en/" },
      { label: "Press", href: "/press" },
      { label: "Open Food Facts wiki (en)", href: "https://wiki.openfoodfacts.org" },
      { label: "Translators", href: "/cgi/top_translators.pl" },
      { label: "Partners", href: "/partners" },
      { label: "Data, API and SDKs", href: "/data" },
      { label: "Open Beauty Facts - Cosmetics", href: "https://world.openbeautyfacts.org" },
      { label: "Open Products Facts", href: "https://world.openproductsfacts.org" },
      { label: "Open Pet Food Facts", href: "https://world.openpetfoodfacts.org" },
      { label: "Open Prices", href: "https://prices.openfoodfacts.org/" },
      { label: "Open Food Facts for Producers", href: "https://world.pro.openfoodfacts.org/" },
    ],
  },
]

export const DEFAULT_FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  {
    label: "X formerly Twitter",
    href: "https://x.com/OpenFoodFacts",
    icon: `${STATIC_HOST}/images/icons/dist/x.svg`,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/OpenFoodFacts?utm_source=off&utm_medium=web",
    icon: `${STATIC_HOST}/images/icons/dist/facebook.svg`,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/open.food.facts/",
    icon: `${STATIC_HOST}/images/icons/dist/instagram.svg`,
  },
]

export const DEFAULT_FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: "Legal", href: "/legal" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms of use", href: "/terms-of-use" },
  { label: "Donate to Open Food Facts", href: "/donate-to-open-food-facts", type: "donation" },
  { label: "Producers", href: "https://world.pro.openfoodfacts.org/" },
  { label: "Subscribe to our newsletter", href: "https://link.openfoodfacts.org/newsletter-en" },
]
