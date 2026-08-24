import { cn } from "@/utils/cn";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "main" | "section";
  maxWidth?: "default" | "wide" | "full";
}

const maxWidths = {
  default: "max-w-7xl",
  wide: "max-w-[1440px]",
  full: "max-w-none",
} as const;

export function PageContainer({
  as: Comp = "div",
  maxWidth = "default",
  className,
  ...props
}: PageContainerProps) {
  return (
    <Comp
      id={Comp === "main" ? "main-content" : undefined}
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        maxWidths[maxWidth],
        className
      )}
      {...props}
    />
  );
}
