"use client";

import { useMemo, useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { Search, SearchX, Target, TrendingUp, Trophy } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard, StatCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks";
import { PlayerStatsTable } from "../tables/player-stats-table";
// Mock removed
import { ROUTES } from "@/constants";

type StatsSort = "goals" | "assists" | "attendance" | "matches" | "mvp";

const SORT_OPTIONS: { value: StatsSort; label: string }[] = [
  { value: "goals", label: "Most goals" },
  { value: "assists", label: "Most assists" },
  { value: "attendance", label: "Best attendance" },
  { value: "matches", label: "Most matches" },
  { value: "mvp", label: "Most MVP awards" },
];

export function StatisticsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<StatsSort>("goals");
  const debouncedSearch = useDebounce(search, 250);

  const [rawStats, setRawStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/sports/statistics/players");
        setRawStats(response.data.items || response.data || []);
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      }
    };
    fetchStats();
  }, []);

  const players = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return rawStats
      .filter(
        (player) =>
          query.length === 0 ||
          player.name.toLowerCase().includes(query) ||
          player.groupName.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "assists":
            return b.assists - a.assists;
          case "attendance":
            return b.attendanceRate - a.attendanceRate;
          case "matches":
            return b.matches - a.matches;
          case "mvp":
            return b.mvpAwards - a.mvpAwards;
          case "goals":
          default:
            return b.goals - a.goals;
        }
      });
  }, [debouncedSearch, sortBy]);

  const topScorer = useMemo(
    () =>
      [...rawStats].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0] ?? null,
    [rawStats]
  );
  const topAssistant = useMemo(
    () =>
      [...rawStats].sort((a, b) => (b.assists || 0) - (a.assists || 0))[0] ?? null,
    [rawStats]
  );
  const bestAttendance = useMemo(
    () =>
      [...rawStats].sort(
        (a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0)
      )[0] ?? null,
    [rawStats]
  );

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Statistics" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Statistics"
        description="Player performance across groups, matches and sessions."
        className="animate-fade-in-up"
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Top scorer"
          value={topScorer?.name ?? "—"}
          icon={Target}
          trend={
            topScorer ? { value: `${topScorer.goals} goals`, direction: "up" } : undefined
          }
          className="animate-fade-in-up"
        />
        <StatCard
          label="Most assists"
          value={topAssistant?.name ?? "—"}
          icon={TrendingUp}
          trend={
            topAssistant
              ? { value: `${topAssistant.assists} assists`, direction: "up" }
              : undefined
          }
          className="animate-fade-in-up [animation-delay:100ms]"
        />
        <StatCard
          label="Best attendance"
          value={bestAttendance?.name ?? "—"}
          icon={Trophy}
          trend={
            bestAttendance
              ? {
                  value: `${bestAttendance.attendanceRate}% turnout`,
                  direction: "up",
                }
              : undefined
          }
          className="animate-fade-in-up [animation-delay:200ms]"
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search players or groups…"
            className="pl-9"
            aria-label="Search players"
          />
        </div>
        <div className="sm:ml-auto sm:w-56">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as StatsSort)}>
            <SelectTrigger aria-label="Sort statistics">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {rawStats.length === 0 ? (
          <EmptyCard
            title="No statistics yet"
            description="Player stats appear once matches are recorded."
          />
        ) : players.length === 0 ? (
          <EmptyCard
            icon={SearchX}
            title="No matching players"
            description="Try a different name or group."
          />
        ) : (
          <PlayerStatsTable players={players} />
        )}
      </div>
    </PageContainer>
  );
}
