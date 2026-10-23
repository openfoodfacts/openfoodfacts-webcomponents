import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { elementUpdated, fixture } from "@open-wc/testing/pure"
import { html } from "lit"
import type { Flag, Ticket } from "@openfoodfacts/openfoodfacts-nodejs"
import type { NutriPatrolReports } from "./nutripatrol-reports"

const mocks = vi.hoisted(() => ({
  getTickets: vi.fn(),
  getFlagsByTicketBatch: vi.fn(),
}))

vi.mock("@openfoodfacts/openfoodfacts-nodejs", () => ({
  NutriPatrol: class {
    getTickets = mocks.getTickets
    getFlagsByTicketBatch = mocks.getFlagsByTicketBatch
  },
}))

beforeAll(async () => {
  await import("./nutripatrol-reports")
})

beforeEach(() => {
  mocks.getTickets.mockReset()
  mocks.getFlagsByTicketBatch.mockReset()
})

const ticket = {
  id: 100,
  barcode: "3017620422003",
  type: "product",
  url: "https://world.openfoodfacts.org/product/3017620422003",
  status: "open",
  flavor: "off",
  created_at: "2026-10-20T10:00:00Z",
} as Ticket

const flag = {
  id: 501,
  ticket_id: 100,
  barcode: "3017620422003",
  type: "product",
  url: ticket.url,
  user_id: "test-user",
  source: "web",
  flavor: "off",
  reason: "inappropriate",
  comment: "Label appears incorrect",
  created_at: "2026-10-21T10:00:00Z",
  device_id: "test-device",
} as Flag

const createComponent = async (barcode = "3017620422003") => {
  const element = await fixture<NutriPatrolReports>(
    html`<nutripatrol-reports .barcode=${barcode}></nutripatrol-reports>`
  )
  await elementUpdated(element)
  return element
}

describe("nutripatrol-reports", () => {
  it("shows reports associated with the product barcode", async () => {
    mocks.getTickets.mockResolvedValue({
      data: { tickets: [ticket], max_page: 1 },
      error: undefined,
    })
    mocks.getFlagsByTicketBatch.mockResolvedValue({
      data: [flag],
      error: undefined,
    })

    const element = await createComponent()

    await vi.waitFor(() => {
      expect(element.shadowRoot?.textContent).toContain("Label appears incorrect")
    })

    expect(element.shadowRoot?.textContent).toContain("inappropriate")
    expect(element.shadowRoot?.textContent).toContain("open")
    expect(mocks.getTickets).toHaveBeenCalledWith({
      barcode: "3017620422003",
      page: 1,
      page_size: 20,
    })
    expect(mocks.getFlagsByTicketBatch).toHaveBeenCalledWith([100])
  })

  it("shows an empty state when the product has no tickets", async () => {
    mocks.getTickets.mockResolvedValue({
      data: { tickets: [], max_page: 1 },
      error: undefined,
    })

    const element = await createComponent()

    await vi.waitFor(() => {
      expect(element.shadowRoot?.textContent).toContain(
        "No Nutri-Patrol reports found for this product."
      )
    })

    expect(mocks.getFlagsByTicketBatch).not.toHaveBeenCalled()
  })

  it("shows an error state when tickets cannot be fetched", async () => {
    mocks.getTickets.mockResolvedValue({
      data: undefined,
      error: new Error("Network error"),
    })

    const element = await createComponent()

    await vi.waitFor(() => {
      expect(element.shadowRoot?.querySelector('[role="alert"]')).not.toBeNull()
    })
  })

  it("asks for a barcode when none is provided", async () => {
    const element = await createComponent("")

    expect(element.shadowRoot?.textContent).toContain(
      "Provide a barcode to view Nutri-Patrol reports."
    )
    expect(mocks.getTickets).not.toHaveBeenCalled()
  })
})
