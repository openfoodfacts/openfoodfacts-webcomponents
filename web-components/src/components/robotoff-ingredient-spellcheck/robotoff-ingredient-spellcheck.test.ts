import { describe, expect, it } from "vitest"
import { getSpellcheckLanguageFilter } from "./robotoff-ingredient-spellcheck"

describe("getSpellcheckLanguageFilter", () => {
  it("does not restrict spellcheck questions when no language filter is configured", () => {
    expect(getSpellcheckLanguageFilter()).toEqual({})
  })

  it("preserves an explicit language filter", () => {
    expect(getSpellcheckLanguageFilter(["fr", "es"])).toEqual({ lc: "fr,es" })
  })
})
