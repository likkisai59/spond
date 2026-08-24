import * as React from "react";
import { cn } from "@/utils/cn";

export type InputProps = React.ComponentProps<"input"> & {
  invalid?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          invalid && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        aria-invalid={invalid ? true : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
