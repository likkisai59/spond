"use client";

import Link from "next/link";
import { Download, Info, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ROUTES } from "@/constants";
import type { SportsFile } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatFileSize } from "./file-utils";

export interface FileDetailsDrawerProps {
  file: SportsFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (file: SportsFile) => void;
  onDelete: (file: SportsFile) => void;
}

export function FileDetailsDrawer({
  file,
  open,
  onOpenChange,
  onDownload,
  onDelete,
}: FileDetailsDrawerProps) {
  if (!file) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="flex flex-col gap-0">
        <DrawerHeader className="border-b border-border/70 p-6">
          <DrawerTitle className="pr-8">{file.name}</DrawerTitle>
          <DrawerDescription>
            File details, download and management options.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{file.folder}</Badge>
            <Badge variant="gradient">{file.type}</Badge>
          </div>

          <dl className="space-y-4">
            <DetailRow
              icon={Info}
              label="File type"
              value={`${file.type} file`}
            />
            <DetailRow
              icon={Download}
              label="Size"
              value={formatFileSize(file.sizeKb)}
            />
            <DetailRow
              icon={Info}
              label="Folder"
              value={file.folder}
            />
            <DetailRow
              icon={User}
              label="Uploaded by"
              value={file.uploadedBy}
            />
            <DetailRow
              icon={Info}
              label="Uploaded on"
              value={formatDateTime(file.createdAt)}
            />
            <DetailRow
              icon={Info}
              label="File ID"
              value={file.id.toUpperCase()}
            />
          </dl>

          <p className="rounded-xl bg-brand-gradient-soft px-4 py-3 text-xs font-semibold leading-relaxed text-accent">
            Demo mode — files are mock data. Downloads export a text summary
            instead of the real file.
          </p>
        </div>

        <DrawerFooter className="flex-row gap-2.5 border-t border-border/70 p-4 sm:justify-end">
          <Button asChild variant="ghost" className="rounded-full">
            <Link href={`${ROUTES.SPORTS_FILES}/${file.id}`}>
              Open full page
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onDelete(file)}
          >
            <Trash2 />
            Delete
          </Button>
          <Button
            variant="accent"
            className="rounded-full"
            onClick={() => onDownload(file)}
          >
            <Download />
            Download
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Info;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-accent" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="truncate text-sm font-bold">{value}</dd>
      </div>
    </div>
  );
}
