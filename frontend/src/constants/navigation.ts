import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Mic2,
  Music,
  Search,
  Settings,
  Star,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import { ROUTES } from "./routes";
import type { NavSection } from "@/types";

export const PUBLIC_NAV = [
  { label: "Features", href: "/#features" },
  { label: "Products", href: "/#products" },
  { label: "About", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
] as const;

export const SPORTS_NAV: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: ROUTES.SPORTS_DASHBOARD,
        icon: LayoutDashboard,
      },
      {
        label: "Statistics",
        href: ROUTES.SPORTS_STATISTICS,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Groups", href: ROUTES.SPORTS_GROUPS, icon: Users },
      { label: "Events", href: ROUTES.SPORTS_EVENTS, icon: CalendarDays },
      {
        label: "Attendance",
        href: ROUTES.SPORTS_ATTENDANCE,
        icon: ClipboardCheck,
      },
      { label: "Polls", href: ROUTES.SPORTS_POLLS, icon: Vote },
      { label: "Payments", href: ROUTES.SPORTS_PAYMENTS, icon: CreditCard },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        label: "Messages",
        href: ROUTES.SPORTS_MESSAGES,
        icon: MessageSquare,
        badge: 3,
      },
      { label: "Files", href: ROUTES.SPORTS_FILES, icon: FolderOpen },
      {
        label: "Notifications",
        href: ROUTES.SPORTS_NOTIFICATIONS,
        icon: Bell,
      },
    ],
  },
  {
    title: "Venues & Booking",
    items: [
      { label: "Venues", href: ROUTES.SPORTS_VENUES, icon: Building2 },
      { label: "Bookings", href: ROUTES.SPORTS_BOOKINGS, icon: CalendarCheck },
    ],
  },
  {
    items: [
      { label: "Settings", href: ROUTES.SPORTS_SETTINGS, icon: Settings },
    ],
  },
];

export const OWNER_NAV: NavSection[] = [
  {
    title: "Venue Management",
    items: [
      { label: "Overview", href: ROUTES.SPORTS_OWNER_DASHBOARD, icon: LayoutDashboard },
      { label: "My Venues", href: ROUTES.SPORTS_OWNER_VENUES, icon: Building2 },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", href: ROUTES.SPORTS_OWNER_BOOKINGS, icon: CalendarCheck },
      { label: "Payments", href: ROUTES.SPORTS_OWNER_PAYMENTS, icon: CreditCard },
    ],
  },
  {
    items: [
      { label: "Settings", href: ROUTES.SPORTS_SETTINGS, icon: Settings },
    ],
  },
];

export const BAND_NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: ROUTES.BAND_DASHBOARD, icon: Trophy },
      { label: "Search", href: ROUTES.BAND_SEARCH, icon: Search },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "Artists", href: ROUTES.BAND_ARTISTS, icon: Mic2 },
      { label: "Bands", href: ROUTES.BAND_BANDS, icon: Music },
      { label: "Venues", href: ROUTES.BAND_VENUES, icon: Building2 },
    ],
  },
  {
    title: "Manage",
    items: [
      {
        label: "Bookings",
        href: ROUTES.BAND_BOOKINGS,
        icon: CalendarDays,
        badge: 3,
      },
      { label: "Reviews", href: ROUTES.BAND_REVIEWS, icon: Star },
    ],
  },
  {
    items: [
      { label: "Settings", href: ROUTES.BAND_SETTINGS, icon: Settings },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    title: "Platform",
    items: [
      { label: "Dashboard", href: ROUTES.ADMIN, icon: LayoutDashboard },
      {
        label: "Settings",
        href: `${ROUTES.ADMIN}/settings`,
        icon: Settings,
        disabled: true,
      },
    ],
  },
];
