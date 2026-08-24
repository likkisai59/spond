import { Activity, ShieldCheck, Users } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard, StatCard } from "@/components/cards";
import { ROUTES } from "@/constants";

export function AdminDashboardPage() {
  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Admin Panel" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Admin Dashboard"
        description="Platform-wide oversight for users, products and configuration."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value="—" icon={Users} />
        <StatCard label="Active sessions" value="—" icon={Activity} />
        <StatCard label="System health" value="—" icon={ShieldCheck} />
      </div>

      <div className="mt-6">
        <EmptyCard
          title="Admin modules arrive soon"
          description="User management, product configuration and audit tooling will be delivered by the Admin feature engine."
        />
      </div>
    </PageContainer>
  );
}
