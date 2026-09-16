"use client";

import * as React from "react";
import { Calendar, TrendingUp, Star, Eye } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { DashboardStatsCards, DashboardStatItem } from "@/components/shared/dashboard/DashboardStatsCards";

export interface StatsCardsProps {
  stats: {
    total_bookings: number;
    upcoming_events_count: number;
    pending_requests_count: number;
    monthly_revenue: number;
    total_earnings: number;
    average_rating: number;
    profile_completion: number;
    profile_views: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cardData: DashboardStatItem[] = [
    {
      title: "Upcoming Events",
      value: stats.upcoming_events_count,
      description: "Confirmed upcoming gigs",
      icon: Calendar,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthly_revenue),
      description: "Earnings this month",
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Average Rating",
      value: `${stats.average_rating.toFixed(1)} / 5`,
      description: "Based on client reviews",
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20"
    },
    {
      title: "Profile Views",
      value: stats.profile_views,
      description: "Views in the last 30 days",
      icon: Eye,
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/20"
    }
  ];

  return <DashboardStatsCards items={cardData} gridCols="grid-cols-2 lg:grid-cols-4" />;
}
