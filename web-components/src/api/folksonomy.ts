const BASE_URL = "https://api.folksonomy.openfoodfacts.org" // Base URL for the API

const headers = {
  Authorization: "<TOKEN>",
}

async function fetchProductProperties(product: string) {
  try {
    const response = await fetch(`${BASE_URL}/product/${product}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching product properties:", error)
    throw error
  }
}

async function addProductProperty(product: string, k: string, v: string) {
  try {
    const response = await fetch(`${BASE_URL}/product`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product, ...{ k, v } }),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error adding product property:", error)
    throw error
  }
}

async function deleteProductProperty(product: string, key: string) {
  try {
    const response = await fetch(`${BASE_URL}/product/${product}/${key}`, {
      method: "DELETE",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
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

async function updateProductProperty(product: string, property: { key: string; value: string }) {
  try {
    const response = await fetch(`${BASE_URL}/product`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product, ...property }),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error updating product property:", error)
    throw error
  }
}

export default {
  fetchProductProperties,
  addProductProperty,
  deleteProductProperty,
  updateProductProperty,
}
