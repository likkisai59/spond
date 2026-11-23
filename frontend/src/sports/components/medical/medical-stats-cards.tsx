"use client";

import { StatsCard } from "@/sports/components";
import { CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import type { PCMASquadStats } from "@/types";

interface MedicalStatsCardsProps {
  stats: PCMASquadStats;
}

export function MedicalStatsCards({ stats }: MedicalStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatsCard
        label="Cleared / Fit"
        value={stats.clearedCount}
        icon={CheckCircle2}
        className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
      />
      <StatsCard
        label="Pending Assessment"
        value={stats.pendingCount}
        icon={Clock}
        className="border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400"
      />
      <StatsCard
        label="Declared Unfit"
        value={stats.unfitCount}
        icon={XCircle}
        className="border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400"
      />
      <StatsCard
        label="Expired Clearance"
        value={stats.expiredCount}
        icon={AlertTriangle}
        className="border-zinc-500/20 bg-zinc-500/5 text-zinc-600 dark:text-zinc-400"
      />
    </div>
  );
}
