# AssetVault — Architecture

**Course:** SE411 Software Construction, Fall 2026/2027 · Section 1383
**Part 1:** React frontend, in-memory data

---

## 1. Technology stack

| Layer | Choice | Why this one |
| --- | --- | --- |
| UI library | **React 19** | Mandated by the brief |
| Build tool | **Vite 8** | Near-instant dev server and HMR; the current default for React projects and far lighter than Create React App, which is deprecated |
| Routing | **React Router 7** | Gives each feature a real URL, so the menu is genuine navigation and pages are deep-linkable |
| State | **`useReducer` + Context** | The portfolio is one small collection with four operations; Redux or Zustand would be dependencies earning nothing here |
| Styling | **Hand-written CSS with custom properties** | Zero dependencies, no build step, every rule explainable in a viva. Design tokens give consistency without a framework |
| Tests | **Vitest + React Testing Library** | Vitest shares Vite's transform pipeline, so tests need no separate build config. RTL tests behaviour through the DOM the user actually sees |
| Linting | **oxlint** | Ships with the Vite template; fast |

**No runtime dependency beyond React, React DOM and React Router.** Every other
package is a dev dependency. `npm audit` reports 0 vulnerabilities.

---

## 2. Layered structure

The codebase is deliberately layered so that business rules do not depend on React:

```
┌──────────────────────────────────────────────────────┐
│  pages/          Dashboard · Assets · Form · About   │  route-level screens
├──────────────────────────────────────────────────────┤
│  components/     NavBar · AssetTable · AssetForm     │  reusable presentation
│                  StatCard · ConfirmDialog · Empty    │
├──────────────────────────────────────────────────────┤
│  state/          AssetsProvider · assetsReducer      │  application state
├──────────────────────────────────────────────────────┤
│  domain/         calculations · validation · filters │  pure business logic
├──────────────────────────────────────────────────────┤
│  data/           seedAssets                          │  in-memory collection
└──────────────────────────────────────────────────────┘
```

Dependencies point **downward only**. `domain/` imports nothing from React, which is
why 100% of the calculation logic can be tested without rendering a component — and
why Part 2 can move that logic to a server untouched.

### Directory map

```
src/
├── main.jsx                  entry: mounts providers and the router
├── App.jsx                   route table and page shell
├── index.css                 design tokens + all styling
├── domain/
│   ├── assetModel.js         shape, categories, form ⇄ model conversion
│   ├── assetCalculations.js  derived values, totals, formatting
│   ├── assetValidation.js    field rules, returns an error map
│   └── assetFilters.js       search, category filter, sort, composition
├── state/
│   ├── assetsReducer.js      pure reducer: add / update / delete / reset
│   ├── AssetsContext.js      context + useAssets hook
│   └── AssetsProvider.jsx    wires reducer to context
├── data/seedAssets.js        six sample holdings
├── components/               presentation, no business logic
├── pages/                    one per route
└── test/                     setup, render helper, integration tests
```

---

## 3. State management

### Why a reducer

All four mutations are described as plain data:

```js
{ type: 'add',    payload: asset }
{ type: 'update', payload: { id, changes } }
{ type: 'delete', payload: { id } }
{ type: 'reset',  payload: { assets } }
```

`assetsReducer` is a pure function of `(state, action)`. That makes every state
transition testable with no React at all — `assetsReducer.test.js` calls it
directly — and it is the same shape a Redux store or a server endpoint would take,
so Part 2 will not require rethinking it.

The reducer never mutates: `ADD` spreads into a new array, `UPDATE` maps, `DELETE`
filters. A test asserts the previous state object is untouched, because accidental
mutation is the classic way React stops re-rendering.

### Why Context

`AssetsProvider` exposes the collection and four callbacks. Context avoids threading
props through every page, and the value is wrapped in `useMemo` with `useCallback`
handlers so consumers do not re-render on unrelated parent updates.

`useAssets()` throws a clear error if used outside the provider, turning a confusing
`null` dereference into an immediate, explanatory failure.

### Data flow

```
user event → page handler → context callback → dispatch → reducer
                                                            ↓
                              new assets array → context → re-render
                                                            ↓
                          domain/ recomputes derived values for display
```

Derived values are **never stored**. Market value and gain are recomputed from
quantity and price on every render, so they cannot drift out of sync with the fields
they come from. For a portfolio of this size the cost is negligible; §4 of the code
review covers when that stops being true.

---

## 4. Routing

| Route | Screen | Notes |
| --- | --- | --- |
| `/` | Dashboard | Totals, allocation, movers |
| `/assets` | Asset list | Search, filter, sort, edit, delete |
| `/assets/new` | Create form | |
| `/assets/:id/edit` | Edit form | Redirects to `/assets` for an unknown id |
| `/about` | About | Team and project description |
| `*` | → `/` | Catch-all redirect |

Create and edit share one `AssetFormPage` and one `AssetForm`, differing only by a
`mode` prop, initial values and submit handler — the validation rules, markup and
error rendering exist once.

---

## 5. Features

1. **Dashboard** — holdings count, market value, cost basis, unrealised gain with
   percentage, allocation bars by category, best and worst performer.
2. **Asset list** — sortable table with per-row derived values, colour-coded returns,
   and edit/delete actions.
3. **Search** — live, case-insensitive, across ticker, name, category and notes.
4. **Filter and sort** — by category; by ticker, name, market value or return. Both
   compose with search.
5. **Add** — validated form with per-field errors and duplicate-ticker detection.
6. **Update** — same form pre-filled; an asset may keep its own ticker.
7. **Delete** — confirmation dialog with focus management and Escape-to-cancel,
   followed by a status message.
8. **About** — team members with student IDs, plus project and stack summary.

---

## 6. Key design decisions

**Validation returns an error map, not a boolean.** `validateAsset` returns
`{ field: message }`. One function drives per-field messages, `aria-invalid` flags
and the submit guard, so the form cannot disagree with itself about what is valid.

**Form state is strings; stored state is numbers.** DOM inputs always yield strings.
`normaliseAsset` converts at the boundary and `toFormValues` converts back, so no
`"50"` ever reaches an arithmetic function.

**Money is rounded at each step.** `roundMoney` is applied inside every calculation
rather than only at display time, so the dashboard total always equals the sum of the
rows on screen. §3 of the code review explains why this is a mitigation rather than a
full fix, and what Part 2 should do instead.

**Errors only appear after a field is touched.** Blur marks a field touched; only
then does typing re-validate live. An empty form does not greet the user with six red
messages, but a field you have visited corrects itself as you fix it.

---

## 7. Testing strategy

Two levels, deliberately:

- **Unit tests** over `domain/` and `state/` — pure functions, exhaustive on edge
  cases (division by zero, empty portfolio, floating-point drift, boundary values).
- **Integration tests** over the whole app — render `<App/>` inside a `MemoryRouter`
  and drive it with `userEvent` exactly as a user would: click the menu, type in
  search, submit forms, confirm dialogs.

There are **no tests of implementation details** — no shallow rendering, no
assertions on state variables. Queries use accessible roles and labels, so a test
passes only if the feature is reachable the way a real user reaches it.

**56 tests, all passing. 93% statement coverage.**

---

## 8. Part 2 readiness

The layering was chosen with the backend in mind:

- `domain/` is framework-free and can be reused or ported server-side as-is.
- The reducer's action shapes map one-to-one onto REST endpoints
  (`ADD` → `POST /assets`, `UPDATE` → `PUT /assets/:id`, `DELETE` → `DELETE /assets/:id`).
- Only `AssetsProvider` knows where data comes from. Swapping the seed array for
  `fetch` calls touches that one file; no page or component changes.
- `id` is already a server-safe UUID rather than an array index.
