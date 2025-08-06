import { KnowledgePanelsData } from "../types/knowledge-panel"
import { languageCode } from "../signals/app"

/**
 * Fetches knowledge panels data from specified URL and extracts data at the given path
 * @param url The URL to fetch knowledge panels from
 * @param path The path to the knowledge panels in the JSON response
 * @returns The knowledge panels data
 */
export const fetchKnowledgePanels = async (
  url: string,
  path: string
): Promise<KnowledgePanelsData> => {
  try {

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Raw API response:", data)

    // Navigate through the path to find the knowledge panels
    let result = data
    const pathParts = path.split(".")

    for (const part of pathParts) {
      console.log(`Navigating to "${part}"`, result)
      if (result && typeof result === "object" && part in result) {
        result = result[part]
      } else {
        throw new Error(`Path "${path}" not found in the response data`)
      }
    }

    console.log("Final knowledge panels result:", result)
    return result as KnowledgePanelsData
  } catch (error) {
    console.error("Error fetching knowledge panels:", error)
    throw error
  }
}
