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
  Settings,
  Users,
  Vote,
  Home,
  User,
  Heart,
  Inbox,
  IndianRupee,
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

export const BAND_CLIENT_NAV: NavSection[] = [
  {
    items: [
      { label: "Home", href: "/band/client/dashboard", icon: Home },
      { label: "Profile", href: "/band/client/profile", icon: User },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "Artists", href: "/band/marketplace/artists", icon: Mic2 },
      { label: "Venues", href: "/band/marketplace/venues", icon: Building2 },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Bookings", href: "/band/client/bookings", icon: CalendarCheck },
      { label: "Reviews", href: "/band/client/reviews", icon: MessageSquare },
      { label: "Favorites", href: "/band/client/favorites", icon: Heart },
      { label: "Messages", href: "/band/client/messages", icon: Inbox },
      { label: "Payments", href: "/band/client/payments", icon: IndianRupee },
    ],
  },
  {
    items: [
      { label: "Settings", href: "/band/client/settings", icon: Settings },
    ],
  },
];

export const BAND_ARTIST_NAV: NavSection[] = [
  {
    items: [
      { label: "Home", href: "/band/artist/dashboard", icon: Home },
      { label: "Profile", href: "/band/artist/profile", icon: User },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Bookings", href: "/band/artist/bookings", icon: CalendarDays },
      { label: "Reviews", href: "/band/artist/reviews", icon: MessageSquare },
      { label: "Messages", href: "/band/artist/messages", icon: Inbox },
      { label: "Payments", href: "/band/artist/earnings", icon: IndianRupee },
      { label: "Analytics", href: "/band/artist/analytics", icon: BarChart3 },
    ],
  },
  {
    items: [
      { label: "Settings", href: "/band/artist/settings", icon: Settings },
    ],
  },
];

export const BAND_VENUE_NAV: NavSection[] = [
  {
    items: [
      { label: "Home", href: "/band/venue/dashboard", icon: Home },
      { label: "Profile", href: "/band/venue/profile", icon: Building2 },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Bookings", href: "/band/venue/bookings", icon: CalendarDays },
      { label: "Reviews", href: "/band/venue/reviews", icon: MessageSquare },
      { label: "Messages", href: "/band/venue/messages", icon: Inbox },
      { label: "Payments", href: "/band/venue/earnings", icon: IndianRupee },
    ],
  },
  {
    items: [
      { label: "Settings", href: "/band/venue/settings", icon: Settings },
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
