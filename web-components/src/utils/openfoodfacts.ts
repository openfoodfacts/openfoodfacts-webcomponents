/**
 * Gets the full image URL by replacing the '400.jpg' suffix with 'full.jpg'.
 * @param {string} imageUrl - The original image URL.
 * @returns {string} The full image URL.
 */
export const getFullImageUrl = (imageUrl?: string): string | undefined => {
  if (!imageUrl) {
    return undefined
  }
  return imageUrl.replace(/400.jpg$/, "full.jpg")
}
