import { cn } from "@/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({
  className,
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-card text-card-foreground shadow-card",
        interactive &&
          "transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-elevated",
        className
      )}
      {...props}
    />
  );
}
