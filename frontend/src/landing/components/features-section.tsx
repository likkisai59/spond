import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  Guitar,
  MapPin,
  MessageSquare,
  Mic,
  Star,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/shared/card";
import { SectionHeading } from "./section-heading";

interface FeatureItem {
  label: string;
  icon: LucideIcon;
}

const features: readonly FeatureItem[] = [
  { label: "Sports Events", icon: CalendarDays },
  { label: "Payments", icon: CreditCard },
  { label: "Messaging", icon: MessageSquare },
  { label: "Polls", icon: BarChart3 },
  { label: "Files", icon: FileText },
  { label: "Artists", icon: Mic },
  { label: "Bands", icon: Guitar },
  { label: "Venues", icon: MapPin },
  { label: "Bookings", icon: Ticket },
  { label: "Reviews", icon: Star },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24">
      <PageContainer className="py-16 lg:py-24">
        <SectionHeading
          eyebrow="Everything included"
          title="Packed with modules you'll love"
          description="From scheduling training sessions to booking the next gig — every tool lives under one roof."
          className="animate-fade-in-up"
        />

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {features.map((feature, index) => (
            <li key={feature.label} className="animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
              <Card
                interactive
                className="group flex h-full flex-col items-center gap-3 p-5 text-center sm:p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient-soft transition-colors duration-300 group-hover:bg-brand-gradient">
                  <feature.icon className="h-6 w-6 text-accent transition-colors duration-300 group-hover:text-white" />
                </span>
                <span className="text-sm font-bold leading-snug">
                  {feature.label}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
