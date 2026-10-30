import { msg } from "@lit/localize"
import { openfoodfactsApiUrl } from "../../signals/openfoodfacts"

export const NUTRIPATROL_URL = "https://nutripatrol.openfoodfacts.org"

/**
 * Anchors of the Open Food Facts product edit form section matching each action.
 * An empty string links to the top of the edit form.
 * It mirrors the actions supported by Product Opener for knowledge panels.
 */
const EDIT_FORM_ANCHORS: Record<string, string> = {
  edit_product: "",
  add_categories: "#categories",
  add_ingredients_image: "#ingredients",
  add_ingredients_text: "#ingredients",
  add_nutrition_facts_image: "#nutrition",
  add_nutrition_facts: "#nutrition",
  add_packaging_image: "#packaging",
  add_packaging_text: "#packaging",
  add_packaging_components: "#packaging",
  add_origins: "#origins",
  add_quantity: "#product_characteristics",
  add_stores: "#stores",
  add_packager_codes_image: "#packager_codes",
  add_labels: "#labels",
  add_countries: "#countries",
}

/**
 * Get the localized label of a knowledge panel action
 * @param action - The action identifier (e.g. "add_categories")
 * @returns The label to display, or undefined if the action is unknown
 */
export const getKnowledgePanelActionLabel = (action: string): string | undefined => {
  switch (action) {
    case "edit_product":
      return msg("Complete or correct product information")
    case "add_categories":
      return msg("Add a category")
    case "add_ingredients_text":
      return msg("Add the ingredients")
    case "add_ingredients_image":
      return msg("Take a photo of the ingredients")
    case "add_nutrition_facts":
      return msg("Add nutrition facts")
    case "add_nutrition_facts_image":
    case "add_nutrition_image":
      return msg("Take a photo of the nutrition facts")
    case "add_packaging_image":
      return msg("Take a photo of the recycling information")
    case "add_packaging_text":
      return msg("Extract and check the recycling information")
    case "add_packaging_components":
      return msg("Add packaging components")
    case "add_origins":
      return msg("Add the origins of ingredients for this product")
    case "add_quantity":
      return msg("Add quantity of the product")
    case "add_stores":
      return msg("Add the store where you found this product")
    case "add_packager_codes_image":
      return msg("Take a photo of traceability codes")
    case "add_labels":
      return msg("Add any label present on this product")
    case "add_countries":
      return msg("Add the country where you found this product")
    case "add_basic_details":
      return msg("Add basic details")
    case "add_portion_size":
      return msg("Add portion size")
    case "refresh_ingredients_image":
      return msg("Refresh the photo of the ingredients")
    case "refresh_nutrition_image":
      return msg("Refresh the photo of the nutrition facts")
    case "report_product_to_nutripatrol":
      return msg("Report this product to our moderators")
    case "report_image_to_nutripatrol":
      return msg("Report this image to our moderators")
    default:
      return undefined
  }
}

/**
 * Get the URL where a knowledge panel action can be performed for a product
 * @param action - The action identifier (e.g. "add_categories")
 * @param productCode - The barcode of the product the knowledge panels belong to
 * @returns The URL of the action, or undefined if there is no product code or the action has no known URL
 */
export const getKnowledgePanelActionUrl = (
  action: string,
  productCode?: string
): string | undefined => {
  if (!productCode) {
    return undefined
  }

  if (action === "report_product_to_nutripatrol") {
    const params = new URLSearchParams({ barcode: productCode, source: "web", flavor: "off" })
    return `${NUTRIPATROL_URL}/flag/product/?${params.toString()}`
  }

  if (!Object.hasOwn(EDIT_FORM_ANCHORS, action)) {
    return undefined
  }
  const params = new URLSearchParams({ type: "edit", code: productCode })
  return `${openfoodfactsApiUrl.get()}/cgi/product.pl?${params.toString()}${EDIT_FORM_ANCHORS[action]}`
}
