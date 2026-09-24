"use client";

import { BarChart3, CalendarClock } from "lucide-react";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { voteToggled } from "@/store/sports/polls-slice";
import { isPollExpired } from "@/store/sports/selectors";
import { StatusBadge } from "./status-badge";
import { formatDate } from "@/utils/date";
import type { SportsPoll } from "@/types";
import { cn } from "@/utils/cn";

export interface PollCardProps {
  poll: SportsPoll;
  groupName?: string;
  className?: string;
}

export function PollCard({ poll, groupName, className }: PollCardProps) {
  const dispatch = useAppDispatch();
  const isClosed = poll.status === "Closed" || isPollExpired(poll.expiresAt);
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  const hasVoted = poll.votedOptionIds.length > 0;

  return (
    <Card
      interactive
      className={cn("flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {groupName ? (
            <p className="text-xs font-bold uppercase tracking-wider text-accent">
              {groupName}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-extrabold leading-snug tracking-tight">
            {poll.question}
          </h3>
        </div>
        <StatusBadge status={isClosed ? "Closed" : "Active"} />
      </div>

      <div className="mt-5 flex-1 space-y-3">
        {poll.options.map((option) => {
          const percent =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const voted = poll.votedOptionIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              disabled={isClosed}
              onClick={() =>
                dispatch(voteToggled({ pollId: poll.id, optionId: option.id }))
              }
              className={cn(
                "group relative w-full overflow-hidden rounded-xl border px-4 py-2.5 text-left transition-all",
                voted
                  ? "border-accent/50 bg-brand-gradient-soft"
                  : "border-border/70 hover:border-accent/40",
                !isClosed ? "cursor-pointer" : "cursor-default"
              )}
              aria-pressed={voted}
            >
              <span
                className={cn(
                  "absolute inset-y-0 left-0 bg-brand-gradient opacity-15 transition-all",
                  voted && "opacity-25"
                )}
                style={{ width: `${percent}%` }}
              />
              <span className="relative flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                      voted ? "border-accent bg-accent" : "border-input"
                    )}
                  >
                    {voted ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </span>
                  <span className="truncate text-sm font-semibold">
                    {option.label}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-muted-foreground">
                  {option.votes} · {percent}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <BarChart3 className="h-3.5 w-3.5 text-accent" />
          {totalVotes} votes
          {poll.multipleChoice ? " · multiple choice" : ""}
          {hasVoted ? " · you voted" : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-accent" />
          {isClosed
            ? `Ended ${formatDate(poll.expiresAt)}`
            : `Ends ${formatDate(poll.expiresAt)}`}
        </span>
      </div>
    </Card>
  );
}
