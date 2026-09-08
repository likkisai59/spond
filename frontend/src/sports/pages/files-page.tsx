"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Clock, FolderOpen, Search, SearchX, UploadCloud } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { filesAdded, fileRemoved } from "@/store/sports/files-slice";
import { selectAllFiles, selectRecentFiles } from "@/store/sports/selectors";
import { FileCardWithActions } from "../components/file-card-with-actions";
import { downloadMockFile } from "../components/file-utils";

const FilePreviewModal = dynamic(
  () =>
    import("../components/file-preview-modal").then((m) => m.FilePreviewModal),
  { ssr: false, loading: () => null }
);
const FileDetailsDrawer = dynamic(
  () =>
    import("../components/file-details-drawer").then((m) => m.FileDetailsDrawer),
  { ssr: false, loading: () => null }
);
const ConfirmationModal = dynamic(
  () =>
    import("@/components/modals/confirmation-modal").then(
      (m) => m.ConfirmationModal
    ),
  { ssr: false, loading: () => null }
);
import { FILE_FOLDERS } from "../mocks/files.mock";
import type { FileType, SportsFile } from "@/types";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";
import { filesService } from "@/services/sports";

function guessFileType(fileName: string): FileType {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension))
    return "Image";
  if (["pdf"].includes(extension)) return "PDF";
  if (["xls", "xlsx", "csv"].includes(extension)) return "Spreadsheet";
  if (["mp4", "mov", "avi", "webm"].includes(extension)) return "Video";
  return "Document";
}

export function FilesPage() {
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectAllFiles);
  const recentFiles = useAppSelector(selectRecentFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("All");
  const [previewFile, setPreviewFile] = useState<SportsFile | null>(null);
  const [detailsFile, setDetailsFile] = useState<SportsFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<SportsFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const filteredFiles = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return files.filter((file) => {
      const matchesFolder = folder === "All" || file.folder === folder;
      const matchesQuery =
        query.length === 0 ||
        file.name.toLowerCase().includes(query) ||
        file.uploadedBy.toLowerCase().includes(query);
      return matchesFolder && matchesQuery;
    });
  }, [files, folder, debouncedSearch]);

  const handleUploadClick = () => inputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    // 10 MB limit (10 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const hasLargeFile = selected.some((file) => file.size > MAX_FILE_SIZE);
    if (hasLargeFile) {
      setFileError("Max file size of 10 MB is allowed.");
      event.target.value = "";
      return;
    }
    setFileError(null);

    for (const file of selected) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("module", "sports");
        formData.append("module_id", folder === "All" ? "general" : folder.toLowerCase());
        await filesService.upload(formData);
      } catch (err) {
        console.warn("Backend file upload error (falling back to local):", err);
      }
    }

    dispatch(
      filesAdded(
        selected.map((file) => ({
          name: file.name,
          type: guessFileType(file.name),
          folder: folder === "All" ? "Training" : (folder as any),
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
        }))
      )
    );
    dispatch(
      notificationAdded({
        title: `${selected.length} file${selected.length > 1 ? "s" : ""} uploaded`,
        message: `Files were uploaded to ${folder === "All" ? "Training" : folder} folder.`,
        variant: "success",
      })
    );
    event.target.value = "";
  };

  const handleDownload = (file: SportsFile) => {
    downloadMockFile(file);
    dispatch(
      notificationAdded({
        title: "Download started",
        message: `${file.name} is downloading (demo export).`,
        variant: "success",
      })
    );
  };

  const handleDeleteRequest = (file: SportsFile) => {
    setPreviewFile(null);
    setDetailsFile(null);
    setDeleteFile(file);
  };

  const handleDeleteConfirm = () => {
    if (!deleteFile) return;
    dispatch(fileRemoved(deleteFile.id));
    dispatch(
      notificationAdded({
        title: "File deleted",
        message: `${deleteFile.name} was removed (demo mode).`,
        variant: "info",
      })
    );
    setDeleteFile(null);
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Files" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Files"
        description="Documents, drills, budgets and media shared across your groups."
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={handleUploadClick}
        className="mt-6 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-card px-4 py-10 transition-all hover:border-accent/50 hover:bg-brand-gradient-soft sm:py-12 animate-fade-in-up"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient shadow-elevated">
          <UploadCloud className="h-7 w-7 text-white" />
        </span>
        <span className="text-sm font-bold">Upload files</span>
        <span className="text-xs text-muted-foreground">
          Click to browse — images, documents, spreadsheets and videos
        </span>
      </button>

      {fileError && (
        <p className="mt-2 text-center text-xs sm:text-sm font-semibold text-destructive animate-fade-in">
          ⚠️ {fileError}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILE_FOLDERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFolder(item)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                folder === item
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/70 text-muted-foreground hover:text-foreground"
              )}
            >
              {item === "All" ? <FolderOpen className="h-3.5 w-3.5" /> : null}
              {item}
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search files…"
            className="pl-9"
            aria-label="Search files"
          />
        </div>
      </div>

      {folder === "All" && debouncedSearch.length === 0 ? (
        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Clock className="h-4 w-4 text-accent" />
            Recent files
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recentFiles.map((file) => (
              <FileCardWithActions
                key={file.id}
                file={file}
                onPreview={setPreviewFile}
                onDetails={setDetailsFile}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight">
          {folder === "All" ? "All files" : folder}
        </h2>
        {filteredFiles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredFiles.map((file) => (
              <FileCardWithActions
                key={file.id}
                file={file}
                onPreview={setPreviewFile}
                onDetails={setDetailsFile}
              />
             ))}
           </div>
        ) : (
           <EmptyCard
            icon={SearchX}
            title="No files found"
            description="Upload files or adjust the search and folder filters."
            action={
              <Button variant="accent" onClick={handleUploadClick}>
                <UploadCloud />
                Upload files
              </Button>
            }
           />
         )}
       </section>

      <FilePreviewModal
        file={previewFile}
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
        onDownload={handleDownload}
        onDelete={handleDeleteRequest}
      />

      <FileDetailsDrawer
        file={detailsFile}
        open={detailsFile !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsFile(null);
        }}
        onDownload={handleDownload}
        onDelete={handleDeleteRequest}
      />

      <ConfirmationModal
        open={deleteFile !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteFile(null);
        }}
        title="Delete file"
        description={`"${deleteFile?.name ?? ""}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}
