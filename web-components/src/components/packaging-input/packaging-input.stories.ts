import { html } from "lit"
import { msg } from "@lit/localize"
import type { Meta, StoryObj } from "@storybook/web-components-vite"
import type { PackagingComponent } from "@openfoodfacts/openfoodfacts-nodejs"
import type { PackagingChangeEvent } from "./packaging-input"
import "./packaging-input"

const bottle: PackagingComponent = {
  number_of_units: 1,
  shape: { id: "en:bottle", lc_name: "Bottle" },
  material: { id: "en:glass", lc_name: "Glass" },
}
const cap: PackagingComponent = {
  number_of_units: 1,
  shape: { id: "en:bottle-cap", lc_name: "Bottle cap" },
  material: { id: "en:plastic", lc_name: "Plastic" },
}

const meta: Meta<{ packagings: PackagingComponent[] }> = {
  title: "Components/Packaging Input",
  component: "packaging-input",
  render: (args) => html`
    <section style="max-width: 36rem; margin: auto;">
      <packaging-input
        .packagings=${args.packagings}
        @packaging-change=${(event: PackagingChangeEvent) => {
          const output = (event.currentTarget as HTMLElement).parentElement?.querySelector("pre")
          if (output) output.textContent = JSON.stringify(event.detail, null, 2)
        }}
      ></packaging-input>
      <h2>${msg("Last packaging-change event")}</h2>
      <pre style="white-space: pre-wrap; overflow-wrap: anywhere;">${msg("No edit yet.")}</pre>
    </section>
  `,
}
export default meta

type Story = StoryObj<{ packagings: PackagingComponent[] }>
export const Empty: Story = { args: { packagings: [] } }
export const OnePart: Story = { args: { packagings: [bottle] } }
export const SeveralParts: Story = { args: { packagings: [bottle, cap] } }
export const AdditionalFields: Story = {
  args: {
    packagings: [
      {
        ...bottle,
        recycling: { id: "en:recycle-in-glass-bin", lc_name: "recycle in glass bin" },
        quantity_per_unit: "250 ml",
        quantity_per_unit_value: 250,
        quantity_per_unit_unit: "ml",
        weight_measured: 120,
        weight: 120,
        weight_source_id: "measured",
      },
      cap,
    ],
  },
}
