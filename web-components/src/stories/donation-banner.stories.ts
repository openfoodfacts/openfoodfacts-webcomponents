import { html } from "lit"
export { DonationBanner } from "../components/donation-banner"

export default {
  title: "Components/DonationBanner",
  component: "donation-banner",
}

const Template = () => html`<donation-banner />`

export const Default = Template.bind({})
