export type RequestProductParams = {
  lc: string
  fields: string[]
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
