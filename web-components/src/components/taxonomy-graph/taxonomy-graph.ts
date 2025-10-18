import { LitElement, html, css } from "lit"
import { customElement, property } from "lit/decorators.js"
import cytoscape from "cytoscape"
import { fetchTaxonomyCategory } from "../../api/openfoodfacts"
import { isTaxonomyCategoryDetail } from "../../types/openfoodfacts"

/**
 */
@customElement("taxonomy-graph")
export class TaxonomyGraph extends LitElement {
  /**
   * The root categories to display
   */
  @property({ type: Array })
  categoriesNames: string[] = ["gnocchi", "terrine"]

  static styles = css`
    #cy {
      width: 100%;
      height: 600px;
      border: 1px solid #ccc;
    }
  `

  async addCategoryAndChildren(categoryName: string) {
    const categories = await fetchTaxonomyCategory(categoryName)
    if (!isTaxonomyCategoryDetail(categories)) {
      console.warn(`category ${categoryName} doesn't seem to exist since API returned`, categories)
      return []
    }
    const graph_elements = []
    for (var categoryId in categories) {
      const category = categories[categoryId]
      graph_elements.push({ data: { id: categoryId } })
      for (var child of category.children) {
        graph_elements.push({ data: { id: child } })
        graph_elements.push({
          data: {
            id: `${categoryId}->${child}`,
            source: categoryId,
            target: child,
          },
        })
      }
    }
    return graph_elements
  }

  async firstUpdated() {
    const graph_elements = []
    for (var categoryName of this.categoriesNames) {
      var new_elements = await this.addCategoryAndChildren(categoryName)
      console.log("new elements", new_elements)
      graph_elements.push(...new_elements)
    }
    cytoscape({
      container: this.renderRoot.querySelector("#cy"),
      elements: graph_elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0074D9",
            label: "data(id)",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
          },
        },
      ],
      // Here is the doc for layouts : https://js.cytoscape.org/#layouts
      layout: {
        name: "breadthfirst"
      }
    });
  }

  render() {
    return html`<div id="cy"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "taxonomy-graph": TaxonomyGraph
  }
}
