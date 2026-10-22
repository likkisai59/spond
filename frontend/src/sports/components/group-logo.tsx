"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/helpers";
import { cn } from "@/utils/cn";

export interface GroupLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  roundedClassName?: string;
}

const SIZE_MAP = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl font-extrabold",
};

export function GroupLogo({
  name,
  logoUrl,
  size = "md",
  className,
  roundedClassName = "rounded-2xl",
}: GroupLogoProps) {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <Avatar
      className={cn(
        "shrink-0 border border-border/50 shadow-sm transition-transform duration-200",
        sizeClasses,
        roundedClassName,
        className
      )}
    >
      {logoUrl ? (
        <AvatarImage
          src={logoUrl}
          alt={name}
          className={cn("object-cover", roundedClassName)}
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-brand-gradient font-bold text-white uppercase",
          roundedClassName
        )}
      >
        {getInitials(name || "Sports Group")}
      </AvatarFallback>
    </Avatar>
  );
}
