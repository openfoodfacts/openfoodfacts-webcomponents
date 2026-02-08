import type { IngredientDetection } from "../types/robotoff"

export interface IngredientHighlight {
  text: string
  confidence: number
  isLowConfidence: boolean
}

export const CONFIDENCE_THRESHOLD = 60 

export function isLowConfidence(score: number): boolean {
  return score < CONFIDENCE_THRESHOLD
}

export function parseIngredients(
  text: string,
  ingredients: IngredientDetection[]
): IngredientHighlight[] {
  if (!ingredients || ingredients.length === 0) {
    // Fallback: show each word from text as separate ingredient
    const words = text.split(/[\s,]+/).filter((w) => w.length > 0)
    return words.map((word) => ({
      text: word,
      confidence: 0,
      isLowConfidence: true,
    }))
  }

  // Process ingredients - search for them in text to find correct positions
  const processedIngredients = ingredients.map((ing) => {
    // Try to find the ingredient text in the main text (case insensitive)
    const searchText = ing.text.toLowerCase()
    const mainText = text.toLowerCase()
    const start = mainText.indexOf(searchText)

    if (start !== -1) {
      return {
        ...ing,
        start,
        end: start + ing.text.length,
      }
    }

    // If not found, use original values or defaults
    return {
      ...ing,
      start: ing.start ?? 0,
      end: ing.end ?? ing.text.length,
    }
  })

  // Sort ingredients by their position in the text
  const sortedIngredients = [...processedIngredients]
    .filter((ing) => ing.start !== undefined && ing.end !== undefined)
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0))

  // Remove duplicates (same text appearing multiple times)
  const seen = new Set<string>()
  const uniqueIngredients = sortedIngredients.filter((ing) => {
    const key = ing.text.toLowerCase()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })

  // Map to highlights, preserving order in text
  return uniqueIngredients.map((ingredient) => {
    // Handle both decimal (0.45) and percentage (45) formats
    let confidence = ingredient.percent_estimate ?? 0
    if (confidence <= 1 && confidence > 0) {
      confidence = confidence * 100
    }
    return {
      text: ingredient.text,
      confidence: Math.round(confidence),
      isLowConfidence: isLowConfidence(confidence),
    }
  })
}

export function highlightLowConfidence(
  text: string,
  ingredients: IngredientDetection[]
): string {
  const highlights = parseIngredients(text, ingredients)

  return highlights
    .map((item) => {
      if (item.isLowConfidence) {
        return `[LOW:${item.confidence}:${item.text}]`
      }
      return item.text
    })
    .join("")
}
