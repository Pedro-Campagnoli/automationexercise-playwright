# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Playwright end-to-end tests against the public practice site **automationexercise.com**, following its published test case list ("Test Case 1: Register User", etc.). Tests run against a live external site — there is no app in this repo to build or serve.

`BASE_URL` comes from `.env` (gitignored, not committed) and is wired to the chromium project's `baseURL` in `playwright.config.ts` via `dotenv`. Without a `.env` containing `BASE_URL`, every `page.goto('/')` and every API call fails — this is the first thing to check on a fresh clone.

## Commands

This project uses **pnpm** — `pnpm-lock.yaml` is the only lockfile and CI runs `pnpm install --frozen-lockfile`. Don't reintroduce `package-lock.json`.

```bash
pnpm test                     # playwright test --ui  (UI mode, NOT headless)
pnpm debug                    # playwright test --debug
pnpm exec playwright test     # headless run (what CI does)
pnpm exec playwright test --headed
pnpm exec playwright test tests/specs/test-cases.spec.ts
pnpm exec playwright test -g "Test Case 1"   # single test by title
pnpm exec playwright show-report
pnpm exec playwright install --with-deps      # first-time browser install
```

Only the `chromium` project is enabled; firefox/webkit are commented out in the config. `retries: 2` applies locally as well as on CI, so a flaky failure will silently pass on retry — check the HTML report for retried attempts.

Types are checked by a **separate** step: `pnpm typecheck` (`tsc --noEmit`, driven by `tsconfig.json` — `strict`, plus `noUncheckedIndexedAccess` and `noImplicitReturns`), which CI runs before installing browsers. Playwright itself still transpiles without checking types, so a green suite is not evidence the types line up — run the typecheck too.

CI (`.github/workflows/playwright.yml`) injects `BASE_URL` itself — the repository variable `BASE_URL` if set, otherwise `https://automationexercise.com` — because `.env` is not versioned.

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

Header navigation goes through the `MenuLinks` enum (`tests/enums/menu-links.enum.ts`) — `menuClick` takes `MenuLinks`, not a string, so a typo is a compile error rather than a locator timeout.

### Test data

`tests/utils/user.factory.ts` — `createUser(): UserType` builds a fully random user with `@faker-js/faker`. It declares no types of its own: `UserType` comes from `tests/types/user.type.ts`, `Titles`/`Country` from `tests/enums/`.

Call `createUser()` **inside each test**, not at module scope, so every test owns an account nobody else deletes.

Case 3 leans on the factory for a different reason: a freshly generated email has never been registered, which is exactly the precondition "login with incorrect credentials" needs.

Faker output is deliberately constrained where the site or the assertions can't take arbitrary values — keep these in mind before loosening any of them:

- **`country` must come from the `Country` enum.** The site's `#country` select has exactly 7 options, and `selectOption` fails on anything else — never `faker.location.country()`.
- **`name` is a single first name, no space.** `checkLoggedIn` asserts `Logged in as <name>` with `exact: true`.
- **`zipcode` / `mobile` are pure digits.** `faker.location.zipCode()` and `faker.phone.number()` can emit letters, hyphens or extensions.
- **`password` is alphanumeric only**, so nothing depends on how the site or the form-encoded API handles special characters.
- **`day` maxes out at 28** so the generated birth date always exists; `day`/`month`/`year` are strings because the selects match on numeric `value`.
- **`email` still carries a `Date.now()` + random suffix.** Faker alone repeats values, and a collision on this shared site means one test deletes another's account.

Faker means every run exercises different data (country, title, newsletter/offers checkboxes), so a failure may not reproduce on the next run. Grab the concrete values from the HTML report or `test-results/<test>/error-context.md` before re-running.

### A trap this site sets

**`Continue` is a link, not a button.** On `/account_created` and `/delete_account` it's an `<a>`, so `getByRole('button', …)` hangs until the timeout. When a locator times out, read `test-results/<test>/error-context.md` — it contains the accessibility snapshot and names the real role.

### Conventions

Everything lives under `tests/`, one folder per layer:

```
tests/
├── api/      AccountApi + barrel
├── enums/    site vocabulary: MenuLinks, Titles, Country (one enum per file)
├── pages/    *.page.ts + barrel
├── specs/    *.spec.ts  <- testDir points here
├── types/    pure shapes only (UserType)
├── utils/    user.factory.ts
└── fixtures.ts
```

- `testDir` is `./tests/specs`, not `./tests` — the rest of `tests/` is support code, so pointing it at the whole tree only worked because the default `testMatch` filtered it. Note this makes report paths relative to `tests/specs/`.
- **Enums vs types**: `enums/` holds constraints the site imposes (the 7 `#country` options, the header link labels); `types/` holds data shapes. An enum does not belong in `types/user.type.ts`.
- Barrels exist for `pages/` and `api/` because `fixtures.ts` consumes those two. The other folders have none on purpose.
- `#id` locators scoped to a form container for the signup/register form; role-based locators (`getByRole('link', { name })`) for navigation and headings.
- Comments in the page objects are in Portuguese; the user is a pt-BR speaker. Match the surrounding language when editing a file that already has them.
