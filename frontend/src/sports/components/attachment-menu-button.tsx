"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  FileVideo,
  ImageIcon,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectFiles } from "@/store/selectors";
import type { FileType } from "@/types";
import { formatFileSize } from "./file-utils";

const TYPE_ICONS: Record<FileType, typeof ImageIcon> = {
  Image: ImageIcon,
  Document: FileText,
  Spreadsheet: FileSpreadsheet,
  PDF: FileText,
  Video: FileVideo,
};

export interface AttachmentMenuButtonProps {
  onAttach: (fileName: string) => void;
  onUploadClick: () => void;
}

export function AttachmentMenuButton({
  onAttach,
  onUploadClick,
}: AttachmentMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const files = useAppSelector(selectFiles);
  const recentFiles = files.slice(0, 4);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const handleAttach = (fileName: string) => {
    onAttach(fileName);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen((current) => !current)}
        aria-label="Attach a file"
        aria-expanded={open}
      >
        <Paperclip />
      </Button>

      {open ? (
        <div className="absolute bottom-full left-0 z-40 mb-2 w-72 animate-fade-in-up rounded-xl border border-border/70 bg-card p-3 shadow-elevated">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Attach a recent file
          </p>
          <ul className="space-y-1">
            {recentFiles.map((file) => {
              const Icon = TYPE_ICONS[file.type];
              return (
                <li key={file.id}>
                  <button
                    type="button"
                    onClick={() => handleAttach(file.name)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient-soft">
                      <Icon className="h-4 w-4 text-accent" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">
                        {file.name}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {formatFileSize(file.sizeKb)} · {file.folder}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 border-t border-border/70 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onUploadClick();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <UploadCloud className="h-4 w-4 text-muted-foreground" />
              </span>
              <span className="text-xs font-bold">Upload from device…</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
