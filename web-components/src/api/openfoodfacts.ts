import { openfoodfactsApiUrl } from "../signals/openfoodfacts"
import { BaseProductResponse, RequestProductParams } from "../types/openfoodfacts"
import { addParamsToUrl } from "../utils"

/**
 * Get the url for the openfoodfacts api
 * @param path The path to the api
 * @param params The params to add to the url
 * @returns The url
 */
const getUrl = (path: string, params?: Record<string, any>) => {
  const url = `${openfoodfactsApiUrl.get()}${path}`
  if (!params) {
    return url
  }
  return addParamsToUrl(url, params)
}

/**
 * Fetch product data from openfoodfacts
 * @param productCode The product code
 * @param params The params to add to the url
 * @returns The product data
 */
export async function fetchProduct<T>(productCode: string, params: RequestProductParams) {
  const url = getUrl(`/product/${productCode}/`, params)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch product data")
  }
  return (await response.json()) as BaseProductResponse<T>
}
