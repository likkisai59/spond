"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";
import {
  ArrowLeft,
  Flag,
  MapPin,
  Repeat,
  Sparkles,
  Square,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { MatchStatsCard } from "../components/match-stats-card";
// Mock removed
import { formatDateTime } from "@/utils/date";
import { ROUTES } from "@/constants";
import type { MatchResult, MatchTimelineKind } from "@/types";
import { cn } from "@/utils/cn";

const RESULT_VARIANTS: Record<
  MatchResult,
  "success" | "secondary" | "destructive" | "accent"
> = {
  Win: "success",
  Draw: "secondary",
  Loss: "destructive",
  Scheduled: "accent",
};

const TIMELINE_ICONS: Record<MatchTimelineKind, typeof Target> = {
  Goal: Target,
  Assist: Sparkles,
  "Yellow card": Square,
  "Red card": Square,
  Substitution: Repeat,
  "Half time": Timer,
  "Full time": Flag,
};

export function MatchSummaryPage() {
  const params = useParams<{ matchId: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchSummary = async () => {
      try {
        const response = await apiClient.get(`/sports/matches/${params.matchId}/summary`);
        setMatch(response.data);
      } catch (error) {
        console.error("Failed to fetch match summary", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.matchId) {
      fetchMatchSummary();
    }
  }, [params.matchId]);

  if (loading) {
    return (
      <PageContainer as="main">
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Loading summary...</p>
        </div>
      </PageContainer>
    );
  }

  if (!match) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Events", href: ROUTES.SPORTS_EVENTS },
            { label: "Match summary not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          title="No match summary"
          description="A summary is published for completed and upcoming Match-type events."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_EVENTS}>Back to events</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const isScheduled = match.result === "Scheduled";

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Events", href: ROUTES.SPORTS_EVENTS },
          { label: "Match summary" },
        ]}
        className="mb-4"
      />

      <Card className="animate-fade-in-up p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Badge variant="secondary">Match summary</Badge>
          <div className="flex items-center gap-2">
            <Badge variant={RESULT_VARIANTS[match.result as MatchResult]}>{match.result}</Badge>
            <Button asChild variant="ghost" size="sm">
              <Link href={`${ROUTES.SPORTS_EVENTS}/${match.eventId}`}>
                <ArrowLeft />
                Event details
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 items-center gap-2 sm:gap-6">
          <div className="min-w-0 text-center sm:text-left">
            <p className="truncate text-sm font-bold sm:text-base">
              {match.homeTeam}
            </p>
            <p className="text-xs text-muted-foreground">Home</p>
          </div>
          <div className="text-center">
            {isScheduled ? (
              <p className="text-2xl font-extrabold tracking-tight text-muted-foreground sm:text-4xl">
                vs
              </p>
            ) : (
              <p className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                {match.homeScore} – {match.awayScore}
              </p>
            )}
          </div>
          <div className="min-w-0 text-center sm:text-right">
            <p className="truncate text-sm font-bold sm:text-base">
              {match.awayTeam}
            </p>
            <p className="text-xs text-muted-foreground">Away</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-accent" />
            {match.venue}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-accent" />
            Kick-off {formatDateTime(match.kickoff)}
          </span>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 animate-fade-in-up lg:col-span-2">
          <h2 className="text-lg font-extrabold tracking-tight">Timeline</h2>
          {match.timeline && match.timeline.length > 0 ? (
            <ol className="mt-5 space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {match.timeline.map((item: any) => {
                const Icon = TIMELINE_ICONS[item.kind as MatchTimelineKind];
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3.5",
                      item.side === "away" && "flex-row-reverse text-right"
                    )}
                  >
                    <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-extrabold">
                      {item.minute}&prime;
                    </span>
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        item.kind === "Goal"
                          ? "bg-brand-gradient text-white"
                          : item.kind === "Red card"
                            ? "bg-rose-100 text-rose-700"
                            : item.kind === "Yellow card"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-brand-gradient-soft text-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className={cn("min-w-0 flex-1", item.side === "away" && "text-right")}>
                      <p className="text-sm font-bold">
                        {item.kind}
                        {item.side === "away" ? " (A)" : ""}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.player}
                        {item.detail ? ` · ${item.detail}` : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="mt-4">
              <EmptyCard
                title="Match not played yet"
                description="The timeline fills in once the match kicks off."
              />
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <MatchStatsCard
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            stats={match.teamStats}
            className="animate-fade-in-up"
          />

          <Card className="p-5 sm:p-6 animate-fade-in-up">
            <h2 className="text-lg font-extrabold tracking-tight">
              Top performers
            </h2>
            {match.topPerformers && match.topPerformers.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {match.topPerformers.map((performer: any) => (
                  <li
                    key={performer.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
                  >
                    <span className="min-w-0 truncate text-sm font-bold">
                      {performer.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-accent">
                      {performer.stat}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Performers are picked after the final whistle.
              </p>
            )}
            {match.manOfTheMatch ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-gradient-soft px-4 py-3">
                <Trophy className="h-5 w-5 shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Player of the match
                  </p>
                  <p className="truncate text-sm font-extrabold">
                    {match.manOfTheMatch}
                  </p>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
