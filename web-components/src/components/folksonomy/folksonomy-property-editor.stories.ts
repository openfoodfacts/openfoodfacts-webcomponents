import type { Meta, StoryObj } from "@storybook/web-components-vite"
import { html } from "lit"
import "./folksonomy-property-editor"
import type { FolksonomyPropertyEditor } from "./folksonomy-property-editor"

const meta: Meta<FolksonomyPropertyEditor> = {
  title: "Components/Folksonomy/Folksonomy Property Editor",
  component: "folksonomy-property-editor",
  argTypes: {
    property: { control: "text" },
    productCode: { control: "text" },
    title: { control: "text" },
    callToAction: { control: "text" },
    image: { control: "text" },
    viewOnly: { control: "boolean" },
    widgetType: {
      control: { type: "select" },
      options: ["auto", "text", "boolean", "select", "date"],
    },
  },
}
export default meta

type Story = StoryObj<FolksonomyPropertyEditor>

/**
 * Use case 1: Nutripatrol / Data Quality to mark an issue as unfixable.
 * Uses boolean choice pills (yes / no).
 */
export const UnfixableIssue: Story = {
  args: {
    property: "unfixable",
    productCode: "3017620422003",
    title: "Data Quality Flag",
    callToAction: "Mark as unfixable",
    acceptedValues: ["yes", "no"],
    image: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.149.200.jpg",
    widgetType: "boolean",
    viewOnly: false,
  },
  render: (args) => {
    const el = document.createElement("folksonomy-property-editor") as FolksonomyPropertyEditor
    el.loadExistingProperty = async () => {} // Avoid Storybook network errors
    el.property = args.property
    el.productCode = args.productCode
    el.title = args.title ?? ""
    el.callToAction = args.callToAction ?? ""
    el.acceptedValues = args.acceptedValues ?? []
    el.image = args.image ?? ""
    el.widgetType = args.widgetType ?? "auto"
    el.viewOnly = !!args.viewOnly

    return html`
      <div style="max-width: 450px; padding: 1.5rem;">
        <folksonomy-property-editor
          .property=${args.property}
          .productCode=${args.productCode}
          .title=${args.title}
          .callToAction=${args.callToAction}
          .acceptedValues=${args.acceptedValues}
          .image=${args.image}
          .widgetType=${args.widgetType}
          ?view-only=${args.viewOnly}
        ></folksonomy-property-editor>
      </div>
    `
  },
}

/**
 * Use case 2: Open Prices - specific values like deposit / consigne.
 */
export const OpenPricesConsigne: Story = {
  args: {
    property: "consigne",
    productCode: "5449000000996",
    title: "Bottle Deposit (Consigne)",
    callToAction: "Save consigne value",
    acceptedValues: ["none", "0.10€", "0.20€", "0.25€"],
    widgetType: "auto",
    viewOnly: false,
  },
  render: (args) => html`
    <div style="max-width: 450px; padding: 1.5rem;">
      <folksonomy-property-editor
        .property=${args.property}
        .productCode=${args.productCode}
        .title=${args.title}
        .callToAction=${args.callToAction}
        .acceptedValues=${args.acceptedValues}
        .widgetType=${args.widgetType}
        ?view-only=${args.viewOnly}
      ></folksonomy-property-editor>
    </div>
  `,
}

/**
 * Use case 3: Specialized parts of product pages (e.g. Open Products Facts)
 * Dropdown selector for materials.
 */
export const SelectDropdownOptions: Story = {
  args: {
    property: "material",
    productCode: "3274080005003",
    title: "Packaging Material",
    callToAction: "Save material",
    acceptedValues: ["Glass", "Plastic", "Aluminium", "Tetra Pak", "Cardboard", "Ceramic"],
    widgetType: "select",
    viewOnly: false,
  },
  render: (args) => html`
    <div style="max-width: 450px; padding: 1.5rem;">
      <folksonomy-property-editor
        .property=${args.property}
        .productCode=${args.productCode}
        .title=${args.title}
        .callToAction=${args.callToAction}
        .acceptedValues=${args.acceptedValues}
        .widgetType=${args.widgetType}
        ?view-only=${args.viewOnly}
      ></folksonomy-property-editor>
    </div>
  `,
}

/**
 * Use case 4: Free-text arbitrary property without predefined accepted values.
 */
export const FreeTextInput: Story = {
  args: {
    property: "harvest_region",
    productCode: "3274080005003",
    title: "Harvest Region",
    callToAction: "Add region",
    acceptedValues: [],
    widgetType: "text",
    viewOnly: false,
  },
  render: (args) => html`
    <div style="max-width: 450px; padding: 1.5rem;">
      <folksonomy-property-editor
        .property=${args.property}
        .productCode=${args.productCode}
        .title=${args.title}
        .callToAction=${args.callToAction}
        .acceptedValues=${args.acceptedValues}
        .widgetType=${args.widgetType}
        ?view-only=${args.viewOnly}
      ></folksonomy-property-editor>
    </div>
  `,
}

/**
 * Use case 5: Pre-filled existing property value.
 */
export const ExistingValuePreFilled: Story = {
  args: {
    property: "recyclable",
    productCode: "3017620422003",
    title: "Recyclability",
    value: "yes",
    acceptedValues: ["yes", "no"],
    widgetType: "boolean",
    viewOnly: false,
  },
  render: (args) => html`
    <div style="max-width: 450px; padding: 1.5rem;">
      <folksonomy-property-editor
        .property=${args.property}
        .productCode=${args.productCode}
        .title=${args.title}
        .value=${args.value}
        .acceptedValues=${args.acceptedValues}
        .widgetType=${args.widgetType}
        ?view-only=${args.viewOnly}
      ></folksonomy-property-editor>
    </div>
  `,
}
