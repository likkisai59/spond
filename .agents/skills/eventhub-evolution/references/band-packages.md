# 🥁 Band Packages & Dynamic Lineup Specification

## 1. Dynamic Instrument & Team Lineup Architecture

Live music bands feature diverse instrument configurations across genres (e.g. Rock, Fusion, Classical, Sufi, Jazz, Brass). To support this variability, EventHub uses **dynamic lineup structures** rather than rigid, hardcoded instrument fields.

### A. Dynamic Lineup Schema (Arbitrary Instruments & Quantities):
Lineups are stored as dynamic key-value mappings or structured lists of `{ instrument: string, count: number }`, allowing bands to define any instrument combination:

```json
{
  "lineup": [
    { "instrument": "Singer / Lead Vocalist", "count": 1 },
    { "instrument": "Drummers / Percussion", "count": 2 },
    { "instrument": "Trumpets / Brass", "count": 2 },
    { "instrument": "Keyboard / Synth", "count": 1 },
    { "instrument": "Bass Guitar", "count": 1 },
    { "instrument": "Sitar / Classical Fusion", "count": 1 }
  ]
}
```

Or dictionary format:
```json
{
  "instrument_lineup": {
    "singers": 1,
    "drummers": 2,
    "trumpets": 2,
    "keyboards": 1,
    "bass_guitar": 1,
    "lead_guitar": 1
  }
}
```

### B. Named Team Members Schema:
Individual band musicians can optionally be listed with their names, roles, and profiles:
```json
{
  "team_members": [
    { "id": "mem_01", "name": "Arjun Mehta", "role": "Lead Vocalist & Rhythm Guitar", "joined_year": 2021 },
    { "id": "mem_02", "name": "Vikram Sen", "role": "Master Drummer & Percussion", "joined_year": 2020 },
    { "id": "mem_03", "name": "Karan Johar", "role": "Lead Trumpeter / Brass Section", "joined_year": 2022 }
  ]
}
```

---

## 2. Dynamic Performance Package Models

Bands configure multiple packages representing distinct performance formats. Each package includes duration, lineup size, gear inclusions, and transparent pricing.

### Example Package Configurations:

#### 1. Acoustic / Unplugged Trio
- **Package Title:** Acoustic Sunset Session
- **Duration:** 90 Minutes
- **Lineup Breakdown:**
  - `Singer`: 1
  - `Acoustic Guitar`: 1
  - `Cajon / Percussion`: 1
- **Sound Inclusions:** 2 Vocal mics, 2 DI boxes.
- **Price:** ₹40,000

#### 2. Full Live Concert Experience (Standard Example)
- **Package Title:** Full Festival & Wedding Set
- **Duration:** 150 Minutes (2.5 Hours)
- **Lineup Breakdown:**
  - `Singers`: 1
  - `Drummers`: 2
  - `Trumpets`: 2
  - `Keyboard`: 1
  - `Bass Guitar`: 1
  - `Lead Guitar`: 1
- **Sound Inclusions:** Full in-ear monitoring rig, 8-channel sub-mixer, wireless instrument transmitters.
- **Price:** ₹1,20,000
- **Milestone Breakdown:**
  - **25% Advance Deposit:** ₹30,000 (Paid to confirm booking)
  - **75% Final Balance:** ₹90,000 (Paid post-event)

#### 3. Custom Lineup Package (Client-Configurable)
- Bands can accept custom lineup requests where the client specifies required instrument counts, and the band quotes a customized total amount.
