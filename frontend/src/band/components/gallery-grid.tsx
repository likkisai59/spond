import { ImageIcon } from "lucide-react";
import { GALLERY_LABELS } from "@/data/band";
import { cn } from "@/utils/cn";

const TILE_STYLES = [
  "bg-brand-gradient",
  "bg-brand-gradient-soft",
  "bg-muted",
  "bg-primary/90",
  "bg-brand-gradient-soft",
  "bg-muted",
  "bg-brand-gradient",
  "bg-primary/90",
] as const;

export interface GalleryGridProps {
  labels?: string[];
  className?: string;
}

export function GalleryGrid({
  labels = GALLERY_LABELS,
  className,
}: GalleryGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {labels.map((label, index) => (
        <div
          key={`${label}-${index}`}
          className={cn(
            "relative flex aspect-video items-center justify-center overflow-hidden rounded-xl shadow-sm transition-transform duration-300 hover:scale-[1.02]",
            TILE_STYLES[index % TILE_STYLES.length]
          )}
        >
          <ImageIcon
            className={cn(
              "h-6 w-6",
              TILE_STYLES[index % TILE_STYLES.length] === "bg-brand-gradient" ||
                TILE_STYLES[index % TILE_STYLES.length] === "bg-primary/90"
                ? "text-white/70"
                : "text-accent"
            )}
          />
          <span className="absolute inset-x-2 bottom-2 truncate rounded-md bg-black/25 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
