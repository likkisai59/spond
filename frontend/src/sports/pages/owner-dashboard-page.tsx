"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "../components";
import { Building2, CalendarCheck } from "lucide-react";
import { ROUTES } from "@/constants";
import { venuesService } from "@/services/sports";

export function OwnerDashboardPage() {
  const [venuesCount, setVenuesCount] = useState(0);

  useEffect(() => {
    venuesService.listOwnerVenues().then((res) => {
      setVenuesCount(res.data?.items?.length || 0);
    });
  }, []);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Owner Dashboard" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Venue Owner Dashboard"
        description="Overview of your operations and venues."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="My Venues"
          value={venuesCount}
          icon={Building2}
          className="animate-fade-in-up"
        />
        <StatsCard
          label="Total Bookings"
          value={0}
          icon={CalendarCheck}
          className="animate-fade-in-up [animation-delay:60ms]"
        />
      </div>
    </PageContainer>
  );
}
