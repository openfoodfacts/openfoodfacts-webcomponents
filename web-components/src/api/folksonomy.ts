const BASE_URL = "https://api.folksonomy.openfoodfacts.org" // Base URL for the API

function getAuthHeader() {
  const token = localStorage.getItem("bearer")
  if (!token) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
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

async function addProductProperty(product: string, k: string, v: string, version: number) {
  try {
    const response = await fetch(`${BASE_URL}/product`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      } as HeadersInit,
      body: JSON.stringify({ product, ...{ k, v, version: version + 1 } }),
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

async function deleteProductProperty(product: string, k: string, version: number) {
  try {
    const response = await fetch(`${BASE_URL}/product/${product}/${k}?version=${version}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
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

async function updateProductProperty(product: string, k: string, v: string, version: number) {
  try {
    const response = await fetch(`${BASE_URL}/product`, {
      method: "PUT",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      } as HeadersInit,
      body: JSON.stringify({ product, ...{ k, v, version: version + 1 } }),
    })

    console.log("headers:", {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    })

    console.log("requestBody: ", JSON.stringify({ product, ...{ k, v } }))

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

async function signIn(username: string, password: string) {
  try {
    const body = new URLSearchParams({
      username,
      password,
    }).toString()

    const response = await fetch(`${BASE_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error signing In", error)
    throw error
  }
}

export default {
  fetchProductProperties,
  addProductProperty,
  deleteProductProperty,
  updateProductProperty,
  signIn,
}
