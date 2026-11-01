import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesDir = path.resolve(__dirname, "../src/localization/dist/locales")

if (!fs.existsSync(localesDir)) {
  console.log(`Locales directory ${localesDir} does not exist. Skipping fix.`)
  process.exit(0)
}

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".ts"))
let fixedCount = 0

for (const file of files) {
  const filePath = path.join(localesDir, file)
  const content = fs.readFileSync(filePath, "utf8")

  // Replace &amp; with & only inside string templates starting with 's' (plain strings or str`...`)
  // Lines match: 's[0-9a-f]+': `...` or 's[0-9a-f]+': str`...`
  const updatedContent = content.replace(
    /('s[0-9a-f]+':\s*(?:str)?`)([\s\S]*?)(`,)/g,
    (_match, prefix, body, suffix) => {
      const fixedBody = body.replace(/&amp;/g, "&")
      return `${prefix}${fixedBody}${suffix}`
    }
  )

  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent, "utf8")
    fixedCount++
  }
}

console.log(`Sanitized &amp; in ${fixedCount} locale files.`)
