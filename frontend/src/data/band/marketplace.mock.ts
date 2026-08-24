import type {
  BandMemberProfile,
  MarketplaceActivityItem,
  PackageTemplate,
  PerformanceVideo,
  VenueAvailabilityDay,
} from "@/types";

function buildSeptember(bookedDays: number[]): VenueAvailabilityDay[] {
  return Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    return {
      date: `2026-09-${String(day).padStart(2, "0")}`,
      status: bookedDays.includes(day) ? ("Booked" as const) : ("Available" as const),
    };
  });
}

export const VENUE_AVAILABILITY: Record<string, VenueAvailabilityDay[]> = {
  "ven-01": buildSeptember([4, 5, 11, 12, 18, 19, 25, 26]),
  "ven-02": buildSeptember([2, 15, 26]),
  "ven-03": buildSeptember([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 30]),
  "ven-04": buildSeptember([5, 6, 12, 13, 19, 20, 26, 27]),
  "ven-05": buildSeptember([7, 21]),
  "ven-06": buildSeptember([6, 7, 13]),
};

export const DEFAULT_AVAILABILITY = buildSeptember([5, 6, 12, 13, 19, 20]);

export const ARTIST_PACKAGES: PackageTemplate[] = [
  {
    id: "art-pkg-1",
    name: "Standard Set",
    multiplier: 1,
    durationHours: 2,
    description: "One tight live set with breaks, perfect for intimate evenings.",
    inclusions: ["2-hour performance", "Basic sound setup", "Set-list requests"],
  },
  {
    id: "art-pkg-2",
    name: "Full Evening",
    multiplier: 1.5,
    durationHours: 3,
    description: "Three sets across the evening with full stage production.",
    inclusions: ["3-hour performance", "Full sound & lights", "Custom set list", "Meet & greet"],
    popular: true,
  },
  {
    id: "art-pkg-3",
    name: "Premium Night",
    multiplier: 2.2,
    durationHours: 4,
    description: "Extended headline show with backing musicians and production.",
    inclusions: ["4-hour headline set", "Backing musicians", "Production crew", "Travel included"],
  },
];

export const BAND_PACKAGES: PackageTemplate[] = [
  {
    id: "band-pkg-1",
    name: "Single Set",
    multiplier: 1,
    durationHours: 1.5,
    description: "A single high-energy set for club nights and openings.",
    inclusions: ["90-minute set", "Standard backline", "Sound engineer"],
  },
  {
    id: "band-pkg-2",
    name: "Full Show",
    multiplier: 1.4,
    durationHours: 3,
    description: "Two sets with full gear, ideal for weddings and galas.",
    inclusions: ["2 × 75-minute sets", "Full backline", "Sound & lights", "Emcee support"],
    popular: true,
  },
  {
    id: "band-pkg-3",
    name: "Festival Headline",
    multiplier: 2,
    durationHours: 4,
    description: "Festival-grade production with extended lineup and crew.",
    inclusions: ["Headline slot", "Extended lineup", "Production manager", "Travel & stay"],
  },
];

export const VENUE_PACKAGES: PackageTemplate[] = [
  {
    id: "ven-pkg-1",
    name: "Half Day",
    multiplier: 4,
    durationHours: 4,
    description: "Four hours of venue access including setup time.",
    inclusions: ["4-hour access", "Basic AV", "On-site support"],
  },
  {
    id: "ven-pkg-2",
    name: "Full Evening",
    multiplier: 7,
    durationHours: 8,
    description: "Evening slot with soundcheck, show and teardown window.",
    inclusions: ["8-hour access", "Soundcheck slot", "Green room", "Parking"],
    popular: true,
  },
  {
    id: "ven-pkg-3",
    name: "Full Day",
    multiplier: 12,
    durationHours: 12,
    description: "Complete day hire for festivals, shoots and all-day events.",
    inclusions: ["12-hour access", "Full facilities", "Dedicated manager", "Late license"],
  },
];

export const ARTIST_VIDEOS: PerformanceVideo[] = [
  { id: "vid-a1", title: "Live at Blue Frog — full set", venue: "Blue Frog Arena", duration: "42:10", views: "18k" },
  { id: "vid-a2", title: "Acoustic session — rooftop", venue: "Sunset Rooftop", duration: "12:35", views: "9.4k" },
  { id: "vid-a3", title: "Festival headline highlights", venue: "Gateway Lawns", duration: "05:48", views: "31k" },
];

export const BAND_VIDEOS: PerformanceVideo[] = [
  { id: "vid-b1", title: "Encore — sold-out night", venue: "The Sports Bar Lounge", duration: "08:22", views: "24k" },
  { id: "vid-b2", title: "Full live show — tour opener", venue: "Blue Frog Arena", duration: "58:04", views: "47k" },
  { id: "vid-b3", title: "Behind the tour — part 2", venue: "Studio diary", duration: "14:19", views: "11k" },
];

export const BAND_MEMBERS: Record<string, BandMemberProfile[]> = {
  "band-01": [
    { id: "bm-1", name: "Kabir Shah", role: "Lead vocals & guitar", since: "2019" },
    { id: "bm-2", name: "Tara Menon", role: "Lead guitar", since: "2020" },
    { id: "bm-3", name: "Aditya Rao", role: "Bass", since: "2019" },
    { id: "bm-4", name: "Zoya Khan", role: "Drums", since: "2021" },
  ],
  "band-02": [
    { id: "bm-5", name: "Vikram Bhattacharya", role: "Sitar & vocals", since: "2018" },
    { id: "bm-6", name: "Meghna Das", role: "Violin", since: "2019" },
    { id: "bm-7", name: "Imran Sheikh", role: "Tabla", since: "2018" },
    { id: "bm-8", name: "Rhea Pillai", role: "Keyboard", since: "2022" },
    { id: "bm-9", name: "Dhruv Nair", role: "Bass", since: "2020" },
    { id: "bm-10", name: "Sameer Kulkarni", role: "Drums", since: "2021" },
  ],
  "band-03": [
    { id: "bm-11", name: "Ricky Sharma", role: "DJ & producer", since: "2017" },
    { id: "bm-12", name: "Naina Gupta", role: "Vocals", since: "2019" },
    { id: "bm-13", name: "Aman Vohra", role: "Percussion", since: "2020" },
    { id: "bm-14", name: "Sara D'Souza", role: "Hype & vocals", since: "2022" },
    { id: "bm-15", name: "Vivek Menon", role: "Lights & VJ", since: "2018" },
  ],
  "band-04": [
    { id: "bm-16", name: "Cyrus Irani", role: "Saxophone", since: "2019" },
    { id: "bm-17", name: "Lily Fernandes", role: "Double bass", since: "2020" },
    { id: "bm-18", name: "Aakash Bhatt", role: "Piano", since: "2019" },
    { id: "bm-19", name: "Nikhil Suresh", role: "Drums", since: "2021" },
  ],
  "band-05": [
    { id: "bm-20", name: "Ustad Fareed Ahmed", role: "Lead vocals & harmonium", since: "2016" },
    { id: "bm-21", name: "Sufiya Noor", role: "Backing vocals", since: "2018" },
    { id: "bm-22", name: "Rustam Ali", role: "Dholak", since: "2016" },
    { id: "bm-23", name: "Pooja Bhatt", role: "Violin", since: "2019" },
    { id: "bm-24", name: "Ganesh Iyer", role: "Keyboard", since: "2017" },
    { id: "bm-25", name: "Arif Khan", role: "Tabla", since: "2017" },
    { id: "bm-26", name: "Deep Joshi", role: "Bass", since: "2020" },
  ],
  "band-06": [
    { id: "bm-27", name: "Omkar Jadhav", role: "Vocals & guitar", since: "2021" },
    { id: "bm-28", name: "Ali Hasan", role: "Beats & production", since: "2021" },
    { id: "bm-29", name: "Tanvi Shetty", role: "Vocals", since: "2022" },
  ],
};

export const GALLERY_LABELS = [
  "Live at Blue Frog",
  "Tour diary — Pune",
  "Studio session",
  "Crowd favourite",
  "Soundcheck",
  "Encore night",
  "Festival stage",
  "Backstage",
];

export const MARKETPLACE_CATEGORIES = [
  { id: "cat-1", label: "Rock bands", query: "Rock", href: "/band/bands", count: 14 },
  { id: "cat-2", label: "Bollywood nights", query: "Bollywood", href: "/band/artists", count: 22 },
  { id: "cat-3", label: "Sufi & classical", query: "Sufi", href: "/band/artists", count: 9 },
  { id: "cat-4", label: "Wedding performers", query: "Wedding", href: "/band/bookings", count: 31 },
  { id: "cat-5", label: "Club DJs", query: "DJ", href: "/band/artists", count: 17 },
  { id: "cat-6", label: "Open-air venues", query: "Open Air", href: "/band/venues", count: 12 },
] as const;

export const DEFAULT_RECENT_SEARCHES = [
  "Sufi wedding bands",
  "DJ Kabir",
  "Rooftop venues",
];

export const MARKETPLACE_ACTIVITY: MarketplaceActivityItem[] = [
  {
    id: "act-1",
    title: "New booking request",
    description: "Sharma Sangeet Night requested Midnight Masala for Sep 6.",
    actor: "Priya Malhotra",
    timestamp: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "act-2",
    title: "Review published",
    description: "Rahul Iyer rated The Echoes 5 stars after a corporate set.",
    actor: "Rahul Iyer",
    timestamp: "2026-08-19T15:30:00.000Z",
  },
  {
    id: "act-3",
    title: "New connection",
    description: "Blue Frog Arena connected with your act for festival season.",
    actor: "Blue Frog Arena",
    timestamp: "2026-08-18T12:45:00.000Z",
  },
  {
    id: "act-4",
    title: "Booking confirmed",
    description: "Fintech Fest After-Party with The Echoes was confirmed.",
    actor: "You",
    timestamp: "2026-08-17T09:20:00.000Z",
  },
  {
    id: "act-5",
    title: "Payout settled",
    description: "₹36,000 settled for Independence Bash with DJ Kabir.",
    actor: "BandConnect",
    timestamp: "2026-08-16T18:00:00.000Z",
  },
];

export const NEW_CONNECTIONS_COUNT = 18;
