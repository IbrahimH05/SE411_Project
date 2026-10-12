# AssetVault — Code Review

**Course:** SE411 Software Construction, Fall 2026/2027 · Section 1383
**Scope:** Part 1 frontend — security, performance, code quality, code reuse, testing
**Method:** AI-assisted review (Claude). Every metric quoted below was measured, not
estimated; the commands are given so anything here can be reproduced.

---

## Summary

| Area | Verdict | Notes |
| --- | --- | --- |
| Security | **Good for scope** | 0 vulnerabilities; no XSS sinks; validation is defence-in-depth, not a trust boundary |
| Performance | **Good** | 88 kB gzipped; recompute cost is trivial at this scale, with known limits |
| Code quality | **Good** | Layered, pure business logic, lints clean |
| Code reuse | **Good** | One form serves create and edit; one validator drives all error UI |
| Testing | **Strong** | 56 tests, 93.5% statements, behaviour-level |

Findings are numbered and marked **Fixed** (already addressed) or **Accepted**
(deliberate, with reasoning) or **Part 2** (deferred to the backend phase).

---

## 1. Security

### Measured

```bash
npm audit          # found 0 vulnerabilities
npm audit --omit=dev   # found 0 vulnerabilities
```

Three runtime dependencies only: `react`, `react-dom`, `react-router-dom`. A small
dependency surface is itself a security property — most real-world JavaScript
compromises arrive through transitive packages.

### S-1 — No XSS sinks · Accepted

`grep -rn "dangerouslySetInnerHTML\|eval(\|innerHTML" src/` returns nothing. All user
input reaches the DOM through JSX interpolation, which React escapes automatically.
User-supplied notes, names and tickers are rendered as text and cannot execute.

### S-2 — Input validation is UX, not a security boundary · Accepted, Part 2

Every field is validated, including a `1–10 chars of A–Z 0–9 . -` pattern on tickers
and length caps on name and notes. **This is not a security control.** It runs in the
browser, where a user can bypass it entirely via devtools.

It is worth stating plainly because it is the single most common misconception in
projects of this shape: client-side validation exists to give fast feedback, and the
same rules **must** be re-applied server-side in Part 2. The rules live in
`domain/assetValidation.js` precisely so they can be shared rather than reimplemented
and allowed to drift.

### S-3 — IDs are UUIDs, not array indices · Fixed

`createId()` uses `crypto.randomUUID()`. Using an array index as an identity breaks
the moment a row is deleted — the id of every later row shifts, and an edit or delete
targets the wrong asset. It would also be an insecure-direct-object-reference pattern
once a real API exists.

### S-4 — No secrets, no network calls · Accepted

Part 1 makes no requests and holds no credentials, so there is nothing to leak. Part 2
must not put API keys in frontend code: anything in a Vite `VITE_*` variable is
**compiled into the public bundle** and readable by any visitor.

### S-6 — A transitive dev dependency advisory appeared after the build · Fixed

The first audit of this project reported zero vulnerabilities. Weeks later a clean
`npm install` warned of one **high** severity issue in `source-map-js` 1.2.1
([GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), an
event-loop denial of service), reached transitively through the build tooling.

Two things are worth drawing out:

- **It was dev-only.** `npm audit --omit=dev` stayed clean throughout, so nothing
  reached a visitor of the deployed site. The distinction between a build-time and a
  runtime dependency is the whole reason that flag exists.
- **"0 vulnerabilities" is a timestamp, not a property.** Nothing in this repository
  changed; the advisory did. A dependency audit is only ever true as of the day it
  was run, which is the argument for running it in CI rather than once at the end.

Fixed by `npm audit fix`, a single patch bump to 1.2.2 recorded in the lockfile.
Tests, lint and build all unaffected.

### S-5 — Financial data in a client-only store · Accepted for Part 1

The portfolio never leaves the browser tab and is gone on refresh, which is the
safest possible arrangement. When Part 2 adds persistence, holdings become personal
financial data and need authentication, authorisation and transport security.

---

## 2. Performance

### Measured

```
dist/assets/index-BSU6gcE_.js   280.0 kB │ gzip: 88.2 kB
dist/assets/index-zcnKWANI.css    7.9 kB │ gzip:  2.4 kB
Build time: ~0.6 s
```

88 kB gzipped is a healthy total for React plus a router — most of it is React itself.

### P-1 — Derived values recomputed every render · Accepted

`marketValue`, `gain` and `gainPercent` are recomputed rather than stored. That is a
deliberate correctness-over-speed trade: a stored derived value can silently disagree
with the fields it came from after an edit.

At realistic portfolio sizes this is free — a few dozen multiplications per render.
It would stop being free in the hundreds-to-thousands of rows, at which point the fix
is virtualisation (`react-window`) rather than caching, because the real cost would be
DOM nodes, not arithmetic.

### P-2 — Filtering is memoised · Fixed

`AssetsPage` wraps `applyFilters` in `useMemo` keyed on assets, query, category and
sort. Without it, search/filter/sort would re-run on every keystroke-induced render,
including renders caused by unrelated state.

### P-3 — Context value is memoised · Fixed

`AssetsProvider` wraps its value in `useMemo` and every handler in `useCallback`. A
context value rebuilt as a fresh object literal on each render forces **every**
consumer to re-render regardless of whether the data changed — a very common and
easily missed React performance bug.

### P-4 — Sorting copies before sorting · Fixed

`Array.prototype.sort` mutates in place. `sortAssets` spreads into a new array first;
sorting the state array directly would mutate React state and cause missed renders. A
test asserts the input array is unchanged.

### P-5 — No code splitting · Accepted

The whole app is one chunk. With four small routes, splitting would add round-trips
for no meaningful gain. Worth revisiting in Part 2 if heavy charting libraries arrive.

---

## 3. Correctness: money handling

### C-1 — Floating-point currency · Mitigated, Part 2

JavaScript numbers are IEEE-754 binary floating point, so `0.1 + 0.2 === 0.30000000000000004`.
Accumulated across a portfolio, that produces totals that disagree with the sum of the
visible rows — the classic "the dashboard is off by a cent" bug.

**Mitigation applied:** `roundMoney` rounds to 2 decimal places inside every
calculation, not merely at display. A test asserts `roundMoney(0.1 + 0.2) === 0.3`.

**This is a mitigation, not a fix.** The robust approach is to store money as integer
minor units (cents) or use a decimal library, and it is the right call for Part 2
where values are persisted. It was not done here because it would mean a custom input
component and conversion at every boundary — disproportionate for Part 1, and worth
naming explicitly rather than leaving as an unexamined assumption.

### C-2 — Division by zero guarded · Fixed

`gainPercent` returns 0 when cost basis is 0, and `portfolioTotals` and
`allocationByCategory` both guard the empty-portfolio case. Without these the UI would
render `NaN` or `Infinity`. Each is covered by a test.

---

## 4. Code quality

### Q-1 — Business logic is framework-free · Strength

`domain/` imports nothing from React. This is why calculations, validation and
filtering are testable without rendering anything, and why Part 2 can reuse them
server-side unchanged.

### Q-2 — Lints clean · Fixed

`npm run lint` passes with no warnings. One `no-useless-escape` warning (a redundantly
escaped hyphen in the ticker regex) was found and fixed during review.

### Q-3 — Single source of truth for validation · Strength

`validateAsset` returns `{ field: message }` and drives the error text, the
`aria-invalid` attribute and the submit guard. The form cannot disagree with itself
about what is valid, because only one function decides.

### Q-4 — Type conversion happens at one boundary · Strength

DOM inputs produce strings. `normaliseAsset` converts to numbers on save,
`toFormValues` converts back for editing. No `"50"` can reach an arithmetic function
— a whole class of `"50" * 2 = 100` / `"50" + 2 = "502"` bugs is structurally
excluded.

### Q-5 — No prop-types or TypeScript · Accepted

Components have no runtime or compile-time prop checking. TypeScript would be the
correct answer on a larger codebase and is the main quality upgrade available here;
it was skipped because the brief asks for a React project and the type surface is
small. Worth reconsidering for Part 2.

### Q-6 — Comments are sparse by design · Accepted

The code carries few comments: names are chosen to make them unnecessary, and the
handful present explain *why* rather than *what* (for example, why sorting copies
first). Explanation lives in these documents rather than duplicated in source, where
it would drift.

---

## 5. Code reuse

### R-1 — One form for create and edit · Strength

`AssetForm` is used by both routes, differing only in initial values, submit label and
handler. Validation rules, markup, error rendering and accessibility attributes exist
once. Two copies would inevitably diverge — a rule added to "add" and forgotten in
"edit" is exactly how real systems accumulate inconsistency.

### R-2 — Composable filters · Strength

`searchAssets`, `filterByCategory` and `sortAssets` are independent pure functions
composed by `applyFilters`. Each is tested alone and in combination, and a new filter
slots in without touching the others.

### R-3 — Shared presentational components · Strength

`StatCard`, `EmptyState` and `ConfirmDialog` are used across pages. `EmptyState`
serves both "no assets at all" and "no search matches" with different copy and
actions.

### R-4 — Design tokens · Strength

Colour, spacing, radius and typography are CSS custom properties defined once. A theme
change is an edit to one block, not a search across files.

### R-5 — `fieldProps` helper · Strength

One helper produces `id`, `name`, `value`, `onChange`, `onBlur`, `aria-invalid` and
`aria-describedby` for each of eight fields. Without it, each field would repeat seven
attributes and one would eventually be missed — most likely an accessibility one.

---

## 6. Testing

### Measured

```
Test Files  5 passed (5)
Tests      56 passed (56)
Coverage   93.54% statements · 86.78% branches · 93.61% functions · 94.33% lines
```

### T-1 — Behaviour, not implementation · Strength

Integration tests render the real `<App/>` and drive it with `userEvent`. Queries use
roles and accessible labels (`getByRole('searchbox')`, `getByLabelText('Ticker')`), so
a test passes only if the feature is reachable the way a user reaches it — which makes
the suite double as an accessibility check. No shallow rendering, no assertions on
internal state.

### T-2 — Requirement coverage

| Requirement | Covered by |
| --- | --- |
| FR-2 navigation | `moves between features using the menu`, `marks only one menu item current`, `keeps Assets current while editing` |
| FR-3 add | `rejects an empty form`, `adds a valid asset`, `blocks a duplicate ticker`, plus 10 validation unit tests |
| FR-4 display | `lists every asset`, `shows portfolio totals`, `prompts to add an asset when empty`, plus 11 calculation tests |
| FR-5 search/filter | `filters the table as the user types`, `filters by category`, `shows an empty state and can clear filters`, plus 12 filter unit tests |
| FR-6 update | `pre-fills the form and saves changes`, `redirects for an unknown id`, `allows an asset to keep its own ticker` |
| FR-7 delete | `asks for confirmation and can be cancelled`, `removes the asset once confirmed` |
| FR-8 about | `shows the team on the about page` |

### T-3 — A test caught a real mistake during development · Worth recording

The first version of `applyFilters`' composition test asserted that searching `'a'`
would match two of three seed assets. It failed: the third also matched, through its
`volatile` note. The **code was right and the test's expectation was wrong** — the
search deliberately covers notes. The test was corrected to assert the real behaviour
plus two sharper cases. Recorded because "the test failed, so change the code" is the
wrong reflex; the failure should first be read as a question about which side is
mistaken.

### T-4 — Uncovered branches · Accepted

The ~6.5% uncovered lines are defensive fallbacks: the `createId` path for
environments without `crypto.randomUUID`, the `default` branch of the reducer switch,
and the `useAssets`-outside-provider guard. These exist to fail loudly if reached and
are not worth contorting tests to exercise.

### T-5 — No visual regression or E2E tests · Accepted

The UI was verified manually in a browser across all four pages. Playwright E2E and
screenshot diffing would be the next step on a production system; for Part 1 the
integration tests already exercise every user flow in a real DOM.

---

## 7. Accessibility

Reviewed because it materially affects quality, and because RTL's role-based queries
make it cheap to verify.

| Check | Status |
| --- | --- |
| Every input has an associated `<label>` | Pass |
| Errors announced with `role="alert"` and linked via `aria-describedby` | Pass |
| Invalid fields marked `aria-invalid` | Pass |
| Delete dialog is `role="alertdialog"` with `aria-modal` | Pass |
| Dialog moves focus to the confirm button on open | Pass |
| Dialog closes on Escape | Pass |
| Current menu item exposed via `aria-current="page"` | Pass |
| Status messages use `role="status"` | Pass |
| Visually hidden labels for toolbar controls (`.sr-only`) | Pass |
| Focus visible on all interactive elements | Pass |
| Colour is not the only signal for gain/loss (sign and `+`/`−` shown) | Pass |

**A-1 — Focus is not trapped inside the dialog · Accepted.** Tab can reach elements
behind the modal. Full focus trapping needs a library or ~30 lines of manual handling;
noted rather than silently omitted.

---

## 8. Prioritised recommendations for Part 2

| Priority | Item | Ref |
| --- | --- | --- |
| **High** | Re-apply all validation server-side; never trust the client | S-2 |
| Medium | Run `npm audit` in the deploy workflow so advisories surface on their own | S-6 |
| **High** | Store money as integer minor units or use a decimal library | C-1 |
| **High** | Add authentication and authorisation before persisting holdings | S-5 |
| Medium | Adopt TypeScript for compile-time safety across the API boundary | Q-5 |
| Medium | Add optimistic updates and error states once calls are asynchronous | — |
| Medium | Trap focus in the confirmation dialog | A-1 |
| Low | Virtualise the table if portfolios grow past a few hundred rows | P-1 |
| Low | Add Playwright E2E coverage | T-5 |
