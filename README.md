# AssetVault — SE411 Project, Part 1

A React application for managing a portfolio of **financial assets** — equities,
bonds, funds, cryptocurrency and cash.

**SE411 Software Construction · Fall 2026/2027 · Section 1383**

Part 1 is the frontend only. The portfolio is an in-memory collection of JavaScript
objects, as the brief requires — no database. Part 2 adds the backend.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests on change |
| `npm run test:coverage` | Tests with a coverage report |
| `npm run lint` | Lint the source |

Requires Node 18+ (developed on Node 26).

---

## Features

| Feature | Where |
| --- | --- |
| **Dashboard** — totals, unrealised gain, allocation by category, best/worst performer | `/` |
| **Asset list** — table with derived market value and return, colour-coded | `/assets` |
| **Search** — live, across ticker, name, category and notes | `/assets` |
| **Filter and sort** — by category; by ticker, name, value or return | `/assets` |
| **Add** — validated form with per-field errors and duplicate detection | `/assets/new` |
| **Update** — same form, pre-filled | `/assets/:id/edit` |
| **Delete** — with a confirmation dialog | `/assets` |
| **About** — team members and project summary | `/about` |

---

## Documentation

| Document | Contents |
| --- | --- |
| [docs/requirements.md](docs/requirements.md) | Functional and non-functional requirements, data model, business rules |
| [docs/architecture.md](docs/architecture.md) | Technology stack, layered structure, state management, design decisions, Part 2 readiness |
| [docs/code-review.md](docs/code-review.md) | Security, performance, code quality, reuse, testing and accessibility review |

---

## Technology stack

**React 19** · **Vite 8** · **React Router 7** · **Vitest** + **React Testing Library**
· hand-written CSS with design tokens.

Three runtime dependencies (`react`, `react-dom`, `react-router-dom`). `npm audit`
reports **0 vulnerabilities**.

---

## Architecture in one picture

```
pages/        route-level screens
components/   reusable presentation
state/        useReducer + Context
domain/       pure business logic — no React imports
data/         the in-memory collection
```

Dependencies point downward only, which is why all business logic is testable without
rendering a component, and why Part 2 can reuse it server-side.

---

## Tests

```bash
npm test
```

**56 tests passing · 93.5% statement coverage.**

Unit tests cover the pure domain logic and the reducer, including edge cases —
division by zero, empty portfolios, floating-point drift, boundary values.
Integration tests render the real app and drive it with `userEvent` through
accessible roles and labels, so a test passes only if the feature is reachable the way
a user reaches it.

---

## Team

| Name | Student ID |
| --- | --- |
| Ibrahim Alhalaki | 223110482 |
| Muhammad Abanmi | 222110412 |
| *third member* | *to be added* |

The About page in the app carries the same list and marks outstanding entries.

---

## Scope note

Part 1 keeps the portfolio in memory, so **refreshing the page resets it to the seed
data**. That is intentional: the brief specifies a collection of objects rather than a
database, and persistence arrives with the backend in Part 2.
