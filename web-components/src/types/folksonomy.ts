export type FolksonomyConfigurationOptions = {
  apiUrl: string
}

export interface AuthByCookieResponse {
  access_token: string
  token_type: string
}

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

export interface ValueRenameRequest {
  property: string
  old_value: string
  new_value: string
}

export interface ValueDeleteRequest {
  property: string
  value: string
}

export interface UserInfo {
  user_id: string
  admin: boolean
  moderator: boolean
  user: boolean
}
