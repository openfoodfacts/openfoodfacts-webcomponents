import fs from "fs"

const API_URL = "https://static.openfoodfacts.org/data/taxonomies/countries.json"

export const getCountries = async () => {
  const response = await fetch(API_URL)
  const data = await response.json()
  return data
}

export const getLanguageCodes = async () => {
  const countries = await getCountries()
  const languageCodes = Object.values(countries)
    // filter countries that have no language code
    .filter((country) => country.language_codes?.en)
    // get language codes
    .map((country) => {
      return country.language_codes.en.split(",")
    })
    // flatten array because language_codes is a string with comma separated values
    .flat()
    // remove english language code because it's the default language
    .filter((languageCode) => languageCode !== "en")

  // remove duplicates
  return [...new Set(languageCodes)]
}

export const updateLitLocalizeJsonFile = async () => {
  const languageCodes = await getLanguageCodes()

  const litLocalizeJson = fs.readFileSync("./lit-localize.json", "utf8")
  const litLocalizeJsonParsed = JSON.parse(litLocalizeJson)
  litLocalizeJsonParsed.targetLocales = languageCodes
  //overwrite lit-localize.json file
  fs.writeFileSync("./lit-localize.json", JSON.stringify(litLocalizeJsonParsed, null, 2))
}

updateLitLocalizeJsonFile()
