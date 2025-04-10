import { openfoodfactsApiUrl } from "../signals/openfoodfacts"
import { BaseProductResponse, RequestProductParams } from "../types/openfoodfacts"
import { addParamsToUrl } from "../utils"

const getUrl = (path: string, params?: Record<string, any>) => {
  const url = `${openfoodfactsApiUrl.get()}${path}`
  if (!params) {
    return url
  }
  return addParamsToUrl(url, params)
}

export async function fetchProduct<T>(productCode: string, params: RequestProductParams) {
  const url = getUrl(`/product/${productCode}/`, params)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch product knowledge panels")
  }
  return (await response.json()) as BaseProductResponse<T>
}
