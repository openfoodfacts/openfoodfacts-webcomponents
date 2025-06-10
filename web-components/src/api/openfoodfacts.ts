// import { openfoodfactsApiUrl } from "../signals/openfoodfacts"
import { signal } from "@lit-labs/signals"

export const DEFAULT_OPENFOODFACTS_API_URL = "https://world.openfoodfacts.org"
export const openfoodfactsApiUrl = signal(DEFAULT_OPENFOODFACTS_API_URL)

import {
  BaseProductResponse,
  NutrientsOrderRequest,
  NutrientsParams,
  RequestProductParams,
} from "../types/openfoodfacts"
import { addParamsToUrl } from "../utils"

enum ApiBaseUrl {
  CGI = "/cgi",
  API_V2 = "/api/v2",
}

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
  const url = getUrl(`${ApiBaseUrl.API_V2}/product/${productCode}/`, params)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch product data")
  }
  return (await response.json()) as BaseProductResponse<T>
}

/**
 * Fetch nutrients order from openfoodfacts
 * @param params The params to add to the url
 * @returns The nutrients order
 */
export async function fetchNutrientsOrder(params: NutrientsParams) {
  const url = getUrl(`${ApiBaseUrl.CGI}/nutrients.pl`, params)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch nutrients order")
  }
  return (await response.json()) as NutrientsOrderRequest
}
