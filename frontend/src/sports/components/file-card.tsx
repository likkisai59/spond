import {
  FileSpreadsheet,
  FileText,
  FileVideo,
  ImageIcon,
  File as FileIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/shared/card";
import { formatDate } from "@/utils/date";
import type { FileType } from "@/types";
import { cn } from "@/utils/cn";

const TYPE_CONFIG: Record<FileType, { icon: LucideIcon; className: string }> = {
  Image: { icon: ImageIcon, className: "bg-emerald-100 text-emerald-700" },
  Document: { icon: FileText, className: "bg-sky-100 text-sky-700" },
  Spreadsheet: {
    icon: FileSpreadsheet,
    className: "bg-amber-100 text-amber-700",
  },
  PDF: { icon: FileText, className: "bg-rose-100 text-rose-700" },
  Video: { icon: FileVideo, className: "bg-violet-100 text-violet-700" },
};

export interface FileCardProps {
  file: {
    id: string;
    name: string;
    type: FileType;
    sizeKb: number;
    folder: string;
    uploadedBy: string;
    createdAt: string;
  };
  className?: string;
}

function formatSize(sizeKb: number): string {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

export function FileCard({ file, className }: FileCardProps) {
  const config = TYPE_CONFIG[file.type];
  const Icon = config?.icon ?? FileIcon;

  return (
    <Card
      interactive
      className={cn("group flex h-full flex-col p-5 animate-fade-in-up", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            config?.className ?? "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {file.folder}
        </Badge>
      </div>

      <h3 className="mt-4 truncate text-sm font-bold" title={file.name}>
        {file.name}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatSize(file.sizeKb)} · {formatDate(file.createdAt)}
      </p>
      <p className="mt-auto pt-3 text-[11px] font-semibold text-muted-foreground">
        by {file.uploadedBy}
      </p>
    </Card>
  );
}
