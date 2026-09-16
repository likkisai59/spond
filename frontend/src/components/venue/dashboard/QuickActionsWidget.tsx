"use client";

import * as React from "react";
import { 
  UserCheck, 
  Calendar, 
  Image as ImageIcon, 
  DollarSign, 
  Inbox, 
  MessageSquare, 
  ShieldCheck 
} from "lucide-react";
import { DashboardQuickActions, DashboardActionItem } from "@/components/shared/dashboard/DashboardQuickActions";

export function QuickActionsWidget() {
  const actions: DashboardActionItem[] = [
    {
      label: "Complete Profile",
      description: "Improve listing search rank",
      href: "/venue/venues",
      icon: UserCheck,
      color: "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/10"
    },
    {
      label: "Manage Availability",
      description: "Add blocked/maintenance dates",
      href: "/band/venue/bookings",
      icon: Calendar,
      color: "text-blue-400 hover:bg-blue-500/10 border-blue-500/10"
    },
    {
      label: "Update Pricing",
      description: "Configure rents & weekend rates",
      href: "/venue/venues",
      icon: DollarSign,
      color: "text-purple-400 hover:bg-purple-500/10 border-purple-500/10"
    },
    {
      label: "Upload Gallery",
      description: "Add photos and virtual tours",
      href: "/venue/venues",
      icon: ImageIcon,
      color: "text-pink-400 hover:bg-pink-500/10 border-pink-500/10"
    },
    {
      label: "Manage Reviews",
      description: "Reply to client feedback & ratings",
      href: "/venue/reviews",
      icon: MessageSquare,
      color: "text-amber-400 hover:bg-amber-500/10 border-amber-500/10"
    },
    {
      label: "View Booking Requests",
      description: "Review incoming reservations",
      href: "/band/venue/bookings",
      icon: Inbox,
      color: "text-indigo-400 hover:bg-indigo-500/10 border-indigo-500/10"
    },
    {
      label: "Compliance Verification",
      description: "Check status & submit documents",
      href: "/venue/verification",
      icon: ShieldCheck,
      color: "text-teal-400 hover:bg-teal-500/10 border-teal-500/10"
    }
  ];

  return <DashboardQuickActions title="Quick Actions" actions={actions} />;
}
