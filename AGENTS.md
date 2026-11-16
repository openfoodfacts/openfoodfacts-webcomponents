# AI Agent & Contributor Guidelines (`AGENTS.md`)

Welcome to the **Open Food Facts Web Components** repository (`@openfoodfacts/openfoodfacts-webcomponents`). This document provides operational guidelines, quality standards, token-saving strategies, and contribution rules for AI coding agents (and human developers collaborating with AI).

Open Food Facts is a non-profit, open-data project trusted by millions of consumers worldwide. Maintainer and reviewer attention is scarce and precious: **always optimize for high code quality, reviewer convenience, and strict token efficiency**.

---

## 1. Token Efficiency & Context Management (Read First!)

AI agents operate with bounded context windows and token budgets. Follow these rules to keep conversations fast, focused, and cost-effective:

### 🚫 The #1 Token Trap: `web-components/xliff/`
- **NEVER** read, search, grep, or dump the `web-components/xliff/` directory.
- It contains **150+ language translation files** (`.xlf`) comprising hundreds of thousands of lines. Reading it will instantly exhaust your token limit and pollute the conversation context.
- Translations are managed by `@lit/localize` and Crowdin. Only use `npm run translations:extract` to update them; never examine them en masse. (CodeRabbit already excludes `xliff/**` for this exact reason).

### 📁 Scope to `web-components/`
- The root of the repository is a minimal workspace wrapper for `release-please`.
- **All application code, dependencies, scripts, and tests reside in `./web-components/`.**
- When running commands or investigating files, always work inside `./web-components/` (or use `npm --prefix web-components`).

### 🙈 Ignore Generated Artifacts
- Never read or analyze generated output:
  - `web-components/dist/**`
  - `web-components/custom-elements.json`
  - `web-components/storybook-static/**`
  - Minified or source-map files (`*.js.map`, `*.d.ts.map`)

### 🎯 Surgical Inspection & Targeted Testing
- **Read only relevant files:** Inspect the targeted component folder (e.g., `web-components/src/components/<category>/<component-name>/`) rather than scanning all components.
- **Run targeted tests:** While developing or debugging, run only the relevant test file:
  ```bash
  npm test -- src/components/path/to/my-component.test.ts
  ```
  Only run the full test suite (`npm test`) as a final pre-commit verification.
- **Minimal, targeted diffs:** Avoid rewriting whole files or reformatting lines you did not touch.

---

## 2. Environment & Core Commands

Ensure you are using **Node.js 24** (as specified in `.nvmrc`).

Navigate to the `web-components` directory before running any scripts:

```bash
cd web-components
```

| Task | Command | Notes |
| :--- | :--- | :--- |
| **Install Dependencies** | `npm ci` (or `npm install`) | Standard install using `package-lock.json` |
| **Dev / Storybook** | `npm run dev` | Runs Storybook on port 6006 and CEM analyzer watch |
| **Run Unit Tests** | `npm test` | Runs Vitest in watch/jsdom mode |
| **Run Tests Once** | `npm test -- --run` | Executes tests without watching |
| **Targeted Test** | `npm test -- <path-to-test>` | Runs only the matching test file |
| **Linter** | `npm run lint` | ESLint + Lit analyzer rules |
| **Linter Auto-fix** | `npm run lint:fix` | Automatically fixes mechanical lint issues |
| **Check Formatting** | `npm run format:check` | Prettier check (enforced in CI) |
| **Format Code** | `npm run format` | Prettier write |
| **Extract Strings** | `npm run translations:extract` | Updates `lit-localize.json` & extracted strings |
| **Build Project** | `npm run build` | Builds translations and runs Vite production build |

> [!IMPORTANT]
> CI will fail if formatting, linting, tests, or missing translations are not addressed locally before pushing.

---

## 3. Code Quality & Architectural Standards

### 3.1 Lit 3 & TypeScript
- **Modern Decorators & Syntax:** Use standard Lit decorators (`@customElement`, `@property`, `@state`).
- **Direct Lit Imports:** Import APIs directly from `lit` (`import { LitElement, html, css } from 'lit';`) and decorators from `lit/decorators.js`.
- **Strict Typing:** Avoid `any`. Define strong interfaces/types for all properties, API responses, and event payloads.
- **Reactive State (`@lit-labs/signals`):** Use signals for cross-component shared reactive state (see `src/signals/`). Keep local component state in `@state()` properties.
- **Asynchronous Tasks:** Use `@lit/task` for data-fetching flows and async state management.
- **Security & Sanitization:** Over 80% of Open Food Facts traffic is on mobile web. Always sanitize untrusted or user-supplied markup with `dompurify` before rendering HTML (`unsafeHTML(DOMPurify.sanitize(...))`).

### 3.2 Accessibility (a11y) — Non-Negotiable
- Web components must comply with **WCAG 2.1 AA** standards.
- **Semantic HTML inside Shadow DOM:** Prefer native elements (`<button>`, `<input>`, `<nav>`, `<ul>`) over styled `<div>`s with click handlers.
- **Keyboard Navigation:** Ensure all interactive elements can be operated with `Tab`, `Enter`, `Space`, and `Escape`. Manage focus logically.
- **ARIA Attributes:** Provide explicit `aria-label`, `aria-expanded`, `aria-live`, and role attributes where semantic markup is not sufficient.
- **Storybook a11y Addon:** Test components with the built-in `@storybook/addon-a11y` panel to ensure zero violations.

### 3.3 Localization (i18n)
- **Zero Hardcoded Strings:** Every user-visible string must use `@lit/localize`:
  ```typescript
  import { msg, str } from '@lit/localize';

  // Static message
  msg('Save changes', { id: 'button.save' });

  // Dynamic message
  msg(str`Hello, ${name}!`, { id: 'greeting' });
  ```
- **Syncing Translations:** Whenever you add or alter localized strings:
  ```bash
  cd web-components
  npm run translations:extract
  ```
  Commit the updated `lit-localize.json` and xliff files generated by the command. Do **not** edit `.xlf` files by hand.

### 3.4 Unit & Component Testing
- Tests live alongside source code (`*.test.ts`) using **Vitest** + **jsdom**.
- Every bug fix must include a regression test.
- Every new component or utility must include unit tests covering:
  - Default rendering
  - Attribute & property changes
  - User interactions (clicks, keyboard events)
  - Edge cases (null/undefined inputs, network failures)
  - Network API calls (always mock `src/api/*` in tests; never call external servers)

---

## 4. Pull Request Standards & Reviewer Quality of Life

Human maintainers review PRs in their limited volunteer or non-profit working hours. AI agents must submit PRs that are easy to review, thoroughly verified, and transparent.

### 4.1 Conventional Commits & Semantic PR Titles
This repository uses `release-please` and a semantic PR GitHub Action. PR titles and commit messages **must** follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```
- **Allowed Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- **Scope examples:** `robotoff`, `folksonomy`, `donation-banner`, `product-card`, `signals`, `a11y`, `i18n`.
- *Example:* `feat(robotoff): add keyboard navigation to question cards`

### 4.2 Mandatory: Before & After Visual Proof
For **any** change that affects UI, styling, layout, or Storybook components:
- **Screenshots or screen recordings (GIF/video) are strictly required** in the PR description.
- Provide a side-by-side or clearly labeled "Before" and "After" comparison.
- Show:
  - **Desktop viewport** and **Mobile viewport** (~375px width — over 80% of OFF web traffic is mobile).
  - Normal, interactive (hover/focus), and error/loading states if relevant.

### 4.3 Mandatory: LLM / AI Usage Disclosure
Transparency builds trust. Every pull request created or assisted by an AI agent must include a clear **LLM Usage Disclosure** section in the PR description.

The disclosure must state:
1. **Model / Agent Used:** (e.g., Gemini 3.8 Flash via Antigravity, Claude 3.7 Sonnet, etc.)
2. **Scope of AI Assistance:** (e.g., "Full component implementation", "Refactored test suite", "Added localization and a11y fixes")
3. **Human Verification Statement:** Explicit confirmation that the code was reviewed, tested locally, and validated by the contributor.

### 4.4 Agent Pre-Flight Self-Review Checklist
Before pushing or requesting review, execute this checklist:
- [ ] Working directory is clean of temporary files, debug scripts, or logs.
- [ ] No `console.log`, `debugger`, or commented-out scratch code remains.
- [ ] `npm run lint` passes without new errors or warnings.
- [ ] `npm run format:check` passes (or `npm run format` was run).
- [ ] `npm test -- --run` passes 100%.
- [ ] `npm run translations:extract` was executed if strings changed, and git status is clean.
- [ ] `npm run build` succeeds cleanly.
- [ ] Visual before/after captures are prepared for the PR description.

---

## 5. Pull Request Description Template

Copy and paste this template when opening a Pull Request:

```markdown
## Description
<!-- Summary of the change, motivation, and context -->
Fixes #(issue)

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature that alters existing behavior)
- [ ] 🧹 Refactoring or code maintenance
- [ ] 📚 Documentation update
- [ ] 🌐 Localization / Internationalization

## Visual Proof (Before & After)
<!-- MANDATORY for any UI, CSS, layout, or Storybook changes -->

| State / Viewport | Before | After |
| :--- | :--- | :--- |
| **Desktop** | <!-- screenshot or N/A --> | <!-- screenshot --> |
| **Mobile (~375px)** | <!-- screenshot or N/A --> | <!-- screenshot --> |
| **Interactive / Focus** | <!-- screenshot or N/A --> | <!-- screenshot --> |

## Accessibility (a11y) Verification
- [ ] Semantic HTML tags used inside Shadow DOM
- [ ] Navigable and operable via keyboard (`Tab`, `Enter`, `Space`, `Escape`)
- [ ] Tested with Storybook a11y addon (0 critical/serious violations)
- [ ] ARIA attributes provided where appropriate

## Testing Evidence
- [ ] Added or updated Vitest tests in `*.test.ts`
- [ ] All tests pass locally (`npm test -- --run`)
- [ ] Tested manually in Storybook (`npm run dev`)

## AI / LLM Usage Disclosure
<!-- MANDATORY: Disclose any AI assistance used for this PR -->
- **AI Tool / Model:** [e.g. Gemini 3.8 Flash / Claude 3.7 / Cursor / Antigravity]
- **Scope of Generation:** [e.g. Generated tests, implemented component logic, refactored styles]
- **Human Review Acknowledgment:** I have thoroughly reviewed every line of code generated by the LLM, verified its correctness against project standards, ran the test suite locally, and take full responsibility for this contribution.
```
