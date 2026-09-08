# Spond / Unify Platform — Unit Test Strategy & Architecture Plan

## 1. Executive Overview
The **Spond / Unify Platform** is an enterprise-grade dual-domain platform supporting **Sports Clubs** (teams, rosters, matches, attendance, venue bookings) and **Band / Music Management** (artists, gigs, venues, analytics), backed by FastAPI (Async Python), MongoDB (Motor), Redis, and Next.js 15 (React 19, TypeScript, Redux Toolkit).

This test plan defines the unit testing architecture, test isolation strategies, boundary mocking, coverage benchmarks, and verification gates for both backend and frontend layers.

---

## 2. Test Architecture & Framework Stacks

### A. Backend Architecture (`/backend`)
* **Test Runner:** `pytest` (8.3.4) with `pytest-asyncio` (0.25.2) in `mode = auto`.
* **Coverage Engine:** `pytest-cov` (7.1.0) and `coverage` (7.16.0) targeting `src/`.
* **HTTP Client:** `httpx` (0.28.1) with FastAPI `TestClient`.
* **Mock Engine:** In-memory async MongoDB engine (`MockMongoDatabase`, `MockCollection`, `MockAsyncCursor`) + In-memory `MockRedis` + `unittest.mock.MagicMock` for Razorpay and `EmailService`.

### B. Frontend Architecture (`/frontend`)
* **Test Runner:** `vitest` (5.0.0) with `@vitejs/plugin-react` (React 19 JSX transformation).
* **DOM Environment:** `jsdom` (27.x) and `@testing-library/react` (16.x).
* **Coverage Engine:** `@vitest/coverage-v8` targeting `src/**/*.{ts,tsx}`.
* **State & Store Testing:** Pure reducer and thunk action tests for Redux Toolkit slices.

---

## 3. Test Isolation & Mocking Boundaries

| Dependency | Isolation Mechanism | Verification Scope |
|---|---|---|
| **MongoDB (Motor)** | `MockMongoDatabase` with in-memory BSON ObjectId indexing and query filtering (`$or`, `$in`, `$ne`). | Verifies queries, projections, document insertion, and state updates without live Mongo. |
| **Redis** | `MockRedis` implementing `get`, `set` (with `nx` and `ex`), `delete`, `exists`, `expire`. | Verifies token storage, single-use JTI revocation, and slot distributed locking. |
| **Razorpay** | `mock_razorpay_client` (`order.create`, `utility.verify_payment_signature`, `payment.refund`). | Validates paise conversions, notes payloads, valid HMAC signatures, and signature mismatch errors. |
| **Email (SMTP)** | Monkeypatched `EmailService` async methods (`send_password_reset_email`, `send_otp_email`, `send_group_invite_email`). | Verifies email dispatch calls without sending network packets. |
| **Local Storage** | `window.localStorage` in `jsdom` with automated cleanup in `beforeEach`. | Validates token persistence, user serialization, and corrupted JSON fallbacks. |

---

## 4. Coverage Benchmarks & Quality Gates

* **Core Business Logic (Sports Groups, Venues, Bookings):** ≥ 85%
* **Security, Crypto & RBAC (`src/core/security`, `src/constants/roles`):** ≥ 90%
* **Payment Processing (`PaymentService`):** ≥ 85%
* **Pure Utilities & Validation Schemas:** ≥ 90%
* **Zero Critical Defect Policy:** No unresolved critical defects or unhandled exceptions in production code.
