"use client";

import { useState } from "react";
import { Check, Clock, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { cn } from "@/utils/cn";

export type RsvpChoice = "Going" | "Maybe" | "Not going";

const RSVP_OPTIONS: {
  choice: RsvpChoice;
  icon: typeof Check;
  hint: string;
}[] = [
  { choice: "Going", icon: Check, hint: "Count me in" },
  { choice: "Maybe", icon: HelpCircle, hint: "I'll try to make it" },
  { choice: "Not going", icon: X, hint: "Skip this one" },
];

export interface RsvpCardProps {
  eventName: string;
  className?: string;
}

export function RsvpCard({ eventName, className }: RsvpCardProps) {
  const dispatch = useAppDispatch();
  const [response, setResponse] = useState<RsvpChoice | null>(null);

  const handleRespond = (choice: RsvpChoice) => {
    setResponse(choice);
    dispatch(
      notificationAdded({
        title: `RSVP saved — ${choice}`,
        message: `Your response for "${eventName}" was recorded (demo mode).`,
        variant: choice === "Not going" ? "info" : "success",
      })
    );
  };

  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-lg font-extrabold tracking-tight">Your response</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {response
          ? `You marked yourself as "${response}". You can change this until the event starts.`
          : "Let the organiser know if you can make it."}
      </p>
      <div className="mt-4 space-y-2">
        {RSVP_OPTIONS.map(({ choice, icon: Icon, hint }) => {
          const selected = response === choice;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => handleRespond(choice)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                selected
                  ? "border-accent/50 bg-brand-gradient-soft shadow-sm"
                  : "border-border/70 hover:border-accent/40 hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  selected ? "bg-brand-gradient text-white" : "bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{choice}</span>
                <span className="block text-xs text-muted-foreground">
                  {hint}
                </span>
              </span>
              {selected ? (
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {response ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            setResponse(null);
            dispatch(
              notificationAdded({
                title: "RSVP cleared",
                message: `Your response for "${eventName}" was removed (demo mode).`,
                variant: "info",
              })
            );
          }}
        >
          <Clock />
          Change my response
        </Button>
      ) : null}
    </Card>
  );
}
