import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly when creating an account, such as your full name, email address, role, telephone number, and venue specifications. We also collect usage statistics to optimize your sports and booking experiences.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
            <p>
              Your data is utilized solely to provide authentication, facilitate bookings between members and venue providers, deliver match notifications and attendance records, and ensure secure platform transactions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Data Protection & Security</h2>
            <p>
              We enforce industry-standard cryptographic protocols and access control procedures to secure your personal data against unauthorized disclosure, alteration, or theft.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. User Rights & Data Retention</h2>
            <p>
              You maintain the right to view, update, export, or request deletion of your personal account records at any time through your account settings or by contacting administrative support.
            </p>
          </section>
        </div>
      </Card>
    </PageContainer>
  );
}
