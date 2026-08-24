"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import {
  querySet,
  recentSearchAdded,
} from "@/store/band/marketplace-slice";
import { cn } from "@/utils/cn";

export interface MarketplaceSearchProps {
  defaultQuery?: string;
  placeholder?: string;
  size?: "default" | "lg";
  className?: string;
}

export function MarketplaceSearch({
  defaultQuery = "",
  placeholder = "Search artists, bands and venues…",
  size = "default",
  className,
}: MarketplaceSearchProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [value, setValue] = useState(defaultQuery);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = value.trim();
    if (term.length === 0) {
      router.push("/band/search");
      return;
    }
    dispatch(querySet(term));
    dispatch(recentSearchAdded(term));
    router.push(`/band/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn("flex w-full gap-2", className)}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label="Search the marketplace"
          className={cn(
            "rounded-full bg-card pl-10",
            size === "lg" ? "h-12 text-base" : ""
          )}
        />
      </div>
      <Button
        type="submit"
        variant="accent"
        className={cn("shrink-0 rounded-full", size === "lg" ? "h-12 px-7" : "")}
      >
        Search
      </Button>
    </form>
  );
}
