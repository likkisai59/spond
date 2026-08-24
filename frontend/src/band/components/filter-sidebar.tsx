"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { filterSet, filtersReset } from "@/store/band/marketplace-slice";
import { selectMarketplaceFilters } from "@/store/band/selectors";
import { BAND_GENRES } from "@/types";
import { MOCK_ARTISTS, MOCK_BANDS, MOCK_VENUES } from "@/band/mocks/band.mock";
import { cn } from "@/utils/cn";

const RATING_OPTIONS = [
  { label: "Any rating", value: "0" },
  { label: "4.5+ stars", value: "4.5" },
  { label: "4.7+ stars", value: "4.7" },
  { label: "4.8+ stars", value: "4.8" },
] as const;

const PRICE_OPTIONS = [
  { label: "Any price", value: "0" },
  { label: "Under ₹25,000", value: "25000" },
  { label: "Under ₹50,000", value: "50000" },
  { label: "Under ₹100,000", value: "100000" },
] as const;

const SETTING_OPTIONS = [
  { label: "Indoor & outdoor", value: "all" },
  { label: "Indoor", value: "Indoor" },
  { label: "Outdoor", value: "Outdoor" },
] as const;

const CAPACITY_OPTIONS = [
  { label: "Any capacity", value: "0" },
  { label: "200+", value: "200" },
  { label: "500+", value: "500" },
  { label: "1,000+", value: "1000" },
] as const;

const AVAILABILITY_OPTIONS = [
  { label: "Any availability", value: "all" },
  { label: "Available", value: "Available" },
  { label: "Limited", value: "Limited" },
  { label: "Booked", value: "Booked" },
] as const;

export interface FilterSidebarProps {
  className?: string;
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectMarketplaceFilters);

  const cities = Array.from(
    new Set([
      ...MOCK_ARTISTS.map((a) => a.location.split(",")[0]),
      ...MOCK_BANDS.map((b) => b.location.split(",")[0]),
      ...MOCK_VENUES.map((v) => v.city),
    ])
  ).sort();

  return (
    <aside className={cn("space-y-5", className)} aria-label="Marketplace filters">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          Filters
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-full px-2.5 text-xs"
          onClick={() => dispatch(filtersReset())}
        >
          <RotateCcw />
          Reset
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border border-border/70 bg-card p-4 shadow-card">
        <FilterSelect
          label="Genre"
          value={filters.genre}
          options={[
            { label: "All genres", value: "all" },
            ...BAND_GENRES.map((g) => ({ label: g, value: g })),
          ]}
          onChange={(value) => dispatch(filterSet({ key: "genre", value }))}
        />
        <FilterSelect
          label="City"
          value={filters.city}
          options={[
            { label: "All cities", value: "all" },
            ...cities.map((c) => ({ label: c, value: c })),
          ]}
          onChange={(value) => dispatch(filterSet({ key: "city", value }))}
        />
        <FilterSelect
          label="Minimum rating"
          value={String(filters.minRating)}
          options={RATING_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          onChange={(value) =>
            dispatch(filterSet({ key: "minRating", value: Number(value) }))
          }
        />
        <FilterSelect
          label="Price range"
          value={String(filters.priceMax)}
          options={PRICE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          onChange={(value) =>
            dispatch(filterSet({ key: "priceMax", value: Number(value) }))
          }
        />
        <FilterSelect
          label="Venue setting"
          value={filters.setting}
          options={SETTING_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          onChange={(value) => dispatch(filterSet({ key: "setting", value }))}
        />
        <FilterSelect
          label="Venue capacity"
          value={String(filters.capacityMin)}
          options={CAPACITY_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          onChange={(value) =>
            dispatch(filterSet({ key: "capacityMin", value: Number(value) }))
          }
        />
        <FilterSelect
          label="Availability"
          value={filters.availability}
          options={AVAILABILITY_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          onChange={(value) =>
            dispatch(filterSet({ key: "availability", value }))
          }
        />
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
