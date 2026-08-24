"use client";

import { Eye, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SportsFile } from "@/types";
import { FileCard } from "./file-card";

export interface FileCardWithActionsProps {
  file: SportsFile;
  onPreview: (file: SportsFile) => void;
  onDetails: (file: SportsFile) => void;
  className?: string;
}

export function FileCardWithActions({
  file,
  onPreview,
  onDetails,
  className,
}: FileCardWithActionsProps) {
  return (
    <div className={className}>
      <div className="group relative h-full">
        <FileCard file={file} className="h-full" />
        <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm"
            onClick={() => onPreview(file)}
            aria-label={`Preview ${file.name}`}
          >
            <Eye />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm"
            onClick={() => onDetails(file)}
            aria-label={`Details of ${file.name}`}
          >
            <Info />
          </Button>
        </div>
      </div>
    </div>
  );
}
