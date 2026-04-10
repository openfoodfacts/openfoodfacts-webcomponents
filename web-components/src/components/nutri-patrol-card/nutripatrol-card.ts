import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"
import { DEFAULT_NUTRI_PATROL_CONFIGURATION } from "../../constants"
import type { Flag } from "@openfoodfacts/openfoodfacts-nodejs"

interface NutriPatrolIssueUI {
  reason: string
  comment: string
  confidence?: Flag["confidence"]
  created_at?: Flag["created_at"]
  severity: "high" | "medium" | "low"
  type: Flag["type"]
  image_id: Flag["image_id"]
}

function toIssueUI(flag: Flag): NutriPatrolIssueUI {
  const c = flag.confidence
  return {
    reason: flag.reason || "No reason provided",
    comment: flag.comment || "No details",
    confidence: c,
    severity: c != null && c >= 0.8 ? "high" : c != null && c >= 0.5 ? "medium" : "low",
    created_at: flag.created_at,
    type: flag.type,
    image_id: flag.image_id,
  }
}

@customElement("nutripatrol-card")
export class NutriPatrolCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: "Plus Jakarta Sans Variable", system-ui, sans-serif;
    }

    .card {
      border-radius: 1rem;
      background: white;
      box-shadow:
        1px 4px 6px 1px rgba(0, 0, 0, 0.1),
        1px 2px 4px 1px rgba(0, 0, 0, 0.06);
      padding: 0.75rem;
      width: 100%;
      max-width: 380px;
      min-width: 280px;
      box-sizing: border-box;
    }

    h3 {
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 0 0.5rem;
    }

    .logo {
      height: 30px;
      width: auto;
      margin-right: 6px;
    }

    .barcode {
      font-size: 0.75rem;
      color: #6b7280;
      margin: 0 0 0.75rem;
    }

    .barcode span {
      font-weight: 600;
      color: #043f7f;
      background: #e0e7ff;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .issues-container {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .issues-container::-webkit-scrollbar {
      width: 4px;
    }
    .issues-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    .issues-container::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 4px;
    }

    .issue {
      padding: 0.5rem 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 0.25rem;
      background: #f9fafb;
    }

    .issue.high {
      border-left: 4px solid #ef4444;
    }
    .issue.medium {
      border-left: 4px solid #f59e0b;
    }
    .issue.low {
      border-left: 4px solid #10b981;
    }

    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .comment {
      font-size: 0.9rem;
      color: #444c56;
      margin: 0.25rem 0 0.5rem;
    }

    .footer {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: #6b7280;
      flex-wrap: wrap;
      padding-bottom: 0.5rem;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .issue.high .badge {
      background: #fee2e2;
      color: #991b1b;
    }
    .issue.medium .badge {
      background: #fef3c7;
      color: #92400e;
    }
    .issue.low .badge {
      background: #dcfce7;
      color: #065f46;
    }

    .type-tag {
      font-size: 0.7rem;
      background: #e0e7ff;
      color: #043f7f;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .image-tag {
      font-size: 0.75rem;
      color: #4f46e5;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 1rem;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .issue-count {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
  `

  @property({ type: Array }) flags: Flag[] = []
  @property({ type: Boolean }) loading = false

  private get issues(): NutriPatrolIssueUI[] {
    return this.flags.map(toIssueUI)
  }

  private get barcode(): string | null | undefined {
    return this.flags[0]?.barcode
  }

  private renderIssue(issue: NutriPatrolIssueUI) {
    return html`
      <div class=${classMap({ issue: true, [issue.severity]: true })}>
        <div class="issue-header">
          <strong>${issue.reason}</strong>
          <span class="badge">${issue.severity}</span>
        </div>

        <p class="comment">${issue.comment}</p>

        <div class="footer">
          <span class="type-tag">${issue.type}</span>

          ${issue.type === "image" && issue.image_id != null
            ? html`<span class="image-tag">Image ${issue.image_id}</span>`
            : nothing}
          ${issue.confidence != null
            ? html`<span class="badge">${(issue.confidence * 100).toFixed(0)}% confidence</span>`
            : nothing}
          ${issue.created_at
            ? html`<small>${new Date(issue.created_at).toLocaleDateString()}</small>`
            : nothing}
        </div>
      </div>
    `
  }

  render() {
    return html`
      <div class="card">
        <h3>
          <img
            class="logo"
            src=${DEFAULT_NUTRI_PATROL_CONFIGURATION.imgUrl}
            alt="Nutri-Patrol logo"
          />
          Nutri-Patrol Issues
        </h3>

        ${this.barcode
          ? html`<p class="barcode">Barcode: <span>${this.barcode}</span></p>`
          : nothing}
        ${this.loading
          ? html`<p class="empty-state">Loading issues…</p>`
          : this.issues.length === 0
            ? html`<p class="empty-state">No issues found.</p>`
            : html`
                <p class="issue-count">
                  ${this.issues.length} issue${this.issues.length > 1 ? "s" : ""} found
                </p>
                <div class="issues-container">
                  ${this.issues.map((issue) => this.renderIssue(issue))}
                </div>
              `}
      </div>
    `
  }
}
