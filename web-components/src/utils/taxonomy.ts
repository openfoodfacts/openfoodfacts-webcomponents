import type { AutocompleteSuggestion } from "../types"

/**
 * Converts a flat taxonomy (as found in categories.full.json) into a hierarchical
 * structure compatible with AutocompleteSuggestion.
 *
 * @param flatTaxonomy - The flat map of categories.
 * @param lang - The preferred language for labels.
 * @returns An array of root-level suggestions.
 */
export function buildCategoryTree(
  flatTaxonomy: Record<string, any>,
  lang: string
): AutocompleteSuggestion[] {
  console.time("buildCategoryTree")
  const nodes: Record<string, AutocompleteSuggestion> = {}
  const rootNodes: AutocompleteSuggestion[] = []

  // 1. Initialize all nodes
  for (const [id, data] of Object.entries(flatTaxonomy)) {
    nodes[id] = {
      value: id,
      label: data.name?.[lang] || data.name?.en || id,
      children: [],
    }
  }

  // 2. Link children to parents
  for (const [id, data] of Object.entries(flatTaxonomy)) {
    const node = nodes[id]
    const parents = data.parents || []

    if (parents.length === 0) {
      if (!rootNodes.includes(node)) {
        rootNodes.push(node)
      }
    } else {
      parents.forEach((parentId: string) => {
        if (nodes[parentId]) {
          nodes[parentId].children!.push(node)
        } else {
          // If parent is not in the set, treat it as a root node
          if (!rootNodes.includes(node)) {
            rootNodes.push(node)
          }
        }
      })
    }
  }

  // Sort root nodes alphabetically by label
  const sorted = rootNodes.sort((a, b) => (a.label || "").localeCompare(b.label || ""))
  console.timeEnd("buildCategoryTree")
  return sorted
}
