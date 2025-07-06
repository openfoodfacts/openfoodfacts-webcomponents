import {
  FetchProductPropertiesResponse,
  AddProductPropertyResponse,
  DeleteProductPropertyResponse,
  UpdateProductPropertyResponse,
  AuthByCookieResponse,
} from "../types/folksonomy"
import { folksonomyConfiguration } from "../signals/folksonomy"

// Constants for localStorage
const FOLKSONOMY_BEARER_TOKEN_KEY = "folksonomy-bearer-token"
const FOLKSONOMY_BEARER_DATE_KEY = "folksonomy-token-date"

/**
 * Get the API URL for a given path with the current configuration
 * @param path
 * @returns {string}
 */

const getApiUrl = (path: string) => {
  return `${folksonomyConfiguration.getItem("apiUrl")}${path}`
}

/**
 * Get stored token from localStorage
 * @returns {string | null}
 */
function getStoredToken(): string | null {
  return localStorage.getItem(FOLKSONOMY_BEARER_TOKEN_KEY)
}

/**
 * Save token to localStorage
 * @param token
 */
function saveTokenToStorage(token: string) {
  localStorage.setItem(FOLKSONOMY_BEARER_TOKEN_KEY, token)
  localStorage.setItem(FOLKSONOMY_BEARER_DATE_KEY, new Date().getTime().toString())
}

/**
 * Clear token from localStorage
 */
function clearStoredToken() {
  localStorage.removeItem(FOLKSONOMY_BEARER_TOKEN_KEY)
  localStorage.removeItem(FOLKSONOMY_BEARER_DATE_KEY)
}

/**
 * Authenticate by cookie and get access token
 * @returns {Promise<AuthByCookieResponse>}
 */
async function authByCookie(): Promise<AuthByCookieResponse> {
  try {
    const response = await fetch(getApiUrl("/auth_by_cookie"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
      credentials: "include",
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: AuthByCookieResponse = await response.json()
    
    // Save token to localStorage
    if (data.access_token) {
      saveTokenToStorage(data.access_token)
    }
    
    return data
  } catch (error) {
    console.error("Error authenticating by cookie:", error)
    clearStoredToken()
    throw error
  }
}

/**
 * Get valid access token - check localStorage first, then authenticate if needed
 * @returns {Promise<string>}
 */
async function getValidToken(): Promise<string> {
  const storedToken = getStoredToken()
  if (storedToken) {
    console.log("Using stored token from localStorage")
    return storedToken
  }
  
  // No stored token, authenticate
  console.log("No stored token, authenticating...")
  const authResponse = await authByCookie()
  return authResponse.access_token
}

/**
 * Make authenticated request with retry logic
 * @param url
 * @param options
 * @returns {Promise<Response>}
 */
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getValidToken()
  
  const requestOptions = {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
    },
  }
  
  const response = await fetch(url, requestOptions)
  
  // If auth fails (401/403), try once more with fresh token
  if (response.status === 401 || response.status === 403) {
    console.error("Auth failed, retrying with fresh token...")
    clearStoredToken()
    const newToken = await getValidToken()
    
    const retryOptions = {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${newToken}`,
      },
    }
    
    return fetch(url, retryOptions)
  }
  
  return response
}

async function fetchProductProperties(product: string): Promise<FetchProductPropertiesResponse> {
  try {
    const response = await fetch(getApiUrl(`/product/${product}`))
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: FetchProductPropertiesResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching product properties:", error)
    throw error
  }
}

async function addProductProperty(
  product: string,
  k: string,
  v: string,
  version: number
): Promise<AddProductPropertyResponse> {
  try {
    const response = await makeAuthenticatedRequest(getApiUrl("/product"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
      body: JSON.stringify({ product, ...{ k, v, version } }),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return { key: k, value: v, version: 1 }
  } catch (error) {
    console.error("Error adding product property:", error)
    throw error
  }
}

async function deleteProductProperty(
  product: string,
  k: string,
  version: number
): Promise<DeleteProductPropertyResponse> {
  try {
    const response = await makeAuthenticatedRequest(getApiUrl(`/product/${product}/${k}?version=${version}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return { success: true }
  } catch (error) {
    console.error("Error deleting product property:", error)
    throw error
  }
}

async function updateProductProperty(
  product: string,
  k: string,
  v: string,
  version: number
): Promise<UpdateProductPropertyResponse> {
  try {
    const response = await makeAuthenticatedRequest(getApiUrl("/product"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
      body: JSON.stringify({ product, ...{ k, v, version: version + 1 } }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return { key: k, value: v, version: version + 1 }
  } catch (error) {
    console.error("Error updating product property:", error)
    throw error
  }
}

async function fetchKeys(): Promise<{ k: string; count: number; values: number }[]> {
  try {
    const response = await fetch(getApiUrl("/keys"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: { k: string; count: number; values: number }[] = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching keys:", error)
    throw error
  }
}

async function fetchValues(key: string): Promise<{ v: string; product_count: number }[]> {
  try {
    const response = await fetch(getApiUrl(`/values/${key}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: { v: string; product_count: number }[] = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching values:", error)
    throw error
  }
}

export default {
  fetchProductProperties,
  addProductProperty,
  deleteProductProperty,
  updateProductProperty,
  fetchKeys,
  fetchValues,
  authByCookie,
}
