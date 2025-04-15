export interface ProductProperty {
  k: string
  v: string
  owner: string
  version: number
  product: string
  editor: string
  last_edit: string
  comment: string
}

export interface FetchProductPropertiesResponse extends Array<ProductProperty> {}

export interface AddProductPropertyResponse {
  key: string
  value: string
  version: number
}

export interface DeleteProductPropertyResponse {
  success: boolean
}

export interface UpdateProductPropertyResponse {
  key: string
  value: string
  version: number
}

export interface ErrorDetail {
  loc: [string, number]
  msg: string
  type: string
}

export interface ErrorResponse {
  detail: ErrorDetail[]
}
