"use client";

import {
  Download,
  FileSpreadsheet,
  FileText,
  FileVideo,
  ImageIcon,
  Share2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import type { FileType, SportsFile } from "@/types";
import { formatDateTime } from "@/utils/date";
import { formatFileSize } from "./file-utils";
import { cn } from "@/utils/cn";

const TYPE_ICONS: Record<FileType, typeof ImageIcon> = {
  Image: ImageIcon,
  Document: FileText,
  Spreadsheet: FileSpreadsheet,
  PDF: FileText,
  Video: FileVideo,
};

export interface FilePreviewModalProps {
  file: SportsFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (file: SportsFile) => void;
  onDelete: (file: SportsFile) => void;
}

export function FilePreviewModal({
  file,
  open,
  onOpenChange,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  const dispatch = useAppDispatch();

  if (!file) return null;
  const Icon = TYPE_ICONS[file.type];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/sports/files?file=${file.id}`
      );
    } catch {
      // clipboard unavailable — still confirm in demo mode
    }
    dispatch(
      notificationAdded({
        title: "Share link copied",
        message: `A link to ${file.name} was copied to your clipboard.`,
        variant: "success",
      })
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="truncate pr-8">{file.name}</ModalTitle>
          <ModalDescription>
            {file.type} · {formatFileSize(file.sizeKb)} · uploaded by{" "}
            {file.uploadedBy}
          </ModalDescription>
        </ModalHeader>

        <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/40">
          <div
            className={cn(
              "relative flex aspect-video w-full flex-col items-center justify-center gap-4",
              file.type === "Image" && "bg-brand-gradient-soft",
              file.type === "Video" && "bg-primary/95",
              file.type === "PDF" && "bg-rose-50 dark:bg-rose-950/30",
              (file.type === "Document" || file.type === "Spreadsheet") &&
                "bg-muted/60"
            )}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-elevated">
              <Icon className="h-10 w-10 text-accent" />
            </span>
            <p className="px-6 text-center text-sm font-semibold text-muted-foreground">
              {file.type === "Image"
                ? "Image preview (demo)"
                : file.type === "Video"
                  ? "Video preview (demo)"
                  : `${file.type} preview (demo)`}
            </p>
            {file.type === "Video" ? (
              <div className="absolute inset-x-6 bottom-5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                  <span className="block h-full w-1/3 rounded-full bg-white" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-border/70 px-4 py-3">
            <Badge variant="secondary">{file.folder}</Badge>
            <Badge variant="outline">{file.type}</Badge>
            <span className="ml-auto text-xs text-muted-foreground">
              Uploaded {formatDateTime(file.createdAt)}
            </span>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => onDelete(file)}>
            <Trash2 />
            Delete
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 />
            Share
          </Button>
          <Button variant="accent" onClick={() => onDownload(file)}>
            <Download />
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
