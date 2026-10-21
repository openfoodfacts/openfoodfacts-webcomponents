import { describe, expect, it } from "vitest"
import { sourceLocale } from "./dist/locale-codes"
import { getLocale, setLanguageCode } from "./index"
import { languageCode } from "../signals/app"

describe("setLanguageCode", () => {
  it("falls back to the source locale when no UI translation bundle exists", async () => {
    await setLanguageCode("ab")

    expect(getLocale()).toBe(sourceLocale)
    expect(languageCode.get()).toBe("ab")
  })
})
