import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { elementUpdated, fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import { EventType } from "../../constants"
import { openfoodfactsApiUrl, DEFAULT_OPENFOODFACTS_API_URL } from "../../signals/openfoodfacts"
import { jsonResponse } from "../../test/helpers"
import type {
  KnowledgePanelActionEventDetail,
  KnowledgePanelElement,
  KnowledgePanelsData,
} from "../../types/knowledge-panel"
import type { KnowledgePanelsComponent } from "./knowledge-panels"
import type { ActionElementRenderer } from "./renderers/render-action"

beforeAll(async () => {
  await import("./knowledge-panels")
})

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {})
})

afterEach(() => {
  openfoodfactsApiUrl.set(DEFAULT_OPENFOODFACTS_API_URL)
})

const createActionElement = (
  actionElement: KnowledgePanelElement["action_element"]
): KnowledgePanelElement => ({ element_type: "action", action_element: actionElement })

const createActionRenderer = async (element: KnowledgePanelElement, productCode = "") => {
  const renderer = await fixture<ActionElementRenderer>(
    html`<action-element-renderer
      .element=${element}
      .productCode=${productCode}
    ></action-element-renderer>`
  )
  await elementUpdated(renderer)
  return renderer
}

const getActionControls = (renderer: ActionElementRenderer) =>
  Array.from(renderer.shadowRoot?.querySelectorAll<HTMLElement>(".actions > *") ?? [])

describe("action-element-renderer", () => {
  it("links each action to the matching section of the product edit form", async () => {
    const renderer = await createActionRenderer(
      createActionElement({
        actions: ["add_categories", "edit_product"],
        html: "Could you add a precise product category?",
      }),
      "3017620422003"
    )

    const links = getActionControls(renderer) as HTMLAnchorElement[]
    expect(links.map((link) => link.tagName)).toEqual(["A", "A"])
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Add a category",
      "Complete or correct product information",
    ])
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=3017620422003#categories",
      "https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=3017620422003",
    ])
    expect(renderer.shadowRoot?.textContent).toContain("Could you add a precise product category?")
  })

  it("uses the configured Open Food Facts URL and encodes the product code", async () => {
    openfoodfactsApiUrl.set("https://world.openfoodfacts.net")
    const renderer = await createActionRenderer(
      createActionElement({ actions: ["add_origins"] }),
      "123&456"
    )

    expect(getActionControls(renderer)[0].getAttribute("href")).toBe(
      "https://world.openfoodfacts.net/cgi/product.pl?type=edit&code=123%26456#origins"
    )
  })

  it("links both nutrition image actions to the nutrition section of the edit form", async () => {
    const renderer = await createActionRenderer(
      createActionElement({ actions: ["add_nutrition_facts_image", "add_nutrition_image"] }),
      "3017620422003"
    )

    expect(getActionControls(renderer).map((link) => link.getAttribute("href"))).toEqual([
      "https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=3017620422003#nutrition",
      "https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=3017620422003#nutrition",
    ])
  })

  it("links the Nutri-Patrol report action to the Nutri-Patrol flag form", async () => {
    const renderer = await createActionRenderer(
      createActionElement({ actions: ["report_product_to_nutripatrol"] }),
      "3017620422003"
    )

    const [link] = getActionControls(renderer)
    expect(link.textContent?.trim()).toBe("Report this product to our moderators")
    expect(link.getAttribute("href")).toBe(
      "https://nutripatrol.openfoodfacts.org/flag/product/?barcode=3017620422003&source=web&flavor=off"
    )
  })

  it("renders buttons that only dispatch the action event when no link can be built", async () => {
    const renderer = await createActionRenderer(
      createActionElement({ actions: ["add_categories", "add_portion_size"] })
    )
    const listener = vi.fn()
    renderer.addEventListener(EventType.KNOWLEDGE_PANEL_ACTION, listener)

    const buttons = getActionControls(renderer) as HTMLButtonElement[]
    expect(buttons.map((button) => button.tagName)).toEqual(["BUTTON", "BUTTON"])
    expect(buttons.every((button) => button.type === "button" && !button.disabled)).toBe(true)
    expect(buttons[1].textContent?.trim()).toBe("Add portion size")

    buttons[0].click()

    expect(listener).toHaveBeenCalledOnce()
    const event = listener.mock.calls[0][0] as CustomEvent<KnowledgePanelActionEventDetail>
    expect(event.detail).toEqual({
      action: "add_categories",
      productCode: undefined,
      url: undefined,
    })
    expect(event.bubbles).toBe(true)
    expect(event.composed).toBe(true)
  })

  it("follows the action link unless the action event is cancelled", async () => {
    const renderer = await createActionRenderer(
      createActionElement({ actions: ["add_ingredients_text"] }),
      "3017620422003"
    )
    const [link] = getActionControls(renderer)
    const clickLink = () => {
      let followed = false
      const observeClick = (event: Event) => {
        followed = !event.defaultPrevented
        // Avoid jsdom navigation once the outcome is recorded
        event.preventDefault()
      }
      renderer.addEventListener("click", observeClick)
      link.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, composed: true })
      )
      renderer.removeEventListener("click", observeClick)
      return followed
    }

    expect(clickLink()).toBe(true)

    const handleAction = vi.fn((event: Event) => event.preventDefault())
    renderer.addEventListener(EventType.KNOWLEDGE_PANEL_ACTION, handleAction)

    expect(clickLink()).toBe(false)
    expect(handleAction).toHaveBeenCalledOnce()
    expect(
      (handleAction.mock.calls[0][0] as CustomEvent<KnowledgePanelActionEventDetail>).detail
    ).toEqual({
      action: "add_ingredients_text",
      productCode: "3017620422003",
      url: "https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=3017620422003#ingredients",
    })
  })

  it("falls back to the provided action text, then to the action identifier, for unknown actions", async () => {
    const withText = await createActionRenderer(
      createActionElement({ actions: ["custom_action"], action_text: "Do something" })
    )
    const withoutText = await createActionRenderer(
      createActionElement({ actions: ["custom_action"] })
    )

    expect(getActionControls(withText)[0].textContent?.trim()).toBe("Do something")
    expect(getActionControls(withoutText)[0].textContent?.trim()).toBe("custom_action")
  })
})

describe("knowledge-panels", () => {
  it("passes the product code down to nested action elements", async () => {
    const panels: KnowledgePanelsData = {
      root: {
        elements: [{ element_type: "panel", panel_element: { panel_id: "ingredients" } }],
      },
      ingredients: {
        elements: [
          createActionElement({
            actions: ["add_ingredients_text"],
            html: "Could you add the ingredients list?",
          }),
        ],
      },
    }
    // The component stores the loaded panels while rendering, which Lit reports in development mode
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ product: { knowledge_panels: panels } }))
    )

    const element = await fixture<KnowledgePanelsComponent>(
      html`<knowledge-panels
        url="https://world.openfoodfacts.org/api/v3/product/3017620422003.json"
        path="product.knowledge_panels"
        product-code="3017620422003"
      ></knowledge-panels>`
    )
    await vi.waitFor(() => {
      const renderer = findInShadowRoots(element, "action-element-renderer")
      expect(renderer?.shadowRoot?.querySelector("a")).toBeTruthy()
    })

    const link = findInShadowRoots(element, "action-element-renderer")?.shadowRoot?.querySelector(
      "a"
    )
    expect(link?.getAttribute("href")).toBe(
      "https://world.openfoodfacts.org/cgi/product.pl?type=edit&code=3017620422003#ingredients"
    )
  })
})

/**
 * Find the first element matching the selector, looking through nested shadow roots
 */
const findInShadowRoots = (root: Element, selector: string): Element | null => {
  const shadowRoot = root.shadowRoot
  if (!shadowRoot) {
    return null
  }
  const match = shadowRoot.querySelector(selector)
  if (match) {
    return match
  }
  for (const child of shadowRoot.querySelectorAll("*")) {
    const found = findInShadowRoots(child, selector)
    if (found) {
      return found
    }
  }
  return null
}
