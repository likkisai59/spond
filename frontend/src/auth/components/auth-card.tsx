import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export interface AuthCardProps {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  footer,
  children,
  className,
}: AuthCardProps) {
  return (
    <Card className={cn("animate-fade-in-up p-6 sm:p-8", className)}>
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>

      {footer ? (
        <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
