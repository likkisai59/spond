import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <PageContainer className="max-w-4xl py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/register">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to registration
          </Link>
        </Button>
      </div>

      <Card className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or registering for an account on this platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using our services immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. User Accounts & Responsibilities</h2>
            <p>
              When creating an account, you must provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted through your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Venues, Bookings & Payments</h2>
            <p>
              All venue listings, court reservations, and group events booked via our services are subject to availability and the specific operating rules of each venue partner. Milestone payments and cancellations must adhere to the platform&apos;s established payment schedules and cancellation guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Community Code of Conduct</h2>
            <p>
              We are committed to maintaining a safe, welcoming, and inclusive community for sports teams, members, and venue organizers. Harassment, unauthorized access, fraudulent activities, and violations of fair play standards are strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Termination & Modifications</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. We may revise these terms periodically, and your continued usage after changes constitutes acceptance.
            </p>
          </section>
        </div>
      </Card>
    </PageContainer>
  );
}
