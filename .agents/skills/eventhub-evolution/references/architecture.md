# 🏛️ EventHub System Architecture Specification

## 1. High-Level System Topology

EventHub evolves the existing Band Connection architecture into an event-centric marketplace serving two primary personas through distinct application sub-domains:

```
┌─────────────────────────────────────────────────────────────────┐
│                         EVENTHUB PLATFORM                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
          CUSTOMER APPLICATION          PROVIDER APPLICATION
                 │                             │
                 ▼                             ▼
              USER                    VENUE / ARTIST / BAND
                 │                             │
                 └──────────────┬──────────────┘
                                │
                                ▼
                         AUTHENTICATION
                                │
                         ┌──────┴──────┐
                         ▼             ▼
                       LOGIN       REGISTER
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
                  USER               VENUE             ARTIST / BAND
                                │
                                ▼
                         ROLE-BASED ACCESS
                                │
                                ▼
                        APPLICATION LAYER
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
    EVENTS                  PROVIDERS                 BOOKINGS
  [NEW CONTAINER]       [EXISTING / EXTENDED]   [EXTENDED STATE MACHINE]
       │                        │                        │
       │               ┌────────┼────────┐              │
       │               ▼        ▼        ▼              │
       │             VENUE    ARTIST    BAND            │
       │                                                 │
       └────────────────────────┬────────────────────────┘
                                │
                                ▼
                         AVAILABILITY ENGINE
                                │
                                ▼
                         MILESTONE PAYMENTS
                        (Razorpay Verified)
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
               25% ADVANCE             75% FINAL
              (Before Event)          (After Event)
                                │
                                ▼
                         REVIEWS & RATINGS
```

---

## 2. Cardinality Specification

EventHub strictly adheres to the following structural cardinality:

- **User $1 \longrightarrow N$ Events:** A customer can create and manage multiple events (e.g. "Summer Music Gala", "Company Anniversary", "Wedding").
- **Event $1 \longrightarrow N$ Bookings:** An event acts as a container for zero, one, or multiple independent provider bookings (e.g. 1 Venue + 1 Live Band + 1 DJ under 1 Event).
- **Booking $1 \longrightarrow 1$ Provider:** Every single booking document belongs to exactly one provider (either a single Venue, a single Artist, or a single Band).
- **Optionality:** Booking a Venue, Artist, or Band is completely optional per event. A customer can book only a Band, only a Venue, only an Artist, or any combination.

---

## 3. Inventory & Codebase Mapping

To prevent code duplication or unnecessary rewrites, all architecture artifacts are categorized:

### A. Existing Code to Reuse `[EXISTING]`
- **Frontend Core:** `frontend/src/app/(band)/band/` routing layout, `frontend/src/band/components/` UI cards (`ArtistCard`, `BandCard`, `VenueCard`, `ReviewCard`, `MarketplaceSearch`).
- **Frontend Payments:** `frontend/src/hooks/use-razorpay.ts` and `PaymentModal`.
- **Backend Core:** `backend/src/repositories/band.py` (`ArtistRepository`, `BandRepository`, `VenueRepository`, `BookingRepository`), `backend/src/services/payment_service.py` (Razorpay order & signature verification).
- **Database Collections:** `artists`, `bands`, `band_venues`, `payments`, `transactions`.

### B. Existing Code to Extend `[EXTENDED / MODIFIED]`
- **Backend Service:** `backend/src/services/band_service.py` (Fix `insert()` dictionary ID extraction, add search query filters, add dynamic packages).
- **Backend Schemas:** `backend/src/schemas/band.py` (Add milestone payment fields, dynamic package lineups, event linkages).
- **Database Collection:** `band_bookings` (Extend with `event_id`, `milestone_status`, `advance_amount`, `final_amount`).
- **Frontend State:** `frontend/src/store/band/marketplace-slice.ts` (Implement async thunks for live DB querying).
- **Frontend Pages:** `frontend/src/band/pages/booking-details-page.tsx` & `bookings-page.tsx` (Connect to 25/75 milestone actions).

### C. New Components to Add `[NEW]`
- **Customer Events Container:** `eventhub_events` collection, `EventHubEvent` schemas, and `CreateEvent` / `EventDetails` customer views.
- **Provider Action Inbox:** Provider request review interface with One-Click **Accept / Reject** and **Mark Event Completed** triggers.

---

## 4. Strict Isolation Rule

- **Sports Module is completely out of scope.**
- All EventHub code must live within existing band namespaces or new eventhub extensions. No sports models or services may be imported or altered.
