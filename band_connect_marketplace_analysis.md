# 🎸 Band Connect Marketplace — Complete Architectural Analysis & Workflow Document

**Author:** Senior Full-Stack Lead Engineer  
**Scope:** Frontend (Next.js 15, Redux Toolkit, Tailwind/Vanilla CSS) + Backend (FastAPI, Motor/MongoDB, Razorpay)  
**Target Domain:** Band Connect Entertainment Marketplace (`/band/*`)

---

## 📌 1. Executive Summary & Purpose

**Band Connect** is a high-performance, multi-sided entertainment marketplace designed to connect:
1. **Artists & Vocalists / Solo Acts / DJs**
2. **Live Music Bands & Ensembles**
3. **Venues (Clubs, Arenas, Auditoriums, Studios, Open Air stages)**
4. **Organizers / Clients (Booking performances, managing gigs, paying deposits)**

Currently, the frontend UI is **rich, responsive, and fully structured**, but operates on static mock datasets (`band.mock.ts`) and local Redux memory. On the backend, foundational FastAPI endpoints and MongoDB repositories exist but suffer from dictionary `insert()` ID extraction bugs, lack seed data, and are disconnected from the frontend async state.

---

## 🧭 2. Current User Journey & Workflow (How It Works Now)

```
[Marketplace Hub /band] ──▶ [Discover & Search /band/marketplace]
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
[Browse Artists /band/artists]  [Browse Bands /band/bands]  [Browse Venues /band/venues]
         │                        │                        │
         ▼                        ▼                        ▼
[Artist Profile Details]       [Band Profile Details]   [Venue Profile Details]
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                    [Initiate Booking Modal / Form]
                                  │
                                  ▼
                    [Manage Bookings /band/bookings]
                                  │
                                  ▼
                 [Booking Details & Timeline /band/bookings/:id]
                                  │
                                  ▼
                     [Advance Deposit & Razorpay]
```

### Existing Pages in Frontend (`frontend/src/band/pages/`):
| # | Page Component | Route | Current Status |
|---|---|---|---|
| 1 | `MarketplaceDashboardPage` | `/band` | UI complete; renders static top rated, recent bookings & stats. |
| 2 | `MarketplaceSearchPage` | `/band/marketplace` | UI complete; client-side filters by genre, city, price, rating. |
| 3 | `ArtistsPage` | `/band/artists` | UI complete; lists solo artists, filter by genres (Rock, Sufi, Classical). |
| 4 | `ArtistDetailsPage` | `/band/artists/[id]` | UI complete; bio, pricing packages, reviews, past gigs, booking action. |
| 5 | `BandsPage` | `/band/bands` | UI complete; live acts, band member counts, sound samples. |
| 6 | `BandDetailsPage` | `/band/bands/[id]` | UI complete; lineup, setlist, pricing, availability calendar. |
| 7 | `VenuesPage` | `/band/venues` | UI complete; capacity, venue type (Arena, Club, Studio, Open Air). |
| 8 | `VenueDetailsPage` | `/band/venues/[id]` | UI complete; venue amenities, technical rider, sound systems. |
| 9 | `BookingsPage` | `/band/bookings` | UI complete; requested, confirmed, and completed gig management. |
| 10 | `BookingDetailsPage` | `/band/bookings/[id]` | UI complete; event timeline, cancellation rules, payment summary. |
| 11 | `ReviewsPage` | `/band/reviews` | UI complete; star ratings, feedback, verified badge testimonials. |
| 12 | `BandSettingsPage` | `/band/settings` | UI complete; profile edit, pricing rates, payout account details. |

---

## 🔍 3. Current Codebase State & Technical Gaps

### 🔴 Gap 1: Frontend operates purely on Static Mock Data
- **Location:** `frontend/src/store/band/marketplace-slice.ts` & `frontend/src/band/pages/*.tsx`
- **Issue:** Pages directly import `MOCK_ARTISTS`, `MOCK_BANDS`, `MOCK_VENUES`, `MOCK_BOOKINGS` from `band.mock.ts`.
- **Impact:** Any new artist created or booking submitted disappears upon browser refresh (`F5`).

### 🔴 Gap 2: Backend `BandService` Insert Bug (`500 Server Error`)
- **Location:** `backend/src/services/band_service.py`
- **Issue:**
  ```python
  artist_id = await self.artists.insert(doc) # returns serialized dict {"id": "...", ...}
  return await self.artists.find_by_id(artist_id) # passes dict to ObjectId() ❌
  ```
- **Impact:** Calling `POST /api/v1/band/artists`, `/bands`, `/venues`, or `/bookings` crashes with `500 Internal Server Error`.
- **Fix:** Update all `insert()` calls to extract `created["id"]`.

### 🔴 Gap 3: Auth Dependency Alignment
- **Location:** `backend/src/modules/band/routes.py`
- **Issue:** `routes.py` imports `from src.dependencies.auth import get_current_user` which returns `401 Unauthorized` if JWT token is missing during dev mode.
- **Fix:** Use unified `get_current_user` dependency matching Sports/Payments modules.

### 🔴 Gap 4: Missing Database Seed Data
- **Location:** MongoDB Database (`artists`, `bands`, `band_venues`, `band_bookings`)
- **Issue:** Database collections are currently empty. If we switch from mocks to DB without seed data, marketplace search will show "No artists found".
- **Fix:** Add an automated database seeder / initial population script for Artists, Bands, and Venues.

---

## 🛠️ 4. Full End-to-End Implementation Roadmap

```
Phase 1: Backend Service Hardening & Schemas
  ├── Fix insert() ID extraction in `backend/src/services/band_service.py`
  ├── Align Pydantic schemas in `backend/src/schemas/band.py`
  └── Update `routes.py` with get_current_user fallback and query filters.

Phase 2: Database Marketplace Seeder
  ├── Populate rich initial artists, bands, venues, and booking records in MongoDB.
  └── Ensure verified ratings, pricing tiers, and genre tags are indexed.

Phase 3: Frontend Redux State & Async Thunks
  ├── Update `frontend/src/store/band/marketplace-slice.ts` with:
  │   ├── `fetchArtistsThunk`, `fetchBandsThunk`, `fetchVenuesThunk`
  │   ├── `fetchBookingsThunk`, `createBookingThunk`, `updateBookingStatusThunk`
  └── Update `frontend/src/services/band/` (artists, bands, venues, bookings).

Phase 4: Frontend UI Connection
  ├── Connect `MarketplaceDashboardPage` & `MarketplaceSearchPage` to live DB.
  ├── Connect `ArtistsPage`, `BandsPage`, `VenuesPage` to Redux state.
  └── Connect `BookingsPage` & `BookingDetailsPage` to live DB and Razorpay.
```

---

## 💳 5. Payment & Booking Integration Flow

1. Client selects an Artist/Band/Venue and picks Date & Time Package.
2. Form dispatches `createBookingThunk(payload)`.
3. Backend creates document in `band_bookings` with status `"Requested"`.
4. Client clicks **"Pay Advance Deposit"** -> Triggers Razorpay Checkout modal (using our Razorpay hook).
5. Upon successful signature verification, booking status transitions to `"Confirmed"`.
