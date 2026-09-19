# 🗄️ Database Models & Schema Specifications

## 1. MongoDB Collections Assessment (Reuse vs Extension)

Before creating arbitrary collections, existing collections defined in `backend/src/constants/collections.py` were inspected to maximize code reuse and backward compatibility:

| Collection Constant | Collection Name | Action | Description |
|---|---|---|---|
| `BAND_ARTISTS` | `artists` | `[EXISTING EXTENDED]` | Solo artists, vocalists, DJs, and instrumentalists. |
| `BAND_BANDS` | `bands` | `[EXISTING EXTENDED]` | Live music bands, team members, dynamic lineups, packages. |
| `BAND_VENUES` | `band_venues` | `[EXISTING EXTENDED]` | Venue listings, floorplans, sound specs, and hourly pricing. |
| `BAND_BOOKINGS` | `band_bookings` | `[EXISTING EXTENDED]` | Provider booking documents with 25/75 milestone tracking. |
| `PAYMENTS` | `payments` | `[EXISTING REUSED]` | Razorpay payment orders and transaction logs. |
| `EVENTHUB_EVENTS` | `eventhub_events` | `[NEW]` | Customer umbrella events (parent container for multi-provider bookings). |
| `EVENTHUB_REVIEWS` | `eventhub_reviews` | `[NEW]` | Verified ratings and testimonials left after event completion. |

---

## 2. Cardinality & Relationship Model

```
User Document (users)
  │ (1)
  ▼
Event Document (eventhub_events)
  │ (1)
  ▼ (N)
Booking Document (band_bookings)
  │ (N)
  ▼ (1)
Provider Document (artists | bands | band_venues)
```

- **User $1 \longrightarrow N$ Events:** Each customer can create multiple event documents over time.
- **Event $1 \longrightarrow N$ Bookings:** Each event contains zero, one, or multiple independent provider booking records.
- **Booking $1 \longrightarrow 1$ Provider:** Each booking record references exactly one provider (`provider_id` + `provider_type`).

---

## 3. Document Schema Definitions

### A. Customer Event (`eventhub_events`) `[NEW]`
```json
{
  "_id": "ObjectId(...)",
  "id": "evt_abc123",
  "customer_id": "usr_customer_01",
  "title": "Hyderabad Sunsets Live Fest",
  "event_type": "Festival",
  "date": "2026-10-25",
  "start_time": "16:00",
  "end_time": "23:00",
  "location": "Gachibowli, Hyderabad",
  "guest_count": 1200,
  "budget": 500000,
  "created_at": "2026-08-27T10:00:00Z",
  "updated_at": "2026-08-27T10:00:00Z"
}
```

### B. Extended Band Profile (`bands`) `[EXTENDED]`
```json
{
  "_id": "ObjectId(...)",
  "id": "band_001",
  "band_name": "The Deccan Rhythms",
  "bio": "Premier 6-piece fusion and live rock ensemble.",
  "genres": ["Fusion", "Rock", "Bollywood"],
  "location": "Hyderabad",
  "members": 6,
  "team_members": [
    { "id": "m1", "name": "Rahul", "role": "Lead Vocalist" },
    { "id": "m2", "name": "Vikram", "role": "Drummer" },
    { "id": "m3", "name": "Karan", "role": "Trumpeter" }
  ],
  "instrument_lineup": {
    "singers": 1,
    "drummers": 2,
    "trumpets": 2,
    "keyboards": 1,
    "bass_guitar": 1,
    "lead_guitar": 1
  },
  "packages": [
    {
      "id": "pkg_live_set",
      "title": "Full Live Concert",
      "duration_minutes": 150,
      "price": 120000,
      "description": "Full 6-piece live performance with in-ear monitor rig."
    }
  ],
  "rating": 4.9,
  "review_count": 48,
  "price_from": 120000,
  "availability": "Available",
  "verified": true,
  "completed_gigs": 65,
  "created_by": "usr_band_leader"
}
```

### C. Extended Booking Document (`band_bookings`) `[EXTENDED]`
```json
{
  "_id": "ObjectId(...)",
  "id": "bkg_777",
  "event_id": "evt_abc123",
  "customer_id": "usr_customer_01",
  "provider_id": "band_001",
  "provider_type": "Band",
  "provider_name": "The Deccan Rhythms",
  "package_id": "pkg_live_set",
  "event_date": "2026-10-25",
  "start_time": "19:00",
  "end_time": "21:30",
  "total_amount": 120000,
  "advance_amount": 30000,
  "final_amount": 90000,
  "booking_status": "CONFIRMED",
  "payment_status": "ADVANCE_PAID",
  "advance_order_id": "order_adv_123",
  "advance_payment_id": "pay_rzp_adv_123",
  "final_order_id": null,
  "final_payment_id": null,
  "timeline": [
    { "status": "REQUESTED", "timestamp": "2026-08-27T10:30:00Z", "note": "Booking submitted by customer" },
    { "status": "ACCEPTED", "timestamp": "2026-08-27T11:00:00Z", "note": "Accepted by Band Leader" },
    { "status": "CONFIRMED", "timestamp": "2026-08-27T11:15:00Z", "note": "25% Advance payment verified" }
  ],
  "created_by": "usr_customer_01",
  "created_at": "2026-08-27T10:30:00Z",
  "updated_at": "2026-08-27T11:15:00Z"
}
```

---

## 4. Safe Coding & Backward Compatibility Guardrails

1. **`BaseRepository.insert()` Return Type:** Always extract `created["id"]` from the dictionary returned by `insert()`. Never pass the returned dictionary directly into `ObjectId()`.
2. **Safe Field Normalization:** Schemas must support both `name` and `band_name` / `artist_name` / `venue_name` via Pydantic field aliasing.
3. **Strict Sports Isolation:** EventHub queries and migrations must never read from or write to any `sports_*` collections.
