import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { languageCode } from "../../signals/app"
import { DEFAULT_LANGUAGE_CODE } from "../../constants"
import type { MobileBadges } from "./mobile-badges"

beforeAll(async () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })

  await import("./mobile-badges")
})

const createMobileBadges = async () => {
  const element = document.createElement("mobile-badges") as MobileBadges
  document.body.appendChild(element)
  await element.updateComplete
  return element
}

beforeEach(() => {
  languageCode.set(DEFAULT_LANGUAGE_CODE)
  document.body.innerHTML = ""
})

describe("mobile-badges", () => {
  it("builds the Google Play Store link with '&' before UTM parameters so hl and utm_source are preserved", async () => {
    const element = await createMobileBadges()
    const href = element.getAndroidAppLink("fr")

    expect(href).toBe(
      "https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=fr&utm_source=off&utm_medium=web&utm_campaign=install_the_app_android_footer_fr"
    )

    const parsed = new URL(href)
    expect(parsed.searchParams.get("id")).toBe("org.openfoodfacts.scanner")
    expect(parsed.searchParams.get("hl")).toBe("fr")
    expect(parsed.searchParams.get("utm_source")).toBe("off")
    expect(parsed.searchParams.get("utm_medium")).toBe("web")
    expect(parsed.searchParams.get("utm_campaign")).toBe("install_the_app_android_footer_fr")
  })

  it("builds the Android APK link with '?' before UTM parameters", async () => {
    const element = await createMobileBadges()
    const href = element.getAndroidApkAppLink("fr")

    expect(href).toBe(
      "https://github.com/openfoodfacts/smooth-app/releases/latest?utm_source=off&utm_medium=web&utm_campaign=install_the_app_apk_footer_fr"
    )

    const parsed = new URL(href)
    expect(parsed.searchParams.get("utm_source")).toBe("off")
    expect(parsed.searchParams.get("utm_medium")).toBe("web")
    expect(parsed.searchParams.get("utm_campaign")).toBe("install_the_app_apk_footer_fr")
  })

  it("renders Play Store and APK badge links with valid query strings", async () => {
    languageCode.set("en")
    const element = await createMobileBadges()

    const playStoreAnchor = element.shadowRoot
      ?.querySelector("#playstore_badge")
      ?.closest("a") as HTMLAnchorElement | null
    const apkAnchor = element.shadowRoot
      ?.querySelector("#apk_badge")
      ?.closest("a") as HTMLAnchorElement | null

    expect(playStoreAnchor?.getAttribute("href")).toBe(
      "https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=en&utm_source=off&utm_medium=web&utm_campaign=install_the_app_android_footer_en"
    )
    expect(apkAnchor?.getAttribute("href")).toBe(
      "https://github.com/openfoodfacts/smooth-app/releases/latest?utm_source=off&utm_medium=web&utm_campaign=install_the_app_apk_footer_en"
    )
  })
})
