---
name: eventhub-evolution
description: >-
  Evolution guide and engineering runbook for transforming the existing Band Connection
  functionality into the EventHub entertainment marketplace. Use this skill whenever
  implementing, modifying, testing, or reviewing EventHub features, provider onboarding,
  event-centric multi-provider bookings, and milestone payments (25% advance / 75% final).
---

# 🎸 EventHub Evolution Skill & Engineering Runbook

This skill defines the architectural guidelines, strict isolation boundaries, development rules, cardinality rules, and state machine contracts for evolving the existing **Band Connection** module into the full **EventHub Entertainment Marketplace**.

---

## ⛔ Strict Isolation & Development Boundaries (Zero Tolerance)

1. **Sports Module is STRICTLY OUT OF SCOPE:**
   - **NEVER** modify, delete, refactor, or import from/to `frontend/src/app/(sports)/*`, `frontend/src/sports/*`, `frontend/src/store/sports/*`, `backend/src/modules/sports/*`, `backend/src/services/sports_service.py`, `backend/src/repositories/sports.py`, or `backend/src/schemas/sports.py`.
2. **Evolution, NOT a Rewrite:**
   - Always analyze and extend existing code in `frontend/src/band/`, `frontend/src/store/band/`, `frontend/src/services/band/`, `backend/src/modules/band/`, and `backend/src/services/band_service.py`.
   - Preserve existing working functionality and UI components.
3. **Selective Modification (Do NOT Blindly Modify All Pages):**
   - Modify ONLY the specific pages, services, or models required for EventHub customer events, provider reviews, and milestone payments. Do not touch unrelated pages unless necessary.
4. **No Inventory Invention:**
   - Clearly label all items as `[EXISTING]`, `[EXTENDED / MODIFIED]`, or `[NEW]`. Do not invent APIs, collections, or components that do not exist.
5. **No Duplicate Code:**
   - Reuse existing utilities (`apiClient`, `useRazorpay`, `formatDate`, `formatCurrency`, `getInitials`, `BaseRepository`).

---

## 📐 Cardinality & Core Architecture

EventHub is an event-centric marketplace connecting customers to entertainment providers.

```
                  ┌──────────────────────┐
                  │      USER (1)        │
                  └──────────┬───────────┘
                             │ creates
                             ▼
                  ┌──────────────────────┐
                  │     EVENTS (N)       │
                  └──────────┬───────────┘
                             │ contains (0..N)
                             ▼
                  ┌──────────────────────┐
                  │    BOOKINGS (N)      │
                  └──────────┬───────────┘
                             │ belongs to (1)
                             ▼
                  ┌──────────────────────┐
                  │     PROVIDER (1)     │
                  │ (Venue/Artist/Band)  │
                  └──────────────────────┘
```

### Cardinality Summary:
- **User $1 \longrightarrow N$ Events:** A user can create multiple events over time.
- **Event $1 \longrightarrow N$ Bookings:** An event can contain zero or multiple independent provider bookings (e.g. 1 Venue + 1 Live Band + 1 DJ).
- **Booking $1 \longrightarrow 1$ Provider:** Each individual booking document belongs to exactly one provider (either a Venue, an Artist, or a Band).
- **Optionality:** Adding a Venue, Artist, or Band to an event is completely optional.

---

## 🔄 Booking & Milestone Payment State Machine

Booking Status and Payment Status are **separate concepts** tracked independently.

### Strict Workflow:
1. **Request:** Customer submits booking $\longrightarrow$ `Booking: REQUESTED`, `Payment: UNPAID`.
2. **Provider Review:**
   - If Provider **Rejects** $\longrightarrow$ `Booking: REJECTED`, `Payment: UNPAID` (Closed).
   - If Provider **Accepts** $\longrightarrow$ `Booking: ACCEPTED`, `Payment: ADVANCE_PAYMENT_PENDING`.
3. **Advance Deposit (25%):**
   - Customer initiates 25% payment via Razorpay.
   - Backend cryptographically verifies Razorpay signature (`POST /api/v1/payments/verify-signature`).
   - $\longrightarrow$ `Booking: CONFIRMED`, `Payment: ADVANCE_PAID`.
4. **Event Performance:**
   - Event day arrives.
   - Provider marks performance completed $\longrightarrow$ `Booking: EVENT_COMPLETED`, `Payment: FINAL_PAYMENT_PENDING`.
   - *(Note: Provider completion does NOT automatically charge the customer; it makes the final balance available/payable by the customer).*
5. **Final Settlement (75%):**
   - Customer initiates remaining 75% payment via Razorpay.
   - Backend cryptographically verifies signature.
   - $\longrightarrow$ `Booking: FULLY_PAID` / `COMPLETED`, `Payment: FULLY_PAID`.
6. **Review & Testimonial:** Verified customer review unlocks for the provider.

---

## 🛠️ Evolution Workflows & Development Rules

When implementing or modifying any part of EventHub, follow these exact procedures:

### Step 1: Check Database Extensions & Compatibility
- Review [database-models.md](./references/database-models.md).
- Inspect existing collections (`artists`, `bands`, `band_venues`, `band_bookings`) before proposing changes. Extend existing collections safely with optional fields.
- Ensure `BaseRepository.insert()` return type is handled safely by extracting `created["id"]`.

### Step 2: Provider Profiles & Dynamic Lineups
- Review [provider-profiles.md](./references/provider-profiles.md) and [band-packages.md](./references/band-packages.md).
- Ensure Band packages support **dynamic instrument/team lineups** (arbitrary instrument names and quantities, e.g. 2 Drummers, 1 Sitar, 3 Brass, 1 Synth) rather than static hardcoded fields.

### Step 3: Booking & Milestone Payments Flow
- Review [booking-payment.md](./references/booking-payment.md).
- Use `POST /api/v1/payments/create-order` and `POST /api/v1/payments/verify-signature` for both 25% and 75% transactions.
- **Never trust frontend callbacks directly** for status transitions.

### Step 4: Selective Frontend Modification
- Modify only the necessary pages in `frontend/src/band/pages/` and state in `frontend/src/store/band/`.
- Ensure type safety across all modified components.

### Step 5: Testing & Verification
- Run `npx tsc --noEmit` in frontend.
- Run backend automated test suites to ensure 100% pass rate.

---

## 📚 Detailed Reference Documentation

- **[System Architecture](./references/architecture.md):** High-level topology, cardinality rules, and customer vs provider app domains.
- **[Booking & Milestone Payments](./references/booking-payment.md):** State machine, 25/75 milestone formulas, and Razorpay HMAC signature verification.
- **[Provider Profiles](./references/provider-profiles.md):** Onboarding, catalog, and request review workflows for Venues, Artists, and Bands.
- **[Band Packages & Dynamic Lineups](./references/band-packages.md):** Dynamic team composition, instrument dictionaries, and pricing models.
- **[Database Models & Schemas](./references/database-models.md):** Collection reuse vs new models, Pydantic schemas, and backward compatibility.
