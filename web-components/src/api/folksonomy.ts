import {
  FetchProductPropertiesResponse,
  AddProductPropertyResponse,
  DeleteProductPropertyResponse,
  UpdateProductPropertyResponse,
} from "../types/folksonomy"
import { folksonomyConfiguration } from "../signals/folksonomy"

/**
 * Get the API URL for a given path with the current configuration
 * @param path
 * @returns {string}
 */

const getApiUrl = (path: string) => {
  return `${folksonomyConfiguration.getItem("apiUrl")}${path}`
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
    const response = await fetch(getApiUrl("/product"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
      body: JSON.stringify({ product, ...{ k, v, version } }),
      credentials: "include",
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
    const response = await fetch(getApiUrl(`/product/${product}/${k}?version=${version}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
      credentials: "include",
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
    const response = await fetch(getApiUrl("/product"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
      body: JSON.stringify({ product, ...{ k, v, version: version + 1 } }),
      credentials: "include",
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
    const response = await fetch(getApiUrl(`/keys`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { k: string; count: number; values: number }[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching keys:", error);
    throw error;
  }
}

async function fetchValues(key: string): Promise<{ v: string; product_count: number; }[]> {
  try {
    const response = await fetch(getApiUrl(`/values/${key}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      } as HeadersInit,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { value: string; count: number }[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching values:", error);
    throw error;
  }
}

export default {
  fetchProductProperties,
  addProductProperty,
  deleteProductProperty,
  updateProductProperty,
  fetchKeys,
  fetchValues
}
