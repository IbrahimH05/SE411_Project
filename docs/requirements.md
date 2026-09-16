# AssetVault — Requirements Specification

**Course:** SE411 Software Construction, Fall 2026/2027 · Section 1383
**Project:** Part 1 — React frontend
**Status:** Part 1 complete. Part 2 replaces the in-memory store with a backend.

---

## 1. Purpose and scope

AssetVault is a single-page web application for managing a portfolio of **financial
assets** — equities, bonds, funds, cryptocurrency and cash positions.

The brief requires exactly one asset type; financial assets were chosen because the
domain carries derived values (market value, cost basis, unrealised gain) that give
the display and dashboard features something substantive to compute, rather than
only echoing stored fields back.

### In scope for Part 1

Storing, displaying, searching, updating and removing assets, entirely in the
browser. The portfolio is a **plain in-memory collection of JavaScript objects**, as
the brief mandates — no database, no network calls, no persistence layer.

### Out of scope for Part 1

Backend API, database, authentication, multi-user support, real-time market prices,
and persistence across page reloads.

---

## 2. Stakeholders

| Actor | Goal |
| --- | --- |
| Portfolio owner | Record holdings, track what they are worth, see gains and losses |
| Course instructor | Verify every mandated feature is present and demonstrable |

---

## 3. Functional requirements

Each requirement has an ID used by the traceability matrix in §7.

### FR-1 — React project

| ID | Requirement |
| --- | --- |
| FR-1.1 | The application is built with React. |
| FR-1.2 | It builds to static assets with a single command. |

### FR-2 — Navigation menu

| ID | Requirement |
| --- | --- |
| FR-2.1 | A persistent menu is visible on every screen. |
| FR-2.2 | The menu links to every feature: Dashboard, Assets, Add asset, About. |
| FR-2.3 | The menu indicates which page is currently open. |
| FR-2.4 | Exactly one menu item is marked current at any time. |
| FR-2.5 | An unknown URL redirects to the Dashboard rather than showing a blank screen. |

### FR-3 — Add an asset (Create)

| ID | Requirement |
| --- | --- |
| FR-3.1 | The user can add an asset with ticker, name, category, quantity, purchase price, current price, purchase date and optional notes. |
| FR-3.2 | Every field is validated before the asset is accepted. |
| FR-3.3 | Validation errors appear next to the field they concern. |
| FR-3.4 | An invalid submission does not add anything and does not navigate away. |
| FR-3.5 | A duplicate ticker is rejected. |
| FR-3.6 | On success the user is returned to the asset list with the new asset visible. |

### FR-4 — Display assets (Read)

| ID | Requirement |
| --- | --- |
| FR-4.1 | All assets are listed in a table. |
| FR-4.2 | Each row shows stored fields plus derived market value, gain and gain percentage. |
| FR-4.3 | Gains are visually distinguished from losses. |
| FR-4.4 | An empty portfolio shows a helpful empty state, not a blank table. |
| FR-4.5 | A dashboard summarises the whole portfolio: holding count, market value, cost basis, unrealised gain, allocation by category, best and worst performer. |

### FR-5 — Search and filter

| ID | Requirement |
| --- | --- |
| FR-5.1 | A free-text search filters assets as the user types. |
| FR-5.2 | Search matches ticker, name, category and notes, case-insensitively. |
| FR-5.3 | Assets can be filtered by category. |
| FR-5.4 | Assets can be sorted by ticker, name, market value and return. |
| FR-5.5 | Search, filter and sort compose — applying one does not cancel another. |
| FR-5.6 | When nothing matches, an empty state offers to clear the filters. |

### FR-6 — Update an asset

| ID | Requirement |
| --- | --- |
| FR-6.1 | Any asset can be edited from the list. |
| FR-6.2 | The form is pre-filled with the asset's current values. |
| FR-6.3 | The same validation applies as when adding. |
| FR-6.4 | An asset may keep its own ticker while being edited. |
| FR-6.5 | Editing an asset that does not exist redirects to the list. |

### FR-7 — Remove an asset (Delete)

| ID | Requirement |
| --- | --- |
| FR-7.1 | Any asset can be deleted from the list. |
| FR-7.2 | Deletion requires explicit confirmation. |
| FR-7.3 | Cancelling leaves the portfolio unchanged. |
| FR-7.4 | Confirming removes only the chosen asset and confirms the removal. |

### FR-8 — About page

| ID | Requirement |
| --- | --- |
| FR-8.1 | A menu item opens an About page. |
| FR-8.2 | The About page lists each team member's name and student ID. |
| FR-8.3 | The About page describes the project and its technology stack. |

---

## 4. Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-1 | **Data model.** The portfolio is an in-memory collection of objects; no database is used in Part 1. |
| NFR-2 | **Accessibility.** Every input has a label; errors use `role="alert"`; the delete dialog is a focus-managed `alertdialog` dismissible with Escape; the current menu item is exposed via `aria-current`. |
| NFR-3 | **Responsiveness.** Usable from 360 px upward; the asset table scrolls horizontally rather than forcing the page to. |
| NFR-4 | **Monetary accuracy.** Currency arithmetic is rounded at each step so displayed totals equal the sum of displayed rows. |
| NFR-5 | **Testability.** Business logic is pure and testable without rendering React. |
| NFR-6 | **Build hygiene.** The project lints clean and builds with no errors. |

---

## 5. Data model

A single entity, `Asset`:

| Field | Type | Constraints |
| --- | --- | --- |
| `id` | string | Generated via `crypto.randomUUID()`; never user-supplied |
| `ticker` | string | Required, unique, 1–10 chars of `A–Z 0–9 . -`, upper-cased on save |
| `name` | string | Required, ≤ 80 characters |
| `category` | enum | One of Equity, Bond, Fund, Crypto, Cash |
| `quantity` | number | Required, > 0, finite |
| `purchasePrice` | number | Required, > 0, finite |
| `currentPrice` | number | Required, ≥ 0 (a holding may become worthless) |
| `purchaseDate` | ISO date | Required, a valid date, not in the future |
| `notes` | string | Optional, ≤ 280 characters |

Derived, never stored — recomputed on render so they can never go stale:

```
costBasis   = quantity × purchasePrice
marketValue = quantity × currentPrice
gain        = marketValue − costBasis
gainPercent = gain ÷ costBasis × 100      (0 when costBasis is 0)
```

---

## 6. Business rules

| ID | Rule | Rationale |
| --- | --- | --- |
| BR-1 | Tickers are unique across the portfolio | Two rows for one holding make totals meaningless |
| BR-2 | Tickers are stored upper-cased | `aapl` and `AAPL` are the same holding |
| BR-3 | Quantity and purchase price must exceed zero | A holding of zero units is not a holding |
| BR-4 | Current price may be zero | A position can become worthless; that is real data, not an error |
| BR-5 | Purchase date may not be in the future | You cannot have bought something you have not bought yet |
| BR-6 | Gain percentage is 0 when cost basis is 0 | Avoids division by zero producing `NaN` or `Infinity` on screen |

---

## 7. Traceability

Every functional requirement is covered by at least one automated test. See
[`code-review.md`](code-review.md) §6 for the mapping and the coverage report.
