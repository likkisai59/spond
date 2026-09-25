import { Star } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/shared/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "./section-heading";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
}

const testimonials: readonly Testimonial[] = [
  {
    name: "Alex Morgan",
    role: "Head Coach · Strikers FC",
    quote:
      "Scheduling, payments and team chat finally live in one place. Our admin workload dropped by half in the first month.",
    initials: "AM",
  },
  {
    name: "Priya Sharma",
    role: "Event Manager · LiveWire",
    quote:
      "Booking bands used to mean a dozen spreadsheets. BandConnect turned it into a few clicks — with reviews we can trust.",
    initials: "PS",
  },
  {
    name: "Daniel Kim",
    role: "Manager · The Echoes",
    quote:
      "Our profile, availability and payments are always in sync. We landed three venue gigs in the first two weeks.",
    initials: "DK",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-24">
      <PageContainer className="py-16 lg:py-24">
        <SectionHeading
          title="What our early users say"
          description="Clubs, venues, artists and managers are already building their worlds on Unify."
          className="animate-fade-in-up"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              interactive
              className="flex animate-fade-in-up flex-col p-6 sm:p-7"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="h-4 w-4 fill-current text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                “{testimonial.quote}”
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                <Avatar className="h-11 w-11">
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
