export type RequestProductParams = {
  lc: string
  fields: string[]
}

// type for the response of the product API
// {"code":"3512030013211","product":{"image_ingredients_url":"https://images.openfoodfacts.org/images/products/351/203/001/3211/ingredients_en.18.400.jpg","schema_version":998},"status":1,"status_verbose":"product found"}
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
