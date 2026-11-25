import { beforeEach, describe, expect, it } from "vitest"
import { Footer } from "./footer"
import {
  DEFAULT_FOOTER_BRAND,
  DEFAULT_FOOTER_LEGAL_LINKS,
  DEFAULT_FOOTER_LINK_GROUPS,
  DEFAULT_FOOTER_SOCIAL_LINKS,
} from "./footer-defaults"

beforeEach(() => {
  document.body.innerHTML = ""
})

const createFooter = async (
  attributes?: Record<string, string>,
  slots?: Record<string, string>
) => {
  const element = document.createElement("off-footer") as Footer
  for (const [name, value] of Object.entries(attributes ?? {})) {
    element.setAttribute(name, value)
  }
  for (const [name, content] of Object.entries(slots ?? {})) {
    const slottedContent = document.createElement("span")
    slottedContent.slot = name
    slottedContent.textContent = content
    element.appendChild(slottedContent)
  }
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

describe("off-footer", () => {
  it("defines dark-mode styles", () => {
    const styles = Footer.styles.map((style) => style.cssText).join("\n")

    expect(styles).toContain("prefers-color-scheme: dark")
    for (const color of ["#201a17", "#f9f7f5", "#302824", "#493d37", "#5c4d45"]) {
      expect(styles).toContain(color)
    }
  })

  it("renders a semantic footer element", async () => {
    const element = await createFooter()

    expect(element.shadowRoot?.querySelector("footer")).not.toBeNull()
  })

  it("renders all three footer sections", async () => {
    const element = await createFooter()
    const root = element.shadowRoot

    expect(root?.querySelector("#install_the_app_block")).not.toBeNull()

    expect(root?.querySelector("#contribute_and_discover_links_block")).not.toBeNull()

    expect(root?.querySelector("#footer_block")).not.toBeNull()
  })

  it("reuses the existing mobile-badges component", async () => {
    const element = await createFooter()

    expect(element.shadowRoot?.querySelector("mobile-badges")).not.toBeNull()
  })

  it("renders all project links", async () => {
    const element = await createFooter()

    const links = element.shadowRoot?.querySelectorAll(".project-links a")

    expect(links?.length).toBe(14)
  })

  it("renders all legal links", async () => {
    const element = await createFooter()

    const links = element.shadowRoot?.querySelectorAll(".legal-links a")

    expect(links?.length).toBe(6)
  })

  it("uses absolute URLs for navigation links", async () => {
    const element = await createFooter()

    const links = element.shadowRoot?.querySelectorAll("a") ?? []

    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^https:\/\//)
    }
  })

  it("renders images with alternative text", async () => {
    const element = await createFooter()

    const images = element.shadowRoot?.querySelectorAll("img") ?? []

    expect(images.length).toBeGreaterThan(0)

    for (const image of images) {
      expect(image.alt.trim()).not.toBe("")
    }
  })

  it("uses the OFF defaults when no configuration is provided", async () => {
    const element = await createFooter()

    expect(element.linkGroups).toBe(DEFAULT_FOOTER_LINK_GROUPS)
    expect(element.shadowRoot?.querySelectorAll(".project-links a")).toHaveLength(14)
    expect(element.shadowRoot?.querySelectorAll(".legal-links a")).toHaveLength(6)
    expect(element.shadowRoot?.querySelector(".footer-logo")?.getAttribute("alt")).toBe(
      "Open Food Facts"
    )
  })

  it("renders configured link groups with consumer-provided labels", async () => {
    const element = document.createElement("off-footer") as Footer
    element.linkGroups = [
      {
        label: "My links",
        links: [{ label: "Custom link", href: "/custom" }],
      },
    ]
    document.body.appendChild(element)
    await element.updateComplete

    expect(element.shadowRoot?.textContent).toContain("My links")
    expect(element.shadowRoot?.querySelector(".project-links a")?.textContent).toContain(
      "Custom link"
    )
    expect(element.shadowRoot?.querySelector(".project-links a")?.getAttribute("href")).toBe(
      "https://world.openfoodfacts.org/custom"
    )
    expect(element.shadowRoot?.textContent).not.toContain("Who we are")
  })

  it("parses JSON attributes for brand and link collections", async () => {
    const element = await createFooter({
      brand: JSON.stringify({
        name: "Custom Facts",
        logo: "https://example.org/logo.svg",
        description: "Custom description",
      }),
      "link-groups": JSON.stringify([
        { label: "Custom group", links: [{ label: "Custom link", href: "/custom" }] },
      ]),
      "base-url": "https://custom.example.org/",
      "social-links": JSON.stringify([
        { label: "Custom social", href: "https://social.example.org", icon: "/social.svg" },
      ]),
      "legal-links": JSON.stringify([{ label: "Custom legal", href: "/legal" }]),
    })

    expect(element.brand.name).toBe("Custom Facts")
    expect(element.shadowRoot?.querySelector(".footer-logo")?.getAttribute("alt")).toBe(
      "Custom Facts"
    )
    expect(element.shadowRoot?.textContent).toContain("Custom group")
    expect(
      element.shadowRoot?.querySelector('a[href="https://custom.example.org/custom"]')
    ).not.toBeNull()
    expect(element.shadowRoot?.querySelector(".social-icon")?.getAttribute("alt")).toBe(
      "Custom social"
    )
    expect(element.shadowRoot?.querySelector(".legal-links")?.textContent).toContain("Custom legal")
  })

  it("uses defaults when any JSON configuration attribute is invalid", async () => {
    const element = await createFooter({
      brand: "{",
      "link-groups": "{",
      "social-links": "{",
      "legal-links": "{",
    })

    expect(element.brand).toBe(DEFAULT_FOOTER_BRAND)
    expect(element.linkGroups).toBe(DEFAULT_FOOTER_LINK_GROUPS)
    expect(element.socialLinks).toBe(DEFAULT_FOOTER_SOCIAL_LINKS)
    expect(element.legalLinks).toBe(DEFAULT_FOOTER_LEGAL_LINKS)
    expect(element.shadowRoot?.querySelectorAll(".project-links a")).toHaveLength(14)
  })

  it("hides app badges, social links, and donation links when disabled", async () => {
    const element = await createFooter({
      "show-app-badges": "false",
      "show-social": "false",
      "show-donation": "false",
    })

    expect(element.shadowRoot?.querySelector("#install_the_app_block")).toBeNull()
    expect(element.shadowRoot?.querySelector(".social-links")).toBeNull()
    expect(element.shadowRoot?.querySelector(".legal-links")?.textContent).not.toContain(
      "Donate to Open Food Facts"
    )
  })

  it.each(["brand", "app-badges", "links", "social", "legal", "bottom"])(
    "allows the %s slot to replace its fallback",
    async (slotName) => {
      const element = await createFooter(undefined, { [slotName]: `${slotName} override` })
      const slot = element.shadowRoot?.querySelector(`slot[name="${slotName}"]`)

      expect(
        slot
          ?.assignedNodes()
          .map((node) => node.textContent)
          .join("")
      ).toContain(`${slotName} override`)
    }
  )

  it("omits unsafe links and opens external links safely", async () => {
    const element = document.createElement("off-footer") as Footer
    element.linkGroups = [
      {
        label: "Configured links",
        links: [
          { label: "Unsafe", href: "javascript:alert(1)" },
          { label: "External", href: "https://example.org", external: true },
          { label: "Different origin", href: "https://elsewhere.example.org" },
        ],
      },
    ]
    document.body.appendChild(element)
    await element.updateComplete

    expect(element.shadowRoot?.querySelector('a[href^="javascript:"]')).toBeNull()
    const externalLink = element.shadowRoot?.querySelector('a[href="https://example.org/"]')
    expect(externalLink?.getAttribute("target")).toBe("_blank")
    expect(externalLink?.getAttribute("rel")).toBe("noopener noreferrer")
    const differentOriginLink = element.shadowRoot?.querySelector(
      'a[href="https://elsewhere.example.org/"]'
    )
    expect(differentOriginLink?.getAttribute("target")).toBe("_blank")
    expect(differentOriginLink?.getAttribute("rel")).toBe("noopener noreferrer")
  })
})
