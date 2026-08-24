import type { SportsVenue, VenueSlot } from "@/types";

export const VENUE_SLOTS: VenueSlot[] = [
  { id: "slot-1", startTime: "06:00", endTime: "07:00", price: 800 },
  { id: "slot-2", startTime: "07:00", endTime: "08:00", price: 900 },
  { id: "slot-3", startTime: "08:00", endTime: "09:00", price: 900 },
  { id: "slot-4", startTime: "16:00", endTime: "17:00", price: 1200 },
  { id: "slot-5", startTime: "17:00", endTime: "18:00", price: 1400 },
  { id: "slot-6", startTime: "18:00", endTime: "19:00", price: 1400 },
  { id: "slot-7", startTime: "19:00", endTime: "20:00", price: 1100 },
];

export const MOCK_VENUES: SportsVenue[] = [
  {
    id: "ven-01",
    createdAt: "2026-05-02T09:00:00.000Z",
    updatedAt: "2026-08-18T09:00:00.000Z",
    name: "Cooperage Turf Arena",
    description:
      "Floodlit 5-a-side and 7-a-side turf pitches in south Mumbai with referee service on request.",
    city: "Mumbai, MH",
    address: "Cooperage Ground, Colaba, Mumbai",
    surface: "Turf",
    sports: ["Football"],
    capacity: 22,
    rating: 4.7,
    reviewCount: 128,
    amenities: ["Floodlights", "Changing rooms", "Parking", "Water refill"],
  },
  {
    id: "ven-02",
    createdAt: "2026-04-11T09:00:00.000Z",
    updatedAt: "2026-08-16T09:00:00.000Z",
    name: "Gymkhana Cricket Nets",
    description:
      "Six clay net lanes with bowling machine hire, open mornings and evenings.",
    city: "Hyderabad, TS",
    address: "Gymkhana Grounds, Secunderabad",
    surface: "Clay",
    sports: ["Cricket"],
    capacity: 12,
    rating: 4.5,
    reviewCount: 86,
    amenities: ["Floodlights", "Bowling machine", "Parking"],
  },
  {
    id: "ven-03",
    createdAt: "2026-06-20T09:00:00.000Z",
    updatedAt: "2026-08-14T09:00:00.000Z",
    name: "Pune Indoor Court",
    description:
      "Air-conditioned indoor basketball court with electronic scoreboard and locker access.",
    city: "Pune, MH",
    address: "Kalyani Nagar, Pune",
    surface: "Indoor",
    sports: ["Basketball"],
    capacity: 10,
    rating: 4.6,
    reviewCount: 64,
    amenities: ["Indoor AC", "Scoreboard", "Lockers"],
  },
  {
    id: "ven-04",
    createdAt: "2026-03-15T09:00:00.000Z",
    updatedAt: "2026-08-10T09:00:00.000Z",
    name: "Kanteerava Synthetic Track",
    description:
      "Eight-lane synthetic athletics track with floodlit evening windows for interval sessions.",
    city: "Bengaluru, KA",
    address: "Sree Kanteerava Stadium, Bengaluru",
    surface: "Synthetic",
    sports: ["Athletics"],
    capacity: 30,
    rating: 4.4,
    reviewCount: 52,
    amenities: ["Floodlights", "Parking", "Coached sessions"],
  },
];

export function upcomingDates(count = 14): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let index = 0; index < count; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 9973;
  }
  return hash;
}

export function isSlotTaken(
  venueId: string,
  date: string,
  slotId: string
): boolean {
  return hashString(`${venueId}|${date}|${slotId}`) % 3 === 1;
}

export function slotLabel(slot: VenueSlot): string {
  return `${slot.startTime} – ${slot.endTime}`;
}
