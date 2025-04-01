// Script Name: check-appstore-badges.js
// Description: This script checks for the presence of App Store badge images for various languages based on the configuration in 'lit-localize.json'. It identifies missing images, lists languages with badges present, and reports unused image files in the directory.

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const currentFilePath = fileURLToPath(import.meta.url)
const basePath = path.join(path.dirname(currentFilePath), "..")

// Read the lit-localize.json file
const litLocalizeConfig = JSON.parse(
  fs.readFileSync(path.join(basePath, "lit-localize.json"), "utf8")
)
const languages = [...litLocalizeConfig.targetLocales, litLocalizeConfig.sourceLocale]

// Read all files present in the src/assets/images/appstore/black directory
const imageDir = path.join(basePath, `src/assets/images/appstore/black/`)
const imageFiles = fs.readdirSync(imageDir)
const imageFilesSet = new Set(imageFiles)

// Function to check if image exists
const imageExists = (imagePath) => {
  return fs.existsSync(imagePath)
}

// Function to get iOS app file name for a language
const getIosAppFileName = (language) => {
  const fileName = `appstore_${language.toUpperCase()}.svg`
  return fileName
}

// Function to get iOS app icon path for a language
const getIosAppIconPath = (fileName) => {
  const imagePath = path.join(imageDir, fileName)
  return imagePath
}

// Check for missing images
const missingImages = []
const presentImages = []

languages.forEach((language) => {
  const fileName = getIosAppFileName(language)
  const imagePath = getIosAppIconPath(fileName)

  if (!imageExists(imagePath)) {
    missingImages.push({
      language,
    })
  } else {
    presentImages.push({
      language,
    })

    // Remove the file name from the set which is present
    imageFilesSet.delete(fileName)
  }
})

// Print statistics
console.log(`Total languages: ${languages.length}`)
console.log(`Languages with badges present: ${presentImages.length}`)
console.log(`Languages with badges missing: ${missingImages.length}\n`)

// Print detailed results for missing images
if (missingImages.length === 0) {
  console.log("All App Store badge images are present!")
} else {
  console.log("Missing App Store badge images:")
  console.log(missingImages.map(({ language }) => language).join(", "))
}

// Print languages with badges present
if (presentImages.length > 0) {
  console.log("\nLanguages with badges present:")
  console.log(presentImages.map(({ language }) => language).join(", "))
}

// Print image names that are not getting used
if (imageFilesSet.size > 0) {
  console.log(`\nTotal images that are not getting used: ${imageFilesSet.size}`)
  console.log("\nUnused image names:")
  console.log(Array.from(imageFilesSet).join(", "))
}
