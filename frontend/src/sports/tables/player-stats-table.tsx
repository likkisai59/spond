"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable, type DataTableColumn } from "@/components/tables";
import { getInitials } from "@/utils/helpers";
import type { PlayerStats } from "@/types";
import { cn } from "@/utils/cn";

export interface PlayerStatsTableProps {
  players: PlayerStats[];
}

export function PlayerStatsTable({ players }: PlayerStatsTableProps) {
  const columns: DataTableColumn<PlayerStats>[] = [
    {
      key: "name",
      header: "Player",
      render: (player) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{player.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {player.groupName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "matches",
      header: "Matches",
      render: (player) => (
        <span className="text-sm font-semibold">{player.matches}</span>
      ),
    },
    {
      key: "goals",
      header: "Goals",
      render: (player) => (
        <span
          className={cn(
            "text-sm font-bold",
            player.goals >= 8 && "text-accent"
          )}
        >
          {player.goals}
        </span>
      ),
    },
    {
      key: "assists",
      header: "Assists",
      render: (player) => (
        <span className="text-sm font-semibold">{player.assists}</span>
      ),
    },
    {
      key: "attendanceRate",
      header: "Attendance",
      render: (player) => (
        <div className="flex min-w-28 items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-brand-gradient"
              style={{ width: `${player.attendanceRate}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {player.attendanceRate}%
          </span>
        </div>
      ),
    },
    {
      key: "mvpAwards",
      header: "MVP",
      render: (player) => (
        <span
          className={cn(
            "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold",
            player.mvpAwards > 0
              ? "bg-brand-gradient text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {player.mvpAwards}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={players}
      rowKey={(player) => player.id}
      emptyTitle="No players to show"
      emptyDescription="Player statistics will appear once matches are recorded."
    />
  );
}
