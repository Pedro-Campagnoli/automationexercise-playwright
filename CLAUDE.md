# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Playwright end-to-end tests against the public practice site **automationexercise.com**, following its published test case list ("Test Case 1: Register User", etc.). Tests run against a live external site — there is no app in this repo to build or serve.

`BASE_URL` comes from `.env` (gitignored, not committed) and is wired to the chromium project's `baseURL` in `playwright.config.ts` via `dotenv`. Without a `.env` containing `BASE_URL`, every `page.goto('/')` and every API call fails — this is the first thing to check on a fresh clone.

## Commands

```bash
npm test                      # playwright test --ui  (UI mode, NOT headless)
npm run debug                 # playwright test --debug
npx playwright test           # headless run (what CI does)
npx playwright test --headed
npx playwright test tests/specs/test-cases.spec.ts
npx playwright test -g "Test Case 1"   # single test by title
npx playwright show-report
npx playwright install --with-deps      # first-time browser install
```

Only the `chromium` project is enabled; firefox/webkit are commented out in the config. `retries: 2` applies locally as well as on CI, so a flaky failure will silently pass on retry — check the HTML report for retried attempts.

TypeScript is **not** a dependency, so there is no typecheck step and Playwright transpiles without checking types. Type errors surface only in the editor, never as a failing run — don't take a green suite as evidence the types line up.

Note: both `package-lock.json` and `pnpm-lock.yaml` are present. CI (`.github/workflows/playwright.yml`) uses `npm ci`, so keep `package-lock.json` in sync when changing dependencies.

## Architecture

### Fixtures are the entry point — `tests/fixtures.ts`

Specs import `test` from `../fixtures`, **never from `@playwright/test`**. That module extends the base `test` with one fixture per page object plus `accountApi`, so a test declares what it needs by destructuring:

```ts
test('...', async ({ homePage, loginPage, accountApi }) => { … })
```

Nothing is instantiated inside the test body. When you add a page object, register it in the `Fixtures` type and the `base.extend` call, and export it from the relevant barrel (`tests/pages/index.ts`, `tests/api/index.ts`). `expect` is re-exported from `tests/fixtures.ts` as well.

### API for setup and teardown — `tests/api/account.api.ts`

`AccountApi` wraps the site's REST endpoints on the `request` fixture: `POST /api/createAccount`, `DELETE /api/deleteAccount`, both `form`-encoded.

Use it to reach the **precondition** a test needs and to clean up afterwards, so the UI steps only exercise the behaviour actually under test. Cases 2, 4 and 5 all need an existing account, and none of them is testing registration — so they create it over the API and only drive the browser for login / logout / duplicate-email.

**This API returns HTTP 200 even for logical failures**, with the real outcome in the JSON body. That is why both are asserted: `response.status()` *and* `body.responseCode` / `body.message`. Checking only the status code would let a failed setup pass silently and surface later as a confusing UI failure.

The site is public and shared, so every test that creates an account must delete it — over the API when deletion isn't the thing being tested (Cases 4, 5), through the UI when it is (Cases 1, 2).

### Page Object Model — `tests/pages/*.page.ts`

One class per page. Each follows the same shape:

- `protected readonly path` — the page's URL path, used by `navigate()` and by the `expect*` assertions
- `readonly` `Locator` fields assigned in the constructor, scoped to a container (`.shop-menu`, `.login-form`, `.signup-form`) so ambiguous elements resolve — the site renders a login form and a signup form on the same page, both matching `Email Address`
- `navigate()` — goto the path
- assertion methods named `expect<Region>()` — `expectHeader`, `expectLoginForm`, `expectSignupForm`, `expectRegisterForm`, `expectAccountCreated`, `expectAccountDeleted`, `expectLoginError`, `expectSignupError`. There is deliberately no generic `validate()`: each one asserts a single region, so a test states exactly which part of the page it depends on.
- action methods — `fillSignupForm`, `submitRegisterForm`, `menuClick`, `continueToHome`

Assertions live in the page objects, not in the spec; the spec reads as a linear script of page-object calls.

`HomePage.checkLoggedIn` / `checkLoggedOut` assert the full header state (which links are visible *and* which are hidden), not just the username.

`expectHeader()` asserts the URL is `/`, so it belongs to the page you are actually on: call it *before* `menuClick(MenuLinks.SIGNUP_LOGIN)`, then `loginPage.expectLoginForm()` after. Calling it post-navigation asserts `/` while the browser sits on `/login`.

Header navigation goes through the `MenuLinks` enum (`tests/enum/menu-links.enum.ts`) — `menuClick` takes `MenuLinks`, not a string, so a typo is a compile error rather than a locator timeout.

### Test data

`utils/user.factory.ts` — `createUser()` returns a user whose `name`/`email` are salted with `Date.now()`, so each run registers a fresh account.

Call `createUser()` **inside each test**, not at module scope, so every test owns an account nobody else deletes.

Case 3 leans on the factory for a different reason: a freshly generated email has never been registered, which is exactly the precondition "login with incorrect credentials" needs.

Two known warts here, both invisible at runtime because nothing typechecks:

- The factory declares its own `UserDataProps` interface and a local `Titles` enum, duplicating `tests/types/user.type.ts`. Enums are nominal in TypeScript, so the local `Titles` is not assignable to `UserType['title']` — new code should import `UserType`/`Titles`/`Country` from `tests/types/user.type.ts`.
- `Date.now()` alone is only unique per millisecond. With `fullyParallel: true`, workers can start inside the same millisecond and collide on one email; add a random suffix if that shows up as a flake.

### A trap this site sets

**`Continue` is a link, not a button.** On `/account_created` and `/delete_account` it's an `<a>`, so `getByRole('button', …)` hangs until the timeout. When a locator times out, read `test-results/<test>/error-context.md` — it contains the accessibility snapshot and names the real role.

### Conventions

- `#id` locators scoped to a form container for the signup/register form; role-based locators (`getByRole('link', { name })`) for navigation and headings.
- Comments in the page objects are in Portuguese; the user is a pt-BR speaker. Match the surrounding language when editing a file that already has them.
- Everything lives under `tests/` but only `*.spec.ts` is collected — Playwright's default `testMatch` ignores the page objects, fixtures, api and enums.
