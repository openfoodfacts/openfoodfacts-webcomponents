import { LitElement, html, css, nothing } from "lit"
import { customElement, property } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"

interface NutriPatrolFlag {
  id: number
  confidence?: number
  reason: string
  comment?: string
  created_at: string
}

interface NutriPatrolIssueUI {
  reason: string
  comment: string
  confidence?: number
  created_at?: string
  severity: "high" | "medium" | "low"
}

function toIssueUI(flag: NutriPatrolFlag): NutriPatrolIssueUI {
  const c = flag.confidence ?? 0
  return {
    reason: flag.reason,
    comment: flag.comment || "No details",
    confidence: flag.confidence,
    severity: c >= 0.8 ? "high" : c >= 0.5 ? "medium" : "low",
    created_at: flag.created_at,
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
        1px 4px 6px 1px rgba(0,0,0,.1),
        1px 2px 4px 1px rgba(0,0,0,.06);
      padding: 0.4rem;
      width: 100%;
      max-width: 380px;  
      min-width: 280px;   
      box-sizing: border-box;
    }

    h3 {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      display: flex;
      gap: .2rem;
      align-items: center;
    }

    .issue {
      padding: .5rem .75rem;
      margin-bottom: .5rem;
      border-radius: .25rem;
      background: #f9fafb;
    }
      
    .high { border-left: 4px solid #ef4444 }
    .medium { border-left: 4px solid #f59e0b }
    .low { border-left: 4px solid #10b981 }

    .badge {
      float: right;
      font-size: .8rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e5e7eb;
      text-transform: uppercase;
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

    button {
      width: 100%;
      margin-top: .75rem;
      background: #f59e0b;
      color: white;
      border: none;
      padding: .5rem;
      border-radius: .5rem;
      cursor: pointer;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      color: #6b7280;
      }
  `

  @property({ type: Array }) flags: NutriPatrolFlag[] = []
  @property({ type: Boolean }) showActions = false

  private get issues(): NutriPatrolIssueUI[] {
    return this.flags.map(toIssueUI)
  }

  render() {
    return html`
      <div class="card">
        <h3><img src='https://nutripatrol.openfoodfacts.org/assets/off-logo-_mdtrtmK.png' style="height: 30px; width: auto; vertical-align: middle; margin-right: 6px;"></img> Nutri-Patrol Issues</h3>

        ${this.issues.length === 0
          ? html`<p>No issues found.</p>`
          : this.issues.map(i => html`
              <div class=${classMap({
                issue: true,
                [i.severity]: true,
              })}>
                <span class="badge">${i.severity}</span>
                <strong>${i.reason}</strong>
                <p>${i.comment}</p>
                <div class="footer">
                ${i.confidence
                  ? html`<small class="badge">Confidence: ${(i.confidence * 100).toFixed(0)}%</small>`
                  : nothing}
                ${i.created_at
                  ? html`<small>${i.created_at}</small>`
                  : nothing}
                </div>
              </div>
            `)}

        ${this.showActions
          ? html`
              <button @click=${this.openNutriPatrol}>
                Open in Nutri-Patrol
              </button>
            `
          : nothing}
      </div>
    `
  }

  private openNutriPatrol() {
    this.dispatchEvent(new CustomEvent("nutripatrol:open"))
  }
}
