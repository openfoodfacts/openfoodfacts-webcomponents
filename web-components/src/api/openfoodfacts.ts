import { openfoodfactsApiUrl } from "../signals/openfoodfacts"
import type {
  BaseProductResponse,
  NutrientsOrderRequest,
  NutrientsParams,
  RequestProductParams,
  TaxonomyCategoryRequest,
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

/**
 * Fetch product data from openfoodfacts
 * @param categoryName category name in english
 * @returns The taxonomy category data
 */
export async function fetchTaxonomyCategory(categoryName: string) {
  const url = getUrl(`${ApiBaseUrl.API_V2}/taxonomy?tagtype=categories&tags=en:${categoryName}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch taxonomy category data")
  }
  return (await response.json()) as TaxonomyCategoryRequest
}
