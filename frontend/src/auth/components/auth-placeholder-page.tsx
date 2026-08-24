import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { InfoCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { ROUTES } from "@/constants";

export interface AuthPlaceholderPageProps {
  title: string;
  description: string;
  note: string;
}

export function AuthPlaceholderPage({
  title,
  description,
  note,
}: AuthPlaceholderPageProps) {
  return (
    <Card className="p-6 sm:p-8">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: title },
        ]}
        className="mb-6 justify-center [&_ol]:justify-center"
      />

      <div className="space-y-2 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient-soft">
          <KeyRound className="h-6 w-6 text-accent" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-8">
        <InfoCard title="Foundation placeholder" description={note} />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button asChild variant="accent" size="lg">
          <Link href={ROUTES.SELECT_PRODUCT}>Continue to product selection</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={ROUTES.HOME}>Back to home</Link>
        </Button>
      </div>
    </Card>
  );
}
