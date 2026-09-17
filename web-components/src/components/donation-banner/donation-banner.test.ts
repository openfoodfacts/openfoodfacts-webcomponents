import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { languageCode, countryCode } from "../../signals/app"
import { DEFAULT_LANGUAGE_CODE } from "../../constants"

/** Set by the matchMedia mock below; flips `darkModeListener`'s subscribers. */
let onSchemeChange: (event: { matches: boolean }) => void = () => {}

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: (_event: string, cb: (event: { matches: boolean }) => void) => {
        onSchemeChange = cb
      },
      removeEventListener: vi.fn(),
    })),
  })

  await import("./donation-banner")

  // jsdom does not implement navigation; a real anchor click would otherwise log noise.
  // `composedPath()` is needed because a shadow-DOM click retargets `event.target`.
  document.addEventListener("click", (event) => {
    const origin = event.composedPath()[0] as HTMLElement
    if (origin?.closest?.("a[href]")) {
      event.preventDefault()
    }
  })
})

const FEED_URL = "https://example.org/main.json"

const createBanner = async (attributes: Record<string, string> = {}) => {
  const element = document.createElement("donation-banner") as any
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

const donateLink = (element: any) => element.shadowRoot.querySelector("a").getAttribute("href")

const meterOf = (element: any) => element.shadowRoot.querySelector("donation-meter")

const meterStates = (element: any) => {
  const states: string[] = []
  element.addEventListener("donation-meter-state", (event: any) => states.push(event.detail.state))
  return states
}

/** `loading` is announced before the feed answers, so waiting on the link alone proves nothing. */
const settle = async (element: any, states: string[]) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await element.updateComplete
    if (states.length > 0 && states.at(-1) !== "loading") {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

const campaignFeed = (campaign: Record<string, unknown>) => ({
  news: { donation_campaign: campaign },
  tagline_feed: { default: { news: [{ id: "donation_campaign" }] } },
})

const mountMeteredBanner = async () => {
  const element = document.createElement("donation-banner") as any
  const states = meterStates(element)
  element.setAttribute("news-url", FEED_URL)
  document.body.appendChild(element)
  await element.updateComplete
  return { element, states }
}

const createMeteredBanner = async (body: unknown) => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  } as Response)

  const { element, states } = await mountMeteredBanner()
  await settle(element, states)
  return element
}

const listItems = (element: any) =>
  Array.from(element.shadowRoot.querySelectorAll("li")).map((item: any) => item.textContent.trim())

const ASK = [
  "keeping our database open & available to all,",
  "technical infrastructure (website/mobile app) & a small permanent team",
  "remain independent of the food industry,",
  "engage a community of committed citizens,",
  "support the advancement of public health research.",
]

beforeEach(() => {
  vi.mocked(global.fetch).mockReset()
  languageCode.set(DEFAULT_LANGUAGE_CODE)
  countryCode.set("fr")
  document.body.style.overflow = ""
  document.body.style.paddingBottom = ""
  document.body.innerHTML = ""
})

describe("donation-banner", () => {
  it("shows no meter and no extra tracking without a news feed", async () => {
    const element = await createBanner()

    expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("shows the meter and marks the donate link once the feed carries figures", async () => {
    const element = await createMeteredBanner(
      campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" })
    )

    expect(meterOf(element).getAttribute("url")).toBe(FEED_URL)
    expect(meterOf(element).shadowRoot.querySelector(".bar")).not.toBeNull()
    expect(donateLink(element)).toContain("utm_content=meter")
  })

  it("leaves the link untagged when the feed carries no figures to show", async () => {
    const element = await createMeteredBanner(campaignFeed({ raised: 44156, currency: "EUR" }))

    expect(meterOf(element)).not.toBeNull()
    expect(meterOf(element).shadowRoot.querySelector(".bar")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("leaves the link untagged when the feed request fails", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("the feed is unreachable"))

    const { element, states } = await mountMeteredBanner()
    await settle(element, states)

    expect(meterOf(element)).not.toBeNull()
    expect(meterOf(element).shadowRoot.querySelector(".bar")).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("drops the tag when the feed is taken away at runtime", async () => {
    const element = await createMeteredBanner(
      campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" })
    )
    expect(donateLink(element)).toContain("utm_content=meter")

    element.removeAttribute("news-url")
    await element.updateComplete

    expect(meterOf(element)).toBeNull()
    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("does not tag the link while the feed is still in flight", async () => {
    let answer: (response: Response) => void = () => {}
    vi.mocked(global.fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        answer = resolve
      })
    )

    const { element, states } = await mountMeteredBanner()
    for (let attempt = 0; attempt < 20 && states.length === 0; attempt++) {
      await element.updateComplete
      await new Promise((resolve) => setTimeout(resolve, 5))
    }

    expect(states).toEqual(["loading"])
    expect(donateLink(element)).not.toContain("utm_content")

    answer({
      ok: true,
      status: 200,
      json: async () => campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" }),
    } as Response)
    await settle(element, states)

    expect(donateLink(element)).toContain("utm_content=meter")
  })

  it("ignores a late answer from a meter that has already left the page", async () => {
    const element = await createMeteredBanner(
      campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" })
    )
    const ghost = meterOf(element)

    element.removeAttribute("news-url")
    await element.updateComplete
    const states = meterStates(element)
    element.setAttribute("news-url", "https://example.org/other.json")
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => campaignFeed({ raised: 44156, currency: "EUR" }),
    } as Response)
    await settle(element, states)

    expect(meterOf(element)).not.toBe(ghost)
    expect(ghost.isConnected).toBe(false)
    expect(donateLink(element)).not.toContain("utm_content")

    ghost.dispatchEvent(
      new CustomEvent("donation-meter-state", {
        detail: { state: "has-data" },
        bubbles: true,
        composed: true,
      })
    )
    await element.updateComplete

    expect(donateLink(element)).not.toContain("utm_content")
  })

  it("still tags the link when the feed answers while the banner is off the page", async () => {
    let answer: (response: Response) => void = () => {}
    vi.mocked(global.fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        answer = resolve
      })
    )

    const { element } = await mountMeteredBanner()
    element.remove()
    answer({
      ok: true,
      status: 200,
      json: async () => campaignFeed({ raised: 44156, goal: 170000, currency: "EUR" }),
    } as Response)
    await new Promise((resolve) => setTimeout(resolve, 5))

    const states = meterStates(element)
    document.body.appendChild(element)
    await settle(element, states)

    expect(meterOf(element).shadowRoot.querySelector(".bar")).not.toBeNull()
    expect(donateLink(element)).toContain("utm_content=meter")
  })

  it("keeps the donation ask itself unchanged either way", async () => {
    const plain = await createBanner()
    const metered = await createBanner({ "news-url": FEED_URL })

    expect(listItems(plain)).toEqual(ASK)
    expect(listItems(metered)).toEqual(ASK)
    expect(plain.shadowRoot.querySelector("button").textContent.trim()).toBe("I SUPPORT")
    expect(metered.shadowRoot.querySelector("button").textContent.trim()).toBe("I SUPPORT")
  })

  it("displays the updated title, hook, financial callout and community image", async () => {
    const element = await createBanner()

    expect(
      element.shadowRoot.querySelector(".donation-banner-footer__main-title").textContent.trim()
    ).toBe("Become an Open Food Facts patron")
    expect(
      element.shadowRoot.querySelector(".donation-banner-footer__hook-section p").textContent.trim()
    ).toBe("We still need €120,000 to finish 2026!")
    expect(
      element.shadowRoot
        .querySelector(".donation-banner-footer__actions-section__financial p")
        .textContent.trim()
    ).toBe(
      "If every visitor this month clicked on Donate and gave just 1€, we'd get over 8 times our yearly budget!"
    )
    expect(element.shadowRoot.querySelector("img.group-image")).not.toBeNull()
  })

  it("supports custom donate-url attribute", async () => {
    const element = await createBanner({ "donate-url": "https://example.org/custom-donate" })

    const href = donateLink(element)
    expect(href).toContain("https://example.org/custom-donate")
    expect(href).toContain("utm_source=off")
  })

  it("supports custom donate-link attribute", async () => {
    const element = await createBanner({ "donate-link": "https://example.org/from-server-link" })

    const href = donateLink(element)
    expect(href).toContain("https://example.org/from-server-link")
    expect(href).toContain("utm_source=off")
  })

  it("refuses a donate link that is not an http(s) URL", async () => {
    const element = await createBanner({ "donate-url": "javascript:alert(document.cookie)//" })

    const href = donateLink(element)
    expect(href.startsWith("javascript:")).toBe(false)
    expect(href).toContain("https://world.openfoodfacts.org/donate-to-open-food-facts")
  })

  it("localizes the fallback donation link and utm_term for Japanese", async () => {
    languageCode.set("ja")
    const element = await createBanner()

    const href = donateLink(element)
    expect(href).toContain("https://world-ja.openfoodfacts.org/donate-to-open-food-facts")
    expect(href).toContain("utm_term=ja-text-button")
  })
})

// ---------------------------------------------------------------------------
// C2 variants: campaign / strip / sheet / bar, feed-driven copy
// ---------------------------------------------------------------------------

/** The literal `upstream/main @ a7ddfb4` render, captured on the clean tree before this ticket's code. */
const DEFAULT_MARKUP = (nextYear: string) => `<section class="  ">
      <div class="donation-banner-footer row">
        <div class="donation-banner-footer__left-aside">
          <div class="donation-banner-footer__hook-section">
            <p>We still need €120,000 to finish 2026!</p>
          </div>
          <img class="group-image" src="/assets/images/donation-banner-group-photo.png" alt="group photo donation ${nextYear}">
        </div>
        <div class="donation-banner__main-div-wrapper">
          <div style="padding-left: 16px;">
            <div class="donation-banner-footer__main-section">
              <img width="50" height="50" alt="open food facts logo" src="/assets/images/CMJN-ICON_WHITE_BG_OFF.svg">
              <h3 class="donation-banner-footer__main-title">
                Become an Open Food Facts patron
              </h3>
            </div>
            <p style="margin: 0 0 20px; font-size: 14px;">
              Your donations fund the day-to-day operations of our non-profit association:
            </p>
            <ul class="unordered-list">
              <li>keeping our database open &amp; available to all,</li>
              <li>
                technical infrastructure (website/mobile app) &amp; a small permanent team
              </li>
              <li>
                <p>remain independent of the food industry,</p>
              </li>
              <li>
                <p>engage a community of committed citizens,</p>
              </li>
              <li>
                <p>support the advancement of public health research.</p>
              </li>
            </ul>
            
          </div>
          <div class="donation-banner-footer__actions-section">
            <div class="donation-banner-footer__actions-section__financial">
              <p style="margin: 0px; line-height: 1.6">
                If every visitor this month clicked on Donate and gave just 1€, we'd get over 8 times our yearly budget!
              </p>
            </div>
            <div class="donation-banner-footer__actions-section__donate-button">
              <a href="https://world.openfoodfacts.org/donate-to-open-food-facts?utm_source=off&amp;utm_medium=web&amp;utm_campaign=donate-${nextYear}-a&amp;utm_term=en-text-button">
                <button>I SUPPORT</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>`

const nextYear = () => (new Date().getFullYear() + 1).toString()

const markup = (element: any) =>
  element.shadowRoot.querySelector("section").outerHTML.replace(/<!--.*?-->/g, "")

const text = (element: any) =>
  (element.shadowRoot.querySelector("section")?.textContent ?? "").replace(/\s+/g, " ").trim()

const bannerEvents = (element: any) => {
  const detail: any[] = []
  element.addEventListener("donation-banner-state", (event: any) => detail.push(event.detail))
  return detail
}

const settleTask = async (element: any) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    await element.updateComplete
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

/** A feed item shaped like `donation_campaign_2026`, with the mock's figures by default. */
const feedItem = (overrides: Record<string, unknown> = {}) => ({
  translations: { default: { title: "Campaign", message: "Give" } },
  raised: 47431,
  goal: 170000,
  currency: "EUR",
  count: 760,
  end_date: "2027-01-31 23:59:59",
  ...overrides,
})

const feed = (item: Record<string, unknown> = {}, id = "camp") => ({
  news: { [id]: feedItem(item) },
  tagline_feed: { default: { news: [{ id }] } },
})

const mountVariant = async (
  variant: string,
  attributes: Record<string, string> = {},
  body?: unknown
) => {
  if (body !== undefined) {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => body,
    } as Response)
  }
  const element = document.createElement("donation-banner") as any
  element.setAttribute("variant", variant)
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }
  document.body.appendChild(element)
  await element.updateComplete
  if (attributes["news-url"] && attributes["news-id"]) {
    await settleTask(element)
  }
  return element
}

describe("donation-banner variants", () => {
  describe("default render pinned to upstream/main", () => {
    it("renders byte-identical markup with no new attributes", async () => {
      const element = await createBanner()
      expect(markup(element)).toBe(DEFAULT_MARKUP(nextYear()))
    })

    it("stays pinned with donate-url set", async () => {
      const element = await createBanner({ "donate-url": "https://example.org/x" })
      expect(listItems(element)).toEqual(ASK)
      expect(element.shadowRoot.querySelector("img.group-image")).not.toBeNull()
      expect(element.shadowRoot.querySelector("button").textContent.trim()).toBe("I SUPPORT")
    })

    it("stays pinned with current-year set explicitly", async () => {
      const element = await createBanner({ "current-year": "2026" })
      expect(markup(element)).toBe(DEFAULT_MARKUP("2026"))
    })

    it("falls back to the default render for an unknown variant", async () => {
      const element = await createBanner({ variant: "foo" })
      expect(markup(element)).toBe(DEFAULT_MARKUP(nextYear()))
    })
  })

  describe("variant selection", () => {
    it("renders none of the default's photo or list in any variant", async () => {
      for (const variant of ["campaign", "strip", "sheet", "bar"]) {
        const element = await mountVariant(variant)
        expect(element.shadowRoot.querySelector("img.group-image")).toBeNull()
        expect(element.shadowRoot.querySelector("li")).toBeNull()
      }
    })
  })

  describe("campaign, no news-id: built-in copy, no figures", () => {
    it("renders the count-less headline, paragraph, tiers and fine print", async () => {
      const element = await mountVariant("campaign", { amounts: "3,5,10" })

      expect(text(element)).toContain("This page is free because people like you paid for it.")
      expect(text(element)).toContain("4.6 million products kept open by volunteers.")
      expect(text(element)).not.toContain("We need")
      expect(text(element)).toContain("Most popular")
      expect(text(element)).toContain("Give €5 a month")
      expect(text(element)).toContain("Cancel any time.")
      expect(text(element)).toContain("Receipt by email.")
      expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it("shows Support with no amount/interval when amounts is absent", async () => {
      const element = await mountVariant("campaign")
      expect(text(element)).toContain("Support")
      const href = element.shadowRoot.querySelector("a.give").getAttribute("href")
      expect(href).not.toContain("amount=")
      expect(href).not.toContain("interval=")
    })
  })

  describe("campaign, with news-id: feed copy and figures, one fetch", () => {
    it("renders the mock's figures and mounts the meter with .funding, no url", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed()
      )

      expect(text(element)).toContain("760 people paid for it")
      expect(text(element)).toContain("€170,000")
      const meter = element.shadowRoot.querySelector("donation-meter")
      const meterText = (meter.shadowRoot.textContent as string).replace(/\s+/g, " ")
      expect(meterText).toContain("€47,431")
      expect(meterText).toContain("raised of €170,000")
      expect(meterText).toContain("760 supporters")
      expect(meterText).toContain("January 31")
      expect(meter.funding).toEqual({ raised: 47431, goal: 170000, currency: "EUR" })
      expect(meter.hasAttribute("url")).toBe(false)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it("does not refetch when swapping between variants with the same news-id", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed()
      )
      expect(global.fetch).toHaveBeenCalledTimes(1)

      element.setAttribute("variant", "bar")
      await settleTask(element)

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe("feed override", () => {
    it("replaces the six slots on the page locale and fills placeholders", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({
          translations: {
            en: {
              title: "Feed headline",
              message: "Feed body {raised} of {goal}",
              hook: "Feed hook",
              button_label: "Feed give {amount}",
              fine_print: "Feed fine print",
              tier_note: "unlocks {amount} perks",
            },
          },
        })
      )

      expect(text(element)).toContain("Feed headline")
      expect(text(element)).toContain("Feed body €47,431 of €170,000")
      expect(text(element)).toContain("Feed give €5")
      expect(text(element)).toContain("Feed fine print")
      expect(text(element)).toContain("unlocks €5 perks")
    })

    it("falls back to built-in sentences for keys the feed omits", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ translations: { en: { title: "Feed headline", message: "M" } } })
      )

      expect(text(element)).toContain("Feed headline")
      expect(text(element)).toContain("Give €5 a month")
    })

    it("does not use a default-only translation to override the built-in headline (orchestrator override)", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ translations: { default: { title: "Default-only headline", message: "M" } } })
      )

      expect(text(element)).not.toContain("Default-only headline")
      expect(text(element)).toContain("760 people paid for it")
    })

    it("uses a translations.en title on an en page", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({
          translations: {
            en: { title: "EN headline", message: "M" },
            default: { title: "Default headline", message: "M" },
          },
        })
      )

      expect(text(element)).toContain("EN headline")
      expect(text(element)).not.toContain("Default headline")
    })
  })

  describe("locale fallback", () => {
    it("prefers the full locale key over the short one", async () => {
      languageCode.set("pt-BR")
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({
          translations: {
            pt_BR: { title: "PT-BR title", message: "M" },
            pt: { title: "PT title", message: "M" },
          },
        })
      )
      expect(text(element)).toContain("PT-BR title")
    })

    it("falls back to the short locale when the full one is missing", async () => {
      languageCode.set("pt-BR")
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ translations: { pt: { title: "PT title", message: "M" } } })
      )
      expect(text(element)).toContain("PT title")
    })

    it("falls back to built-in copy when neither pt_BR nor pt is present", async () => {
      languageCode.set("pt-BR")
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ translations: { default: { title: "Default title", message: "M" } } })
      )
      expect(text(element)).not.toContain("Default title")
      expect(text(element)).toContain("760 people paid for it")
    })
  })

  describe("feed errors and unknown/disabled items", () => {
    it("renders built-in copy with no throw or console.error on a rejected fetch", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("offline"))
      const element = await mountVariant("campaign", {
        "news-url": FEED_URL,
        "news-id": "camp",
        amounts: "3,5,10",
      })
      await settleTask(element)

      expect(text(element)).toContain("people like you paid for it")
      expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
      expect(console.error).not.toHaveBeenCalled()
    })

    it("renders built-in copy on a non-JSON body", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("not json")
        },
      } as unknown as Response)
      const element = await mountVariant("campaign", {
        "news-url": FEED_URL,
        "news-id": "camp",
        amounts: "3,5,10",
      })
      await settleTask(element)

      expect(text(element)).toContain("people like you paid for it")
      expect(console.error).not.toHaveBeenCalled()
    })

    it("renders built-in copy on an HTTP 500", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        undefined
      )
      vi.mocked(global.fetch).mockResolvedValue({ ok: false, status: 500 } as Response)
      element.setAttribute("news-id", "camp2")
      await settleTask(element)

      expect(text(element)).toContain("people like you paid for it")
    })

    it("renders built-in copy for a news-id the feed does not carry", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "missing", amounts: "3,5,10" },
        feed()
      )
      expect(text(element)).toContain("people like you paid for it")
    })

    it("renders built-in copy when the item has no translations object", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        {
          news: { camp: { raised: 1, goal: 2, currency: "EUR" } },
          tagline_feed: { default: { news: [{ id: "camp" }] } },
        }
      )
      expect(text(element)).toContain("people like you paid for it")
    })

    it("still renders a disabled or ended item's copy and figures (PO decision 7)", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ enabled: false, start_date: "2000-01-01", end_date: "2001-01-01" })
      )
      expect(text(element)).toContain("760 people paid for it")
      const meter = element.shadowRoot.querySelector("donation-meter")
      expect(meter.shadowRoot.textContent as string).toContain("€47,431")
    })
  })

  describe("edge cases: count, end_date, figures", () => {
    it("drops {count} and its surrounding space from a feed string when count is absent", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ count: undefined, translations: { en: { title: "X {count} Y", message: "M" } } })
      )
      expect(text(element)).toContain("X Y")
    })

    it("omits the supporters part of the meter line when count is absent", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ count: undefined })
      )
      const meter = element.shadowRoot.querySelector("donation-meter")
      expect((meter.shadowRoot.textContent as string).replace(/\s+/g, " ")).not.toContain(
        "supporters"
      )
    })

    it("omits 'until' for a missing or invalid end_date", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ end_date: undefined })
      )
      const meter = element.shadowRoot.querySelector("donation-meter")
      expect(meter.shadowRoot.textContent as string).not.toContain("until")
    })

    it("renders no meter and no bar when the figures do not parse", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed({ currency: "12$" })
      )
      expect(element.shadowRoot.querySelector("donation-meter")).toBeNull()
      expect(text(element)).toContain("Give €5 a month")
    })
  })

  describe("amounts / selected / tier click", () => {
    it("preselects the lower-middle tier of an even-count ladder", async () => {
      const element = await mountVariant("campaign", { amounts: "3,5,10,20" })
      const selected = element.shadowRoot.querySelector(".tier.selected")
      expect(selected.textContent).toContain("€5")
    })

    it("falls back to the middle when selected is not in amounts", async () => {
      const element = await mountVariant("campaign", { amounts: "3,5,10", selected: "7" })
      const selected = element.shadowRoot.querySelector(".tier.selected")
      expect(selected.textContent).toContain("€5")
    })

    it("drops non-numeric entries and keeps the valid ones", async () => {
      const element = await mountVariant("campaign", { amounts: "3,abc,10" })
      const tiers = Array.from(element.shadowRoot.querySelectorAll(".tier:not(.other)"))
      expect(tiers).toHaveLength(2)
    })

    it("shows no tiers, no tier note, Support, no amount/interval when amounts is empty or absent", async () => {
      const empty = await mountVariant("campaign", { amounts: "" })
      expect(empty.shadowRoot.querySelector(".tier")).toBeNull()
      expect(text(empty)).toContain("Support")
      const href = empty.shadowRoot.querySelector("a.give").getAttribute("href")
      expect(href).not.toContain("amount=")
      expect(href).not.toContain("interval=")
    })

    it("moves the selection on tier click without moving the badge or firing an event", async () => {
      const element = await mountVariant("campaign", { amounts: "3,5,10" })
      const detail = bannerEvents(element)
      const tiers = Array.from(
        element.shadowRoot.querySelectorAll(".tier:not(.other)")
      ) as HTMLElement[]
      const tenEuro = tiers.find((tier) => tier.textContent?.includes("€10"))!
      tenEuro.click()
      await element.updateComplete

      expect(element.shadowRoot.querySelector(".tier.selected").textContent).toContain("€10")
      expect(element.shadowRoot.querySelector(".badge").closest(".tier").textContent).toContain(
        "€5"
      )
      expect(text(element)).toContain("Give €10 a month")
      const href = element.shadowRoot.querySelector("a.give").getAttribute("href")
      expect(href).toContain("amount=10")
      expect(href).toContain("interval=1M")
      expect(detail).toHaveLength(0)
    })

    it("navigates Other at once with interval=1T, no amount, and fires click", async () => {
      const element = await mountVariant("campaign", { amounts: "3,5,10" })
      const detail = bannerEvents(element)
      const other = element.shadowRoot.querySelector("a.other")
      expect(other.getAttribute("href")).toContain("interval=1T")
      expect(other.getAttribute("href")).not.toContain("amount=")

      other.click()

      expect(detail).toEqual([{ action: "click", variant: "campaign", interval: "1T" }])
    })
  })

  describe("utm-content", () => {
    it("overrides the automatic meter tag", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10", "utm-content": "A" },
        feed()
      )
      const href = element.shadowRoot.querySelector("a.give").getAttribute("href")
      expect(href).toContain("utm_content=A")
    })

    it("keeps today's meter rule when utm-content is absent", async () => {
      const element = await mountVariant(
        "campaign",
        { "news-url": FEED_URL, "news-id": "camp", amounts: "3,5,10" },
        feed()
      )
      const href = element.shadowRoot.querySelector("a.give").getAttribute("href")
      expect(href).toContain("utm_content=meter")
    })
  })

  describe("donate-url falling back on an unsafe scheme", () => {
    it("falls back to the default donation page but keeps amount/interval", async () => {
      const element = await mountVariant("campaign", {
        amounts: "3,5,10",
        "donate-url": "javascript:alert(1)",
      })
      const href = element.shadowRoot.querySelector("a.give").getAttribute("href")
      expect(href.startsWith("javascript:")).toBe(false)
      expect(href).toContain("https://world.openfoodfacts.org/donate-to-open-food-facts")
      expect(href).toContain("amount=5")
      expect(href).toContain("interval=1M")
    })
  })

  describe("country", () => {
    it("shows the French headline and fine print for country=fr", async () => {
      const element = await mountVariant("campaign", {
        amounts: "5,10",
        selected: "5",
        country: "fr",
      })
      expect(text(element)).toContain("To our readers in France")
      expect(text(element)).toContain("Tax deductible in France")
      expect(text(element)).toContain("€1.70")
    })

    it("is case-insensitive", async () => {
      const element = await mountVariant("campaign", {
        amounts: "5,10",
        selected: "10",
        country: "FR",
      })
      expect(text(element)).toContain("To our readers in France")
      expect(text(element)).toContain("€3.40")
    })

    it("shows neutral copy for any other country or none", async () => {
      const none = await mountVariant("campaign", { amounts: "5,10" })
      expect(text(none)).not.toContain("To our readers in France")

      const german = await mountVariant("campaign", { amounts: "5,10", country: "de" })
      expect(text(german)).not.toContain("To our readers in France")
    })

    it("never reads the countryCode signal", async () => {
      countryCode.set("fr")
      const element = await mountVariant("campaign", { amounts: "5,10" })
      expect(text(element)).not.toContain("To our readers in France")
    })
  })

  describe("current-year", () => {
    it("uses year+1 by default in {year} and utm_campaign", async () => {
      const element = await mountVariant("campaign")
      const href =
        element.shadowRoot.querySelector("a.give")?.getAttribute("href") ?? donateLink(element)
      expect(href).toContain(`utm_campaign=donate-${nextYear()}-a`)
    })

    it("uses the given current-year for both", async () => {
      const element = await mountVariant("campaign", { "current-year": "2026" })
      const href = donateLink(element)
      expect(href).toContain("utm_campaign=donate-2026-a")
    })
  })

  describe("strip", () => {
    it("renders the one-line copy, a Support link and a close button", async () => {
      const element = await mountVariant("strip")
      expect(text(element)).toContain("Open Food Facts is free because people like you pay for it.")
      expect(text(element)).toContain("€3 a month keeps it that way.")
      expect(text(element)).toContain("Support")
      expect(element.shadowRoot.querySelector("cross-icon")).not.toBeNull()
    })

    it("dismiss emits an event", async () => {
      const element = await mountVariant("strip")
      const detail = bannerEvents(element)
      element.shadowRoot.querySelector(".close").click()
      expect(detail).toEqual([{ action: "dismiss", variant: "strip" }])
    })
  })

  describe("sheet", () => {
    const mountSheet = async () => {
      const element = await mountVariant("sheet", { amounts: "3,5,10" })
      return element
    }

    it("renders the dialog markup, grab handle and Not now", async () => {
      const element = await mountSheet()
      const dialog = element.shadowRoot.querySelector(".sheet")
      expect(dialog.getAttribute("role")).toBe("dialog")
      expect(dialog.getAttribute("aria-modal")).toBe("true")
      expect(dialog.getAttribute("aria-labelledby")).toBe("donation-banner-title")
      expect(element.shadowRoot.querySelector(".grab")).not.toBeNull()
      expect(text(element)).toContain("Not now")
    })

    it("Esc, backdrop, x and Not now each emit minimize", async () => {
      const element = await mountSheet()
      const detail = bannerEvents(element)

      element.shadowRoot.querySelector(".overlay").click()
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
      element.shadowRoot.querySelector(".sheet .close").click()
      Array.from(element.shadowRoot.querySelectorAll(".link"))
        .find((btn: any) => btn.textContent.includes("Not now"))!
        // @ts-expect-error test DOM node
        .click()

      expect(detail.every((entry) => entry.action === "minimize")).toBe(true)
      expect(detail).toHaveLength(4)
    })

    it("a click inside the sheet emits nothing", async () => {
      const element = await mountSheet()
      const detail = bannerEvents(element)
      element.shadowRoot.querySelector(".sheet h2").click()
      expect(detail).toHaveLength(0)
    })

    it("locks body scroll while open and restores it when removed", async () => {
      const previous = document.body.style.overflow
      const element = await mountSheet()
      expect(document.body.style.overflow).toBe("hidden")

      element.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(document.body.style.overflow).toBe(previous)
    })

    it("Tab from the last focusable wraps to the first, Shift-Tab reverses", async () => {
      const element = await mountSheet()
      const dialog = element.shadowRoot.querySelector(".sheet") as HTMLElement
      const focusable = Array.from(dialog.querySelectorAll("button, a[href]")) as HTMLElement[]
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      last.focus()
      expect(element.shadowRoot.activeElement).toBe(last)
      last.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )
      expect(element.shadowRoot.activeElement).toBe(first)

      first.focus()
      first.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )
      expect(element.shadowRoot.activeElement).toBe(last)
    })
  })

  describe("bar", () => {
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(56)
    })

    it("pads the body by the bar's height while connected", async () => {
      await mountVariant("bar")
      expect(document.body.style.paddingBottom).toBe("56px")
    })

    it("clears the padding on dismiss and fires the event", async () => {
      const element = await mountVariant("bar")
      const detail = bannerEvents(element)
      element.shadowRoot.querySelector(".close").click()
      await element.updateComplete

      expect(document.body.style.paddingBottom).toBe("")
      expect(detail).toEqual([{ action: "dismiss", variant: "bar" }])
    })

    it("clears the padding on disconnect", async () => {
      const element = await mountVariant("bar")
      element.remove()
      expect(document.body.style.paddingBottom).toBe("")
    })

    it("'I already donated' fires already-donated", async () => {
      const element = await mountVariant("bar")
      const detail = bannerEvents(element)
      Array.from(element.shadowRoot.querySelectorAll(".link"))
        .find((btn: any) => btn.textContent.includes("I already donated"))!
        // @ts-expect-error test DOM node
        .click()
      expect(detail).toEqual([{ action: "already-donated", variant: "bar" }])
    })
  })

  describe("event shape", () => {
    it("carries variant, bubbles and composed on every action", async () => {
      const element = await mountVariant("strip")
      let captured: CustomEvent | undefined
      element.addEventListener("donation-banner-state", (event: Event) => {
        captured = event as CustomEvent
      })
      element.shadowRoot.querySelector(".close").click()

      expect(captured?.type).toBe("donation-banner-state")
      expect(captured?.bubbles).toBe(true)
      expect(captured?.composed).toBe(true)
      expect(captured?.detail).toEqual({ action: "dismiss", variant: "strip" })
    })
  })

  describe("dark mode", () => {
    it("flips the dark-mode class on the variant root at runtime", async () => {
      const element = await mountVariant("campaign")
      expect(element.shadowRoot.querySelector(".campaign").classList.contains("dark-mode")).toBe(
        false
      )

      onSchemeChange({ matches: true })
      await element.updateComplete
      expect(element.shadowRoot.querySelector(".campaign").classList.contains("dark-mode")).toBe(
        true
      )

      onSchemeChange({ matches: false })
      await element.updateComplete
      expect(element.shadowRoot.querySelector(".campaign").classList.contains("dark-mode")).toBe(
        false
      )
    })
  })
})
