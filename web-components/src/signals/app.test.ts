import { describe, it, expect, beforeEach } from "vitest"
import { assetsImagesPath, getImageUrl, countryCode, languageCode } from "../signals/app"
import { DEFAULT_ASSETS_IMAGES_PATH, DEFAULT_COUNTRY_CODE, DEFAULT_LANGUAGE_CODE } from "../constants"

describe("App Signals", () => {
  beforeEach(() => {
    // Reset signals to default values
    assetsImagesPath.set(DEFAULT_ASSETS_IMAGES_PATH)
    countryCode.set(DEFAULT_COUNTRY_CODE)
    languageCode.set(DEFAULT_LANGUAGE_CODE)
  })

  describe("assetsImagesPath signal", () => {
    it("should have default value", () => {
      expect(assetsImagesPath.get()).toBe(DEFAULT_ASSETS_IMAGES_PATH)
    })

    it("should be reactive to changes", () => {
      const newPath = "/custom/assets/path"
      assetsImagesPath.set(newPath)
      expect(assetsImagesPath.get()).toBe(newPath)
    })

    it("should handle empty string", () => {
      assetsImagesPath.set("")
      expect(assetsImagesPath.get()).toBe("")
    })

    it("should handle paths with trailing slashes", () => {
      const pathWithSlash = "/assets/images/"
      assetsImagesPath.set(pathWithSlash)
      expect(assetsImagesPath.get()).toBe(pathWithSlash)
    })

    it("should handle relative paths", () => {
      const relativePath = "../assets/images"
      assetsImagesPath.set(relativePath)
      expect(assetsImagesPath.get()).toBe(relativePath)
    })

    it("should handle absolute URLs", () => {
      const absoluteUrl = "https://cdn.example.com/assets"
      assetsImagesPath.set(absoluteUrl)
      expect(assetsImagesPath.get()).toBe(absoluteUrl)
    })
  })

  describe("getImageUrl function", () => {
    it("should combine assets path with file name", () => {
      const fileName = "logo.svg"
      const expected = `${DEFAULT_ASSETS_IMAGES_PATH}/${fileName}`
      expect(getImageUrl(fileName)).toBe(expected)
    })

    it("should react to changes in assetsImagesPath", () => {
      const customPath = "/custom/path"
      const fileName = "icon.png"
      
      assetsImagesPath.set(customPath)
      
      expect(getImageUrl(fileName)).toBe(`${customPath}/${fileName}`)
    })

    it("should handle empty file names", () => {
      expect(getImageUrl("")).toBe(`${DEFAULT_ASSETS_IMAGES_PATH}/`)
    })

    it("should handle file names with extensions", () => {
      const fileName = "image.jpg"
      expect(getImageUrl(fileName)).toBe(`${DEFAULT_ASSETS_IMAGES_PATH}/${fileName}`)
    })

    it("should handle file names without extensions", () => {
      const fileName = "image"
      expect(getImageUrl(fileName)).toBe(`${DEFAULT_ASSETS_IMAGES_PATH}/${fileName}`)
    })

    it("should handle file names with paths", () => {
      const fileName = "icons/arrow.svg"
      expect(getImageUrl(fileName)).toBe(`${DEFAULT_ASSETS_IMAGES_PATH}/${fileName}`)
    })

    it("should handle file names with special characters", () => {
      const fileName = "image with spaces & symbols.png"
      expect(getImageUrl(fileName)).toBe(`${DEFAULT_ASSETS_IMAGES_PATH}/${fileName}`)
    })

    it("should handle assets path without trailing slash", () => {
      assetsImagesPath.set("/assets")
      const fileName = "image.png"
      expect(getImageUrl(fileName)).toBe("/assets/image.png")
    })

    it("should handle assets path with trailing slash", () => {
      assetsImagesPath.set("/assets/")
      const fileName = "image.png"
      expect(getImageUrl(fileName)).toBe("/assets//image.png") // Double slash - might be a bug in implementation
    })

    it("should work with CDN URLs", () => {
      assetsImagesPath.set("https://cdn.example.com/assets")
      const fileName = "logo.svg"
      expect(getImageUrl(fileName)).toBe("https://cdn.example.com/assets/logo.svg")
    })
  })

  describe("countryCode signal", () => {
    it("should have default value", () => {
      expect(countryCode.get()).toBe(DEFAULT_COUNTRY_CODE)
    })

    it("should be reactive to changes", () => {
      const newCountryCode = "us"
      countryCode.set(newCountryCode)
      expect(countryCode.get()).toBe(newCountryCode)
    })

    it("should handle uppercase country codes", () => {
      countryCode.set("US")
      expect(countryCode.get()).toBe("US")
    })

    it("should handle lowercase country codes", () => {
      countryCode.set("de")
      expect(countryCode.get()).toBe("de")
    })

    it("should handle empty string", () => {
      countryCode.set("")
      expect(countryCode.get()).toBe("")
    })

    it("should handle null and undefined", () => {
      countryCode.set(null as any)
      expect(countryCode.get()).toBe(null)
      
      countryCode.set(undefined as any)
      expect(countryCode.get()).toBe(undefined)
    })

    it("should handle long country codes", () => {
      const longCode = "world-wide-country-code"
      countryCode.set(longCode)
      expect(countryCode.get()).toBe(longCode)
    })
  })

  describe("languageCode signal", () => {
    it("should have default value", () => {
      expect(languageCode.get()).toBe(DEFAULT_LANGUAGE_CODE)
    })

    it("should be reactive to changes", () => {
      const newLanguageCode = "fr"
      languageCode.set(newLanguageCode)
      expect(languageCode.get()).toBe(newLanguageCode)
    })

    it("should handle different language codes", () => {
      const testCodes = ["es", "de", "it", "pt", "ja", "zh"]
      
      testCodes.forEach(code => {
        languageCode.set(code)
        expect(languageCode.get()).toBe(code)
      })
    })

    it("should handle language codes with regions", () => {
      const codeWithRegion = "en-US"
      languageCode.set(codeWithRegion)
      expect(languageCode.get()).toBe(codeWithRegion)
    })

    it("should handle empty string", () => {
      languageCode.set("")
      expect(languageCode.get()).toBe("")
    })

    it("should handle null and undefined", () => {
      languageCode.set(null as any)
      expect(languageCode.get()).toBe(null)
      
      languageCode.set(undefined as any)
      expect(languageCode.get()).toBe(undefined)
    })
  })

  describe("signal interactions", () => {
    it("should allow independent changes to different signals", () => {
      const newAssetsPath = "/new/assets"
      const newCountry = "jp"
      const newLanguage = "ja"
      
      assetsImagesPath.set(newAssetsPath)
      countryCode.set(newCountry)
      languageCode.set(newLanguage)
      
      expect(assetsImagesPath.get()).toBe(newAssetsPath)
      expect(countryCode.get()).toBe(newCountry)
      expect(languageCode.get()).toBe(newLanguage)
    })

    it("should handle rapid successive changes", () => {
      const values = ["value1", "value2", "value3", "value4", "value5"]
      
      values.forEach(value => {
        languageCode.set(value)
        expect(languageCode.get()).toBe(value)
      })
    })

    it("should maintain consistency during concurrent-like operations", () => {
      // Simulate rapid changes to different signals
      assetsImagesPath.set("/path1")
      countryCode.set("country1")
      languageCode.set("lang1")
      
      assetsImagesPath.set("/path2")
      countryCode.set("country2")
      languageCode.set("lang2")
      
      expect(assetsImagesPath.get()).toBe("/path2")
      expect(countryCode.get()).toBe("country2")
      expect(languageCode.get()).toBe("lang2")
    })
  })

  describe("edge cases and error handling", () => {
    it("should handle very long paths and codes", () => {
      const longPath = "/".repeat(1000)
      const longCountry = "x".repeat(1000)
      const longLanguage = "y".repeat(1000)
      
      assetsImagesPath.set(longPath)
      countryCode.set(longCountry)
      languageCode.set(longLanguage)
      
      expect(assetsImagesPath.get()).toBe(longPath)
      expect(countryCode.get()).toBe(longCountry)
      expect(languageCode.get()).toBe(longLanguage)
    })

    it("should handle special characters and unicode", () => {
      const specialPath = "/assets/测试/ñáéí/🚀"
      const specialCountry = "测试"
      const specialLanguage = "español"
      
      assetsImagesPath.set(specialPath)
      countryCode.set(specialCountry)
      languageCode.set(specialLanguage)
      
      expect(assetsImagesPath.get()).toBe(specialPath)
      expect(countryCode.get()).toBe(specialCountry)
      expect(languageCode.get()).toBe(specialLanguage)
    })

    it("should handle numeric-like strings", () => {
      assetsImagesPath.set("123456")
      countryCode.set("42")
      languageCode.set("99")
      
      expect(assetsImagesPath.get()).toBe("123456")
      expect(countryCode.get()).toBe("42")
      expect(languageCode.get()).toBe("99")
    })

    it("should handle boolean-like strings", () => {
      assetsImagesPath.set("true")
      countryCode.set("false")
      languageCode.set("undefined")
      
      expect(assetsImagesPath.get()).toBe("true")
      expect(countryCode.get()).toBe("false")
      expect(languageCode.get()).toBe("undefined")
    })
  })

  describe("constants integration", () => {
    it("should use correct default constants", () => {
      expect(DEFAULT_ASSETS_IMAGES_PATH).toBe("/assets/images")
      expect(DEFAULT_COUNTRY_CODE).toBe("fr")
      expect(DEFAULT_LANGUAGE_CODE).toBe("en")
    })

    it("should respect defaults after reset", () => {
      // Change values
      assetsImagesPath.set("/custom")
      countryCode.set("us")
      languageCode.set("es")
      
      // Reset to defaults
      assetsImagesPath.set(DEFAULT_ASSETS_IMAGES_PATH)
      countryCode.set(DEFAULT_COUNTRY_CODE)
      languageCode.set(DEFAULT_LANGUAGE_CODE)
      
      // Verify defaults are restored
      expect(assetsImagesPath.get()).toBe(DEFAULT_ASSETS_IMAGES_PATH)
      expect(countryCode.get()).toBe(DEFAULT_COUNTRY_CODE)
      expect(languageCode.get()).toBe(DEFAULT_LANGUAGE_CODE)
    })
  })
})