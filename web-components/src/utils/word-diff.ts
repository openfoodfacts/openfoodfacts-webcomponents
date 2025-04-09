// import { diffWords, Change } from "diff"

import { WordDiff } from "../types"

// export function getWordDiff(
//   original: string,
//   correction: string
// ): { original: string; correction: string }[] {
//   const diff: Change[] = diffWords(original, correction)
//   const result: { original: string; correction: string }[] = []

//   diff.forEach((part: Change) => {
//     if (part.removed) {
//       result.push({ original: part.value.trim(), correction: "" })
//     } else if (part.added) {
//       result.push({ original: "", correction: part.value.trim() })
//     } else {
//       result.push({ original: part.value.trim(), correction: part.value.trim() })
//     }
//   })

//   return result
// }

/**
 * Compare two strings word by word and return an array of differences
 * @param {string} original - The original string
 * @param {string} correction - The corrected string
 * @returns {Array<{original: string, correction: string}>} - Array of word differences
 */
export function getWordDiff(original: string, correction: string): WordDiff[] {
  const originalWords = original.split(/\s+/)
  const correctionWords = correction.split(/\s+/)

  // Find the maximum length to iterate through
  const maxLength = Math.max(originalWords.length, correctionWords.length)

  // Create the result array
  const result = []

  // Compare words at each position
  for (let i = 0; i < maxLength; i++) {
    const originalWord = i < originalWords.length ? originalWords[i] : ""
    const correctionWord = i < correctionWords.length ? correctionWords[i] : ""

    result.push({
      original: originalWord,
      correction: correctionWord,
    })
  }

  return result
}
