import { WordDiff } from "../types"
import { getWordDiff } from "../utils/word-diff"

describe("getWordDiff", () => {
  it("should return the correct diff for two strings", () => {
    const original = "This is a test"
    const correction = "This is a teste"
    const expected = [
      { original: "This", correction: "This" },
      { original: "is", correction: "is" },
      { original: "a", correction: "a" },
      { original: "test", correction: "teste" },
    ]
    expect(getWordDiff(original, correction)).toEqual(expected)
  })

  it("should handle added words", () => {
    const original = "This is a test"
    const correction = "This is a test with added words"
    const expected = [
      { original: "This", correction: "This" },
      { original: "is", correction: "is" },
      { original: "a", correction: "a" },
      { original: "test", correction: "test" },
      { original: "", correction: "with" },
      { original: "", correction: "added" },
      { original: "", correction: "words" },
    ]
    expect(getWordDiff(original, correction)).toEqual(expected)
  })

  it("should handle removed words", () => {
    const original = "This is a test with removed words"
    const correction = "This is a test"
    const expected = [
      { original: "This", correction: "This" },
      { original: "is", correction: "is" },
      { original: "a", correction: "a" },
      { original: "test", correction: "test" },
      { original: "with", correction: "" },
      { original: "removed", correction: "" },
      { original: "words", correction: "" },
    ]
    expect(getWordDiff(original, correction)).toEqual(expected)
  })

  it("should handle empty strings", () => {
    const original = ""
    const correction = ""
    const expected: WordDiff[] = []
    expect(getWordDiff(original, correction)).toEqual(expected)
  })

  it("should handle same strings", () => {
    const original = "This is a test"
    const correction = "This is a test"
    const expected = [
      { original: "This", correction: "This" },
      { original: "is", correction: "is" },
      { original: "a", correction: "a" },
      { original: "test", correction: "test" },
    ]
    expect(getWordDiff(original, correction)).toEqual(expected)
  })

  it("should handle different strings", () => {
    const original =
      "flavoured rehydrated textured soya protein (45%) (water, textured soya protein, oyster mushroom in juice (oyster mushroom, water, salt), flavourings, salt, barley malt extract, onion powder, garlic purée, ground black pepper, sugar, dried parsley, ground bay leaf, ground thyme, leek powder), flavoured rehydrated textured pea protein (24%) (water, textured pea protein (pea protein, pea fibre), flavourings, salt,  barley malt extract, onion powder, garlic purée, ground black pepper, sugar, dried parsley, ground thyme, ground bay leaf, leek powder), coconut oil, water, vegetable oil (sunflower oil, rapeseed oil), gelling agent: methyl cellulose, potato starch, bamboo fibre, pea fibre, allergy advice: for allergens, see underlined ingredients in bold, made to a vegan recipe, these products are not suitable for milk and wheat allergy sufferers because these allergens are present in the manufacturing  environment, suitable for vegans allergy update"
    const correction =
      "flavoured rehydrated textured soya protein (45%) (water, textured soya protein, oyster mushroom in juice (oyster mushroom, water, salt), flavourings, salt, barley malt extract, onion powder, garlic purée, ground black pepper, sugar, dried parsley, ground bay leaf, ground thyme, leek powder), flavoured rehydrated textured pea protein (24%) (water, textured pea protein (pea protein, pea fibre), flavourings, salt, barley malt extract, onion powder, garlic purée, ground black pepper, sugar, dried parsley, ground thyme, ground bay leaf, leek powder), coconut oil, water, vegetable oil (sunflower oil, rapeseed oil), gelling agent: methyl cellulose, potato starch, bamboo fibre, pea fibre, allergy advice: for allergens, see underlined ingredients in bold, made to a vegan recipe, these products are not suitable for milk and wheat allergy sufferers because these allergens are present in the manufacturing environment, suitable for vegans allergy update"
    const expected: WordDiff[] = []

    const result = getWordDiff(original, correction)

    console.log(JSON.stringify(result, null, 2))
  })
})
