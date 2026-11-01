import type { SearchQueryV2 } from "@openfoodfacts/openfoodfacts-nodejs"

export type RequestProductParams = {
  lc?: string
  fields: NonNullable<NonNullable<SearchQueryV2>["fields"]>
}

// type for the response of the product API
export type BaseProductType = {
  schema_version: number
}

export type BaseProductResponse<T> = {
  code: string
  status: number
  status_verbose: string
  product: T & BaseProductType
}

export type ImageIngredientsProductType = {
  image_ingredients_url: string
  product_name: string
}
export type NutrimentsData = Record<string, number | string>

export type NutrimentsProductType = {
  nutriments: NutrimentsData
  serving_size: string
}

export type NutrientsParams = Partial<{
  cc: string
  lc: string
}>

export interface NutrientOrderRequest {
  name: string
  important: boolean
  unit: string
  id: string
  display_in_edit_form: boolean
  nutrients?: NutrientOrderRequest[]
}

export interface NutrientsOrderRequest {
  nutrients: NutrientOrderRequest[]
}
