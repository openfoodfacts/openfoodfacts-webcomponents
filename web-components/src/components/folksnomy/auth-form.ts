import { LitElement, html, css } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import folksonomyApi from "./../../api/folksonomy"

@customElement("auth-signin-form")
export class AuthSignInForm extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }

    form {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      max-width: 600px;
      margin: 0 auto;
      gap: 20px;
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

  @property({ type: String }) username = ""
  @property({ type: String }) password = ""
  @state() message = ""

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    this[target.name as "username" | "password"] = target.value
  }

  private async handleSubmit(e: Event) {
    e.preventDefault()
    try {
      const result = await folksonomyApi.signIn(this.username, this.password)
      console.log(result)
      localStorage.setItem("bearer", result.access_token)

      console.log(localStorage.getItem("bearer"))
      const event = new CustomEvent("signin", {
        detail: { username: this.username, password: this.password },
      })
      this.dispatchEvent(event)

      this.message = "Login successful!"
    } catch (error) {
      console.error("Sign-in failed", error)
      this.message = "Login failed. Please try again."
    }
  }

  override render() {
    return html`
      <form @submit="${this.handleSubmit}">
        <div class="form-group">
          <label for="username">Username</label>
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
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            .value="${this.password}"
            @input="${this.handleInputChange}"
            required
          />
        </div>

        <button type="submit">Sign In</button>
      </form>
      <p>${this.message}</p>
    `
  }
}
