import { MousePointerClick, Rocket, UserPlus, type LucideIcon } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/shared/card";
import { SectionHeading } from "./section-heading";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: readonly Step[] = [
  {
    number: 1,
    title: "Create your account",
    description:
      "Sign up in seconds with one email and password. Your identity works across every product on the platform.",
    icon: UserPlus,
  },
  {
    number: 2,
    title: "Choose your product",
    description:
      "Step into the Sports Management suite, explore the BandConnect marketplace — or use both side by side.",
    icon: MousePointerClick,
  },
  {
    number: 3,
    title: "Start managing",
    description:
      "Organize teams, events, payments, bookings and reviews from a dashboard designed to feel effortless.",
    icon: Rocket,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-border/70 bg-card/60">
      <PageContainer className="py-16 lg:py-24">
        <SectionHeading
          title="Up and running in three steps"
          description="No complexity, no clutter — a guided start that gets you productive on day one."
          className="animate-fade-in-up"
        />

        <ol className="relative mx-auto mt-14 max-w-3xl space-y-8 lg:max-w-none lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          <span
            className="absolute left-7 top-4 bottom-4 w-px bg-gradient-to-b from-brand-gradient-start/40 via-brand-gradient-end/40 to-transparent lg:inset-x-16 lg:top-10 lg:bottom-auto lg:h-px lg:w-auto lg:bg-gradient-to-r"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <li
              key={step.number}
              className="relative flex animate-fade-in-up gap-6 lg:flex-col lg:items-center lg:text-center lg:gap-0"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="relative z-10 flex flex-col items-center lg:mb-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient shadow-elevated">
                  <step.icon className="h-6 w-6 text-white" />
                </span>
                <span className="mt-3 rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-primary-foreground">
                  Step {step.number}
                </span>
              </div>

              <Card className="flex-1 p-6 lg:mt-2">
                <h3 className="text-lg font-extrabold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
