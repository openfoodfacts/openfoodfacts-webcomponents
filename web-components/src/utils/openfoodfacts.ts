import { STATIC_HOST } from "../constants"

export enum ProductFields {
  IMAGE_INGREDIENTS_URL = "image_ingredients_url",
  IMAGES = "images",
  PRODUCT_NAME = "product_name",
  NUTRIMENTS = "nutriments",
}

/**
 * Return the original image ID from a Robotoff source-image path.
 *
 * Robotoff nutrient insights use original image paths such as
 * `/890/149/100/2165/2.jpg`, whose final numeric segment matches a key in
 * the product API's `images` object. Derived or selected-image URLs are not
 * mapped, because their timestamps are ambiguous.
 */
export const getOriginalImageId = (sourceImage?: string | null) => {
  const fileName = sourceImage?.split("/").pop()
  return fileName?.match(/^(\d+)\.(?:jpe?g|png)$/i)?.[1]
}
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

export const KP_ATTRIBUTE_IMG = (img: string) => `${STATIC_HOST}/images/attributes/dist/${img}`
