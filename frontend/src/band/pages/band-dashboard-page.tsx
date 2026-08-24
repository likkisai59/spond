"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Music, Users, DollarSign } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard, StatCard } from "@/components/cards";
import { PRODUCT_CONFIGS, ROUTES } from "@/constants";

export function BandDashboardPage() {
  const config = PRODUCT_CONFIGS.band;
  const [stats, setStats] = useState({
    total_artists: 0,
    total_venues: 0,
    total_bookings: 0,
    total_revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/band/dashboard");
        const data = response.data.overview || response.data;
        setStats({
          total_artists: data.total_artists || 0,
          total_venues: data.total_venues || 0,
          total_bookings: data.total_bookings || 0,
          total_revenue: data.total_revenue || 0,
        });
      } catch (error) {
        console.error("Failed to fetch band dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: config.name },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="BandConnect Dashboard"
        description="Your marketplace hub for bookings and connections."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Artists" value={stats.total_artists} icon={Users} />
        <StatCard label="Venues" value={stats.total_venues} icon={Music} />
        <StatCard label="Bookings" value={stats.total_bookings} icon={CalendarDays} />
        <StatCard label="Revenue" value={`$${stats.total_revenue}`} icon={DollarSign} />
      </div>

      <div className="mt-6">
        <EmptyCard
          title="More analytics coming soon"
          description="Detailed artist and venue analytics will appear here as activity grows."
        />
      </div>
    </PageContainer>
  );
}
