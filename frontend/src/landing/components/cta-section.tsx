import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export function CtaSection() {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-border/70 bg-card/60">
      <PageContainer className="py-16 lg:py-24">
        <div className="group relative animate-fade-in-up overflow-hidden rounded-2xl bg-brand-gradient px-6 py-14 text-center shadow-elevated transition-transform duration-500 hover:scale-[1.01] sm:px-12 lg:py-20">
          <div
            className="absolute -left-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-white/15 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -right-16 h-72 w-72 animate-pulse rounded-full bg-white/10 blur-2xl [animation-duration:3.5s]"
            aria-hidden="true"
          />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85">
              Create your free account today and take control of your sports
              club in minutes.
            </p>
            <div className="mt-9 flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary shadow-elevated transition-transform duration-300 hover:scale-105 hover:bg-white/90"
              >
                <Link href={ROUTES.REGISTER}>
                  Create free account
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
