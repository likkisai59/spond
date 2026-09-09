"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Music,
  CheckCircle,
  CalendarCheck,
  CreditCard,
  Play,
  Mic2,
  Guitar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants";
import { AnimatedCounter } from "./animated-counter";

const WatchDemoModal = dynamic(
  () => import("./watch-demo-modal").then((m) => m.WatchDemoModal),
  { ssr: false, loading: () => null }
);

const heroStats = [
  { value: 500, suffix: "+", label: "Verified Venues" },
  { value: 1200, suffix: "+", label: "Live Artists" },
  { value: 100, suffix: "%", label: "Secure Payments" },
] as const;

function HeroIllustration() {
  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      <div className="absolute inset-6 rounded-full bg-brand-gradient opacity-20 blur-3xl" />

      <div className="relative ml-auto w-full max-w-md -rotate-2 rounded-lg border border-border/70 bg-card p-5 shadow-elevated transition-transform duration-500 hover:rotate-0">
        <div className="flex items-center gap-2 border-b border-border/70 pb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-gradient" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="ml-2 h-2.5 w-24 rounded-full bg-muted" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="space-y-2 rounded-xl bg-brand-gradient-soft p-3">
            <Mic2 className="h-5 w-5 text-accent" />
            <div className="h-2 w-3/4 rounded-full bg-primary/20" />
            <div className="h-2 w-1/2 rounded-full bg-primary/10" />
          </div>
          <div className="space-y-2 rounded-xl bg-muted/60 p-3">
            <Guitar className="h-5 w-5 text-primary" />
            <div className="h-2 w-3/4 rounded-full bg-primary/20" />
            <div className="h-2 w-1/2 rounded-full bg-primary/10" />
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {[Music, CreditCard].map((RowIcon, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient-soft">
                <RowIcon className="h-4 w-4 text-accent" />
              </span>
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-2/3 rounded-full bg-muted" />
                <div className="h-2 w-1/3 rounded-full bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -left-6 top-8 flex animate-fade-in-up items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 shadow-elevated [animation-delay:150ms]">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
          <Music className="h-4 w-4 text-white" />
        </span>
        <div>
          <p className="text-xs font-bold">The Grand Arena</p>
          <p className="text-[11px] text-muted-foreground">Live Concert · Tonight</p>
        </div>
      </div>

      <div className="absolute -bottom-4 left-10 flex animate-fade-in-up items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 shadow-elevated [animation-delay:450ms]">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient">
          <CheckCircle className="h-4 w-4 text-white" />
        </span>
        <div>
          <p className="text-xs font-bold">Booking Confirmed</p>
          <p className="text-[11px] text-muted-foreground">Advance Paid</p>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand-gradient opacity-15 blur-3xl" />

      <PageContainer className="relative grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-in-up text-center lg:text-left">
          <Badge
            variant="gradient"
            className="px-4 py-1 text-[11px] font-bold uppercase tracking-widest"
          >
            Premium Entertainment Marketplace
          </Badge>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
            Book the Perfect <span className="text-brand-gradient">Vibe</span> for your next event
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
            EventHub connects you with top-rated live bands, solo artists, and premium venues. Discover talent, book instantly, and pay securely with milestone protection.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
            <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
              <Link href={ROUTES.REGISTER}>Explore Marketplace</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setDemoOpen(true)}
            >
              <Play />
              Join as Artist/Venue
            </Button>
          </div>

          <dl className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl font-extrabold text-primary">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </dd>
                <dd className="mt-1 text-xs font-semibold text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroIllustration />
      </PageContainer>

      <WatchDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
}
