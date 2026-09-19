"use client";

import * as React from "react";
import { useArtistDashboard } from "@/hooks/use-artist-dashboard";
import { StatsCards } from "@/components/artist/dashboard/StatsCards";
import { RevenueChartWidget } from "@/components/artist/dashboard/RevenueChartWidget";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { RefreshCw, Edit3 } from "lucide-react";
import Link from "next/link";

/**
 * Artist Home Dashboard — rich overview page matching Music-Band.
 */
export default function ArtistDashboardPage() {
  const { data, loading, error, refetch } = useArtistDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading your home overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState
          title="Home Overview Load Failure"
          message={error || "An unexpected error occurred while loading your home overview."}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Artist Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Your EventHub performer portal — overview of your performance metrics, upcoming gigs, and recent reviews.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button asChild size="sm" className="flex items-center gap-1.5 text-xs h-9 font-bold">
            <Link href="/band/artist/profile?tab=edit">
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="flex items-center gap-1.5 text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>



      {/* 4 Stat Cards */}
      <StatsCards stats={data} />

      {/* Revenue Chart + Profile Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChartWidget data={data.revenue_chart} />
        </div>
        <div className="space-y-6">
          {/* Profile Completion Card */}
          <div className="bg-card/45 backdrop-blur-md border border-border p-6 rounded-3xl shadow-xl flex flex-col h-full gap-6">
            <div className="space-y-2">
              <span className="text-sm font-bold text-foreground block">
                Profile completion
              </span>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Finish setup to appear higher in host searches.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {data.profile_completion || 65}%
                </span>
                <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${data.profile_completion || 65}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[13px] text-foreground">Basic details</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[13px] text-foreground">Profile photos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span className="text-[13px] text-muted-foreground">Pricing & packages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                <span className="text-[13px] text-muted-foreground">Availability hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
