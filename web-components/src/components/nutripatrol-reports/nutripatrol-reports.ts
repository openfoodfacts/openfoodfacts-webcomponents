import { Task } from "@lit/task"
import { localized, msg } from "@lit/localize"
import { NutriPatrol } from "@openfoodfacts/openfoodfacts-nodejs"
import type { Flag, Ticket } from "@openfoodfacts/openfoodfacts-nodejs"
import { LitElement, css, html, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"

interface ReportItem {
  flag: Flag
  ticket: Ticket
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

/**
 * The SDK currently types the batch endpoint response as unknown.
 * Collect flag-shaped objects from its response without assuming
 * a particular wrapper or grouping format.
 */
const extractFlags = (value: unknown): Flag[] => {
  const found = new Map<number, Flag>()

  const visit = (item: unknown): void => {
    if (Array.isArray(item)) {
      item.forEach(visit)
      return
    }

    if (!isRecord(item)) {
      return
    }

    if (typeof item.id === "number" && typeof item.ticket_id === "number") {
      found.set(item.id, item as unknown as Flag)
      return
    }

    Object.values(item).forEach(visit)
  }

  visit(value)
  return [...found.values()]
}

/**
 * Displays Nutri-Patrol reports associated with a product barcode.
 *
 * @example
 * <nutripatrol-reports barcode="3017620422003"></nutripatrol-reports>
 */
@customElement("nutripatrol-reports")
@localized()
export class NutriPatrolReports extends LitElement {
  @property({ type: String })
  barcode = ""

  private client = new NutriPatrol(globalThis.fetch)

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      color: #1f2937;
      font-family: "Inter", sans-serif;
    }

    h2 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .state {
      padding: 1rem;
      color: #6b7280;
      text-align: center;
    }

    .error {
      color: #b91c1c;
      background: #fef2f2;
      border-radius: 0.375rem;
    }

    .reports {
      display: grid;
      gap: 0.75rem;
    }

    .report {
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #fff;
    }

    .report-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .reason {
      margin: 0;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .status {
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      background: #f3f4f6;
      color: #374151;
      font-size: 0.75rem;
      text-transform: capitalize;
    }

    .comment {
      margin: 0 0 0.75rem;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .report-footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.8125rem;
    }

    a {
      color: #2563eb;
      text-decoration: underline;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        color: #e5e7eb;
      }

      .state {
        color: #a1a1aa;
      }

      .error {
        color: #fca5a5;
        background: #450a0a;
      }

      .report {
        border-color: #3f3f46;
        background: #18181b;
      }

      .status {
        color: #e5e7eb;
        background: #27272a;
      }

      .report-footer {
        color: #a1a1aa;
      }

      a {
        color: #93c5fd;
      }
    }
  `

  private reportsTask = new Task(this, {
    args: () => [this.barcode],
    task: async ([barcode]) => {
      const productBarcode = barcode?.trim()

      if (!productBarcode) {
        return []
      }

      const tickets: Ticket[] = []
      let page = 1
      let maxPage = 1

      do {
        const { data, error } = await this.client.getTickets({
          barcode: productBarcode,
          page,
          page_size: 20,
        })

        if (error || !data) {
          throw new Error("Unable to load Nutri-Patrol tickets.")
        }

        tickets.push(...data.tickets)
        maxPage = data.max_page
        page += 1
      } while (page <= maxPage)

      if (tickets.length === 0) {
        return []
      }

      const ticketById = new Map(tickets.map((ticket) => [ticket.id, ticket]))
      const { data, error } = await this.client.getFlagsByTicketBatch(
        tickets.map((ticket) => ticket.id)
      )

      if (error) {
        throw new Error("Unable to load Nutri-Patrol reports.")
      }

      const ticketIds = new Set(tickets.map((ticket) => ticket.id))

      return extractFlags(data)
        .filter((flag) => ticketIds.has(flag.ticket_id))
        .map((flag) => ({
          flag,
          ticket: ticketById.get(flag.ticket_id)!,
        }))
        .sort((a, b) => {
          const dateA = Date.parse(a.flag.created_at ?? a.ticket.created_at ?? "") || 0
          const dateB = Date.parse(b.flag.created_at ?? b.ticket.created_at ?? "") || 0
          return dateB - dateA
        }) satisfies ReportItem[]
    },
  })

  private formatDate(value?: string): string | undefined {
    if (!value) {
      return undefined
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return undefined
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  private getSafeUrl(value?: string): string | undefined {
    if (!value) {
      return undefined
    }

    try {
      const url = new URL(value)
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined
    } catch {
      return undefined
    }
  }

  private renderReport({ flag, ticket }: ReportItem) {
    const date = this.formatDate(flag.created_at ?? ticket.created_at)
    const url = this.getSafeUrl(ticket.url)

    return html`
      <article class="report" key=${flag.id}>
        <div class="report-header">
          <p class="reason">${flag.reason?.trim() || msg("Report")}</p>
          <span class="status">${ticket.status}</span>
        </div>

        ${flag.comment?.trim() ? html`<p class="comment">${flag.comment}</p>` : nothing}

        <div class="report-footer">
          <span>${date ?? msg("Date unavailable")}</span>
          ${
            url
              ? html`
                  <a href=${url} target="_blank" rel="noopener noreferrer">
                    ${msg("View related item")}
                  </a>
                `
              : nothing
          }
        </div>
      </article>
    `
  }

  override render() {
    if (!this.barcode.trim()) {
      return html` <p class="state">${msg("Provide a barcode to view Nutri-Patrol reports.")}</p> `
    }

    return this.reportsTask.render({
      pending: () => html`
        <p class="state" role="status">${msg("Loading Nutri-Patrol reports...")}</p>
      `,
      error: () => html`
        <p class="state error" role="alert">
          ${msg("Unable to load Nutri-Patrol reports. Please try again later.")}
        </p>
      `,
      complete: (reports) =>
        reports.length === 0
          ? html` <p class="state">${msg("No Nutri-Patrol reports found for this product.")}</p> `
          : html`
              <section aria-label=${msg("Nutri-Patrol reports")}>
                <h2>${msg("Nutri-Patrol reports")} (${reports.length})</h2>
                <div class="reports">${reports.map((report) => this.renderReport(report))}</div>
              </section>
            `,
    })
  }
}
