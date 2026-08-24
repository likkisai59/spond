import { Card } from "@/components/shared/card";
import type { MatchTeamStats } from "@/types";
import { cn } from "@/utils/cn";

const STAT_ROWS: {
  key: keyof MatchTeamStats;
  label: string;
  isPercent?: boolean;
}[] = [
  { key: "possession", label: "Possession", isPercent: true },
  { key: "shots", label: "Shots" },
  { key: "shotsOnTarget", label: "Shots on target" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fouls" },
];

export interface MatchStatsCardProps {
  homeTeam: string;
  awayTeam: string;
  stats: { home: MatchTeamStats; away: MatchTeamStats };
  className?: string;
}

export function MatchStatsCard({
  homeTeam,
  awayTeam,
  stats,
  className,
}: MatchStatsCardProps) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="truncate">{homeTeam}</span>
        <span className="text-foreground">Match stats</span>
        <span className="truncate">{awayTeam}</span>
      </div>
      <div className="mt-4 space-y-4">
        {STAT_ROWS.map(({ key, label, isPercent }) => {
          const home = stats.home[key];
          const away = stats.away[key];
          const total = home + away;
          const homePct = total > 0 ? (home / total) * 100 : 50;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm">
                <span
                  className={cn(
                    "w-12 text-left font-bold",
                    home > away && "text-accent"
                  )}
                >
                  {home}
                  {isPercent ? "%" : ""}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {label}
                </span>
                <span
                  className={cn(
                    "w-12 text-right font-bold",
                    away > home && "text-accent"
                  )}
                >
                  {away}
                  {isPercent ? "%" : ""}
                </span>
              </div>
              <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="h-full bg-brand-gradient transition-all"
                  style={{ width: `${homePct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
