import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import folksonomyApi from "../../api/folksonomy"
import { msg } from "@lit/localize"

/**
 * FolksonomyAuth Component
 * @element folksonomy-auth
 * A web component for user authentication using the Folksonomy API.
 * This component provides a login form for users to enter their credentials.
 */
@customElement("folksonomy-auth")
export class FolksonomyAuth extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      padding: 16px;
      box-sizing: border-box;
    }

    form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: stretch;
      max-width: 100%;
      margin: 0 auto;
      gap: 20px;
    }

    @media (min-width: 600px) {
      form {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        max-width: 600px;
      }
    }

    label {
      margin-bottom: 8px;
      font-weight: bold;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    input {
      margin-bottom: 16px;
      padding: 8px;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      padding: 10px;
      font-size: 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0056b3;
    }

    p {
      margin-top: 8px;
    }
  `

  /**
   * The username entered by the user.
   */
  @property({ type: String }) username = ""

  /**
   * The password entered by the user.
   */
  @property({ type: String }) password = ""

  /**
   * A message displayed to the user, such as login success or failure.
   */
  @state() message = ""

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    this[target.name as "username" | "password"] = target.value
  }

  private async handleSubmit(e: Event) {
    e.preventDefault()
    try {
      const result = await folksonomyApi.signIn(this.username, this.password)
      localStorage.setItem("bearer", result.access_token)

      const event = new CustomEvent("signin", {
        detail: { username: this.username, password: this.password },
      })
      this.dispatchEvent(event)

      this.message = msg("Login successful!")
    } catch (error) {
      console.error("Sign-in failed", error)
      this.message = msg("Login failed. Please try again.")
    }
  }

  override render() {
    return html`
      <form @submit="${this.handleSubmit}">
        <div class="form-group">
          <label for="username">${msg("Username")}</label>
          <input
            type="text"
            id="username"
            name="username"
            .value="${this.username}"
            @input="${this.handleInputChange}"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">${msg("Password")}</label>
          <input
            type="password"
            id="password"
            name="password"
            .value="${this.password}"
            @input="${this.handleInputChange}"
            required
          />
        </div>

        <button type="submit">${msg("Sign In")}</button>
      </form>
      <p>${this.message}</p>
    `
  }
}
