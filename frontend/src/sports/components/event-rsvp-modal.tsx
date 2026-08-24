"use client";

import { useEffect, useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { formatDate } from "@/utils/date";
import { formatTime } from "@/utils/helpers";
import type { RsvpChoice } from "./rsvp-card";
import { cn } from "@/utils/cn";

const RSVP_OPTIONS: {
  choice: RsvpChoice;
  icon: typeof Check;
  hint: string;
}[] = [
  { choice: "Going", icon: Check, hint: "Count me in" },
  { choice: "Maybe", icon: HelpCircle, hint: "I'll try to make it" },
  { choice: "Not going", icon: X, hint: "Skip this one" },
];

export interface EventRsvpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventDate?: string;
  eventTime?: string;
  onRespond?: (choice: RsvpChoice) => void;
}

export function EventRsvpModal({
  open,
  onOpenChange,
  eventName,
  eventDate,
  eventTime,
  onRespond,
}: EventRsvpModalProps) {
  const dispatch = useAppDispatch();
  const [response, setResponse] = useState<RsvpChoice | null>(null);

  useEffect(() => {
    if (!open) setResponse(null);
  }, [open]);

  const handleRespond = (choice: RsvpChoice) => {
    setResponse(choice);
    dispatch(
      notificationAdded({
        title: `RSVP saved — ${choice}`,
        message: `Your response for "${eventName}" was recorded (demo mode).`,
        variant: choice === "Not going" ? "info" : "success",
      })
    );
    onRespond?.(choice);
    onOpenChange(false);
  };

  const whenLabel = eventDate
    ? `${formatDate(eventDate)}${eventTime ? ` · ${formatTime(eventTime)}` : ""}`
    : null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="truncate pr-8">{eventName}</ModalTitle>
          <ModalDescription>
            {whenLabel ? `${whenLabel} — ` : ""}
            Let the organiser know if you can make it.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-2">
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

        <ModalFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
