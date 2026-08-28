# 🎭 Provider Profiles & RBAC Specification

## 1. Provider Archetypes & Roles

EventHub supports three distinct provider archetypes alongside customers:

| Role | Entity Type | Primary Responsibility | Key Attributes |
|---|---|---|---|
| `CUSTOMER` `[EXISTING]` | User / Host | Creates umbrella events, requests bookings, pays milestones | Events list, Multi-provider bookings, Reviews |
| `VENUE_OWNER` `[EXTENDED]` | Venue Provider | Manages physical spaces, stages, and acoustic capacities | Floorplans, Stage dimensions, Sound rider, Capacity |
| `ARTIST` `[EXTENDED]` | Solo / DJ Provider | Solo vocalists, instrumentalists, DJ performers | Sound samples, Solo packages, Gig calendar |
| `BAND_LEADER` `[EXTENDED]` | Band Provider | Live music bands and large ensembles | Dynamic lineup builder (drummers, brass, vocals), Custom packages |

---

## 2. Provider Profile Specifications

### A. Artist Profile (`band_artists`) `[EXISTING EXTENDED]`
- **Identity:** `artist_name`, `bio`, `profile_image`, `gallery_images`.
- **Genre Tags:** Rock, Bollywood, Classical, Sufi, Jazz, Electronic, Hip Hop, Fusion, Acoustic.
- **Pricing & Packages:** `price_from`, `packages` (e.g. 60-min Acoustic Solo, 120-min DJ Set).
- **Social Proof:** `rating` (0.0 - 5.0), `review_count`, `verified` badge, `completed_gigs`.
- **Logistics:** `location`, `city`, `sound_rider` (mics, monitors, inputs required).

### B. Band Profile (`band_bands`) `[EXISTING EXTENDED]`
- **Identity:** `band_name`, `description`, `bio`, `profile_image`, `genres`.
- **Lineup Composition:** `team_members` list and `instrument_lineup` mapping (supports dynamic instrument names and counts).
- **Setlist & Samples:** Repertoire list, audio/video preview links.
- **Packages:** Custom tiers (Acoustic Set, Standard Live Gig, Grand Festival Lineup).
- **Availability:** Calendar status (`Available`, `Limited`, `Booked`), `next_available` date.

### C. Venue Profile (`band_venues`) `[EXISTING EXTENDED]`
- **Identity:** `venue_name`, `city`, `address`, `location`.
- **Capacity & Type:** `venue_type` (Arena, Club, Auditorium, Open Air, Studio), `setting` (Indoor, Outdoor), `capacity` (e.g. 500 guests).
- **Technical Specs:** Sound system, lighting truss, green rooms, parking, generator backup.
- **Pricing:** `price_per_hour` or full-day booking rate.

---

## 3. Provider Lifecycle & Action Engine

```
[Provider Registers / Logs in]
              │
              ▼
    [Complete Profile Setup]
 (Bio, Photos, Lineups, Packages)
              │
              ▼
    [Published on Marketplace]
              │
              ▼
  [Incoming Booking Requests] ──▶ Reviews Event Date, Time, Guest Count, Amount
              │
      ┌───────┴───────┐
      ▼               ▼
  [REJECT]        [ACCEPT]
      │               │
      ▼               ▼
Booking Closed   Advance Payment Pending (25%)
                      │
                      ▼
               [Customer Pays 25%]
                      │
                      ▼
               Booking Confirmed
                      │
                      ▼
               [EVENT DAY OCCURS]
                      │
                      ▼
      [Provider Marks "Event Completed"]
                      │
                      ▼
         Final Payment Pending (75%)
         (Available for Customer to pay)
                      │
                      ▼
               [Customer Pays 75%]
                      │
                      ▼
               Fully Paid & Completed
```
