"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import type { GroupMember } from "@/types";
import { getInitials } from "@/utils/helpers";
import { cn } from "@/utils/cn";

export type AttendanceMark = "Present" | "Late" | "Absent";

const MARK_OPTIONS: {
  mark: AttendanceMark;
  label: string;
  activeClass: string;
}[] = [
  {
    mark: "Present",
    label: "Present",
    activeClass: "bg-emerald-600 text-white border-emerald-600",
  },
  {
    mark: "Late",
    label: "Late",
    activeClass: "bg-amber-500 text-white border-amber-500",
  },
  {
    mark: "Absent",
    label: "Absent",
    activeClass: "bg-zinc-600 text-white border-zinc-600",
  },
];

export interface AttendanceTrackerProps {
  members: GroupMember[];
  eventName: string;
  className?: string;
}

export function AttendanceTracker({
  members,
  eventName,
  className,
}: AttendanceTrackerProps) {
  const dispatch = useAppDispatch();
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});
  const [saved, setSaved] = useState(false);

  const summary = useMemo(() => {
    const values = Object.values(marks);
    return {
      present: values.filter((v) => v === "Present").length,
      late: values.filter((v) => v === "Late").length,
      absent: values.filter((v) => v === "Absent").length,
      marked: values.length,
    };
  }, [marks]);

  const handleMark = (memberId: string, mark: AttendanceMark) => {
    setMarks((current) => {
      const next = { ...current };
      if (next[memberId] === mark) delete next[memberId];
      else next[memberId] = mark;
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    dispatch(
      notificationAdded({
        title: "Attendance saved",
        message: `${summary.marked}/${members.length} members marked for "${eventName}" (demo mode).`,
        variant: "success",
      })
    );
    setSaved(true);
  };

  return (
    <Card className={cn("p-6 sm:p-7", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">
            Take attendance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark each member once the session starts.
          </p>
        </div>
        <Badge variant="secondary">
          {summary.marked}/{members.length} marked
        </Badge>
      </div>

      {members.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No members to track yet.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {members.map((member) => {
            const mark = marks[member.id];
            return (
              <li
                key={member.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {MARK_OPTIONS.map(({ mark: option, label, activeClass }) => {
                    const active = mark === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleMark(member.id, option)}
                        aria-pressed={active}
                        aria-label={`Mark ${member.name} as ${label}`}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                          active
                            ? activeClass
                            : "border-border/70 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {summary.present} present
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            {summary.late} late
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Circle className="h-3.5 w-3.5 fill-zinc-500 text-zinc-500" />
            {summary.absent} absent
          </span>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={handleSave}
          disabled={members.length === 0 || summary.marked === 0}
        >
          {saved ? "Saved" : "Save attendance"}
        </Button>
      </div>
    </Card>
  );
}
