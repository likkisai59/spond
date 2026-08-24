"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

const DEMO_CHAPTERS = [
  { time: "00:00", title: "Welcome to Unify" },
  { time: "01:20", title: "Manage your sports club" },
  { time: "03:05", title: "Discover artists & venues" },
  { time: "04:40", title: "Payments made simple" },
] as const;

const DEMO_HIGHLIGHTS = [
  "Create groups, events and polls in seconds",
  "RSVP, attendance and payments tracked automatically",
  "BandConnect marketplace for artists, bands and venues",
] as const;

const DEMO_DURATION_SECONDS = 320;

export interface WatchDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WatchDemoModal({ open, onOpenChange }: WatchDemoModalProps) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setElapsed(0);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((current) =>
        current + 1 >= DEMO_DURATION_SECONDS ? 0 : current + 1
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  };

  const progress = (elapsed / DEMO_DURATION_SECONDS) * 100;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl gap-5">
        <ModalHeader>
          <ModalTitle>Product demo</ModalTitle>
          <ModalDescription>
            A five-minute tour of the Sports suite and the BandConnect
            marketplace (demo preview).
          </ModalDescription>
        </ModalHeader>

        <div className="overflow-hidden rounded-xl border border-border/70 bg-primary shadow-elevated">
          <div className="relative aspect-video w-full">
            <div className="absolute inset-0 bg-brand-gradient opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
              <Badge
                variant="gradient"
                className="bg-white/15 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm"
              >
                Unify · Platform tour
              </Badge>
              <p className="px-6 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                One account. Two worlds.
              </p>
              <button
                type="button"
                onClick={() => setPlaying((current) => !current)}
                aria-label={playing ? "Pause demo" : "Play demo"}
                className="group flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {playing ? (
                  <Pause className="h-7 w-7 text-white" />
                ) : (
                  <Play className="ml-1 h-7 w-7 text-white" />
                )}
              </button>
            </div>

            {playing ? (
              <div className="absolute left-6 top-6 animate-fade-in-up rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-left backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Now playing
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {
                    DEMO_CHAPTERS[
                      Math.min(
                        DEMO_CHAPTERS.length - 1,
                        Math.floor(elapsed / 80)
                      )
                    ].title
                  }
                </p>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tabular-nums text-white/70">
                {formatTimestamp(elapsed)}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <span
                  className="block h-full rounded-full bg-white transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-white/70">
                {formatTimestamp(DEMO_DURATION_SECONDS)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setPlaying((current) => !current)}
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause /> : <Play />}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setElapsed(0)}
                  aria-label="Restart demo"
                >
                  <RotateCcw />
                </Button>
              </div>
              <Volume2 className="h-4 w-4 text-white/60" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Chapters
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {DEMO_CHAPTERS.map((chapter) => (
                <li
                  key={chapter.time}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <span className="font-bold tabular-nums text-accent">
                    {chapter.time}
                  </span>
                  <span className="text-muted-foreground">{chapter.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              What you&apos;ll see
            </p>
            <ul className="mt-2.5 space-y-2">
              {DEMO_HIGHLIGHTS.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col-reverse gap-2 border-t border-border/70 pt-4",
            "sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <p className="text-xs text-muted-foreground">
            Demo preview — the full guided tour ships with the product launch.
          </p>
          <Button asChild variant="accent">
            <Link href={ROUTES.REGISTER}>Create free account</Link>
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
