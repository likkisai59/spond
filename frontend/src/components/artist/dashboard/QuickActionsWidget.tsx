"use client";

import * as React from "react";
import { 
  UserCheck, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  DollarSign, 
  Inbox
} from "lucide-react";
import { DashboardQuickActions, DashboardActionItem } from "@/components/shared/dashboard/DashboardQuickActions";

export function QuickActionsWidget() {
  const actions: DashboardActionItem[] = [
    {
      label: "Complete Profile",
      description: "Improve discoverability",
      href: "/artist/profile",
      icon: UserCheck,
      color: "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/10"
    },
    {
      label: "Update Availability",
      description: "Manage calendar slots",
      href: "/artist/profile?tab=availability",
      icon: Calendar,
      color: "text-blue-400 hover:bg-blue-500/10 border-blue-500/10"
    },
    {
      label: "Upload Gallery Photos",
      description: "Add live show photos",
      href: "/artist/profile?tab=gallery",
      icon: ImageIcon,
      color: "text-purple-400 hover:bg-purple-500/10 border-purple-500/10"
    },
    {
      label: "Upload Demo Video",
      description: "Add YouTube/Vimeo links",
      href: "/artist/profile?tab=media",
      icon: Video,
      color: "text-pink-400 hover:bg-pink-500/10 border-pink-500/10"
    },
    {
      label: "Manage Booking Rates",
      description: "Configure travel rates",
      href: "/artist/profile?tab=pricing",
      icon: DollarSign,
      color: "text-amber-400 hover:bg-amber-500/10 border-amber-500/10"
    },
    {
      label: "View Booking Inbox",
      description: "Review incoming gigs",
      href: "/band/artist/bookings",
      icon: Inbox,
      color: "text-indigo-400 hover:bg-indigo-500/10 border-indigo-500/10"
    }
  ];

  return <DashboardQuickActions title="Quick Actions" actions={actions} />;
}
