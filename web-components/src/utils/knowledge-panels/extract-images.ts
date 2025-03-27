import {
  KnowledgePanelsData,
  KnowledgePanel,
  KnowledgePanelElement,
} from "../../types/knowledge-panel"

/**
 * Extracts images from all panels
 * @param panels - The knowledge panels data
 * @returns Array of image URLs
 */
export function extractImages(panels: KnowledgePanelsData): string[] {
  const nutritionImages: string[] = []

  // First look for the nutrition panel
  let nutritionPanel: KnowledgePanel | null = null
  for (const panelId in panels) {
    const panel = panels[panelId]
    if (
      panel.title === "Nutrition" ||
      panel.title === "Nutrition facts" ||
      panel.title_element?.title === "Nutrition" ||
      panel.title_element?.title === "Nutrition facts"
    ) {
      nutritionPanel = panel
      break
    }
  }

  // If we found a nutrition panel, extract all images from it and all sub-panels
  if (nutritionPanel && nutritionPanel.elements) {
    // Process all elements in the nutrition panel
    for (const element of nutritionPanel.elements) {
      // Process text elements that might contain HTML with images
      if (element.element_type === "text" && element.text_element?.html) {
        const htmlContent = element.text_element.html
        const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
        let match
        while ((match = imgRegex.exec(htmlContent)) !== null) {
          if (match[1]) {
            nutritionImages.push(match[1])
          }
        }
      }

      // Process panel group elements with images
      if (element.element_type === "panel_group" && element.panel_group_element?.image) {
        const image = element.panel_group_element.image
        const imageUrl = image.sizes?.["400"]?.url || image.sizes?.["full"]?.url
        if (imageUrl) {
          nutritionImages.push(imageUrl)
        }
      }

      // Check nested elements
      if (element.elements) {
        extractNestedImages(element.elements, nutritionImages)
      }

      // Check referenced panels
      if (element.element_type === "panel" && element.panel_element?.panel_id) {
        const referencedPanel = panels[element.panel_element.panel_id]
        if (referencedPanel && referencedPanel.elements) {
          extractNestedImages(referencedPanel.elements, nutritionImages)
        }
      }
    }
  }

  // Look through all panels if we didn't find any nutrition images
  if (nutritionImages.length === 0) {
    for (const panelId in panels) {
      const panel = panels[panelId]
      if (panel.elements) {
        extractNestedImages(panel.elements, nutritionImages)
      }
    }
  }

  console.log("Extracted nutrition images:", nutritionImages)
  return nutritionImages
}

/**
 * Helper to extract images from nested elements
 * @param elements - Array of panel elements to process
 * @param nutritionImages - Array to collect image URLs
 */
function extractNestedImages(elements: KnowledgePanelElement[], nutritionImages: string[]): void {
  for (const element of elements) {
    // Process text elements that might contain HTML with images
    if (element.element_type === "text" && element.text_element?.html) {
      const htmlContent = element.text_element.html
      const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
      let match
      while ((match = imgRegex.exec(htmlContent)) !== null) {
        if (match[1]) {
          nutritionImages.push(match[1])
        }
      }
    }

    // Process panel group elements with images
    if (element.element_type === "panel_group" && element.panel_group_element?.image) {
      const image = element.panel_group_element.image
      const imageUrl = image.sizes?.["400"]?.url || image.sizes?.["full"]?.url
      if (imageUrl) {
        nutritionImages.push(imageUrl)
      }
    }

    // Recursively process nested elements
    if (element.elements) {
      extractNestedImages(element.elements, nutritionImages)
    }
  }
}
