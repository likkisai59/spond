"use client";

import * as React from "react";
import { useArtistDashboard } from "@/hooks/use-artist-dashboard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TrendingUp, IndianRupee, Eye, CalendarCheck, Star, BarChart3, Activity } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";

export default function ArtistAnalyticsPage() {
  const { data, loading, error, refetch } = useArtistDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading performance insights...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState
          title="Insights Load Failure"
          message={error || "An unexpected error occurred while loading your insights."}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Calculate some derived metrics
  const maxRevenue = data.revenue_chart && data.revenue_chart.length > 0 
    ? Math.max(...data.revenue_chart.map(d => d.revenue))
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Performance Insights
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Detailed analytics on your profile views, booking requests, and client reviews.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs h-9 bg-card border-border hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Earnings</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{formatCurrency(data.total_earnings || 0)}</div>
            <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Profile Views</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{data.profile_views?.toLocaleString() || "0"}</div>
            <p className="text-[10px] text-blue-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Steady organic growth
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Completed Gigs</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{data.total_bookings || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              All time successful events
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Average Rating</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {data.average_rating ? data.average_rating.toFixed(1) : "N/A"}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Based on client reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Bar Chart */}
        <Card className="lg:col-span-2 bg-card border-border shadow-md">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            {(!data.revenue_chart || data.revenue_chart.length === 0) ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl">
                <Activity className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">Not enough data to display revenue trends.</p>
              </div>
            ) : (
              <div className="h-64 flex items-end gap-2 md:gap-4 justify-between w-full relative">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="w-full border-t border-muted-foreground"></div>
                  <div className="w-full border-t border-muted-foreground"></div>
                  <div className="w-full border-t border-muted-foreground"></div>
                  <div className="w-full border-t border-muted-foreground"></div>
                </div>

                {data.revenue_chart.map((point, index) => {
                  const heightPercent = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 z-10 group cursor-pointer">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded">
                        {formatCurrency(point.revenue)}
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-all rounded-t-md relative flex items-end justify-center pb-2" style={{ height: `${heightPercent}%`, minHeight: '4px' }}>
                         {heightPercent > 10 && <span className="text-[9px] font-bold text-primary group-hover:text-primary-foreground rotate-[-90deg] whitespace-nowrap">{formatCurrency(point.revenue)}</span>}
                      </div>
                      
                      {/* X-axis Label */}
                      <span className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">{point.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Strength / Extra Analytics */}
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Profile Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Profile Completion</span>
                <span className="text-primary font-bold">{data.profile_completion || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-accent rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${data.profile_completion || 0}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">A complete profile attracts 3x more bookings.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
               <h4 className="text-xs font-bold text-foreground">Upcoming Pipeline</h4>
               <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-accent/30">
                 <span className="text-xs text-muted-foreground">Pending Requests</span>
                 <span className="text-sm font-black text-amber-500">{data.pending_requests_count || 0}</span>
               </div>
               <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-accent/30">
                 <span className="text-xs text-muted-foreground">Upcoming Events</span>
                 <span className="text-sm font-black text-emerald-500">{data.upcoming_events_count || 0}</span>
               </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
