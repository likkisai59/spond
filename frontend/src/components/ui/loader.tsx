import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const loaderSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
} as const;

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof loaderSizes;
  label?: string;
}

export function Loader({ className, size = "md", label, ...props }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-accent", loaderSizes[size])} />
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Loader size="lg" label={label} />
    </div>
  );
}
