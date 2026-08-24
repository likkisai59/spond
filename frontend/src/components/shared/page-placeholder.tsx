import { Construction } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import type { BreadcrumbItem } from "@/types";

export interface PagePlaceholderProps {
  title: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PagePlaceholder({
  title,
  description,
  breadcrumbItems,
  actions,
  children,
}: PagePlaceholderProps) {
  return (
    <PageContainer as="main">
      {breadcrumbItems?.length ? (
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
      ) : null}
      <PageHeader title={title} description={description} actions={actions} />
      <div className="mt-8">
        {children ?? (
          <EmptyCard
            icon={Construction}
            title="Module coming soon"
            description="This area is reserved and will be implemented by an upcoming feature engine."
          />
        )}
      </div>
    </PageContainer>
  );
}
