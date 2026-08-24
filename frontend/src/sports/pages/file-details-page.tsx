"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  FileVideo,
  FolderOpen,
  HardDrive,
  Hash,
  ImageIcon,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import {
  selectAllGroups,
  selectFileById,
} from "@/store/sports/selectors";
import { downloadMockFile, formatFileSize } from "../components/file-utils";
import { formatDateTime } from "@/utils/date";
import { ROUTES } from "@/constants";
import type { FileType } from "@/types";
import { cn } from "@/utils/cn";

const TYPE_CONFIG: Record<
  FileType,
  { icon: LucideIcon; iconClass: string; previewClass: string; label: string }
> = {
  Image: {
    icon: ImageIcon,
    iconClass: "bg-emerald-100 text-emerald-700",
    previewClass: "bg-brand-gradient-soft",
    label: "Image preview (demo)",
  },
  Document: {
    icon: FileText,
    iconClass: "bg-sky-100 text-sky-700",
    previewClass: "bg-muted/60",
    label: "Document preview (demo)",
  },
  Spreadsheet: {
    icon: FileSpreadsheet,
    iconClass: "bg-amber-100 text-amber-700",
    previewClass: "bg-muted/60",
    label: "Spreadsheet preview (demo)",
  },
  PDF: {
    icon: FileText,
    iconClass: "bg-rose-100 text-rose-700",
    previewClass: "bg-rose-50 dark:bg-rose-950/30",
    label: "PDF preview (demo)",
  },
  Video: {
    icon: FileVideo,
    iconClass: "bg-violet-100 text-violet-700",
    previewClass: "bg-primary/95",
    label: "Video preview (demo)",
  },
};

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-accent" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="truncate text-sm font-bold">{children}</dd>
      </div>
    </div>
  );
}

export function FileDetailsPage() {
  const params = useParams<{ fileId: string }>();
  const dispatch = useAppDispatch();

  const file = useAppSelector((state) => selectFileById(state, params.fileId));
  const groups = useAppSelector(selectAllGroups);

  if (!file) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Files", href: ROUTES.SPORTS_FILES },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          title="File not found"
          description="This file may have been deleted or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_FILES}>Back to files</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const config = TYPE_CONFIG[file.type];
  const Icon = config.icon;
  const group = file.groupId
    ? groups.find((g) => g.id === file.groupId)
    : undefined;

  const handleDownload = () => {
    downloadMockFile(file);
    dispatch(
      notificationAdded({
        title: "Download started",
        message: `${file.name} is downloading (demo export).`,
        variant: "success",
      })
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/sports/files/${file.id}`
      );
    } catch {
      dispatch(
        notificationAdded({
          title: "Share link ready",
          message: `Share /sports/files/${file.id} from your browser address bar.`,
          variant: "info",
        })
      );
      return;
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
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Files", href: ROUTES.SPORTS_FILES },
          { label: file.name },
        ]}
        className="mb-4"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
            config.iconClass
          )}
        >
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-2xl font-extrabold tracking-tight lg:text-3xl"
            title={file.name}
          >
            {file.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{file.folder}</Badge>
            <Badge variant="outline">{file.type}</Badge>
            <span>{formatFileSize(file.sizeKb)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={handleShare}>
            <Share2 />
            Share
          </Button>
          <Button variant="accent" className="rounded-full" onClick={handleDownload}>
            <Download />
            Download
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2 animate-fade-in-up">
          <div
            className={cn(
              "relative flex aspect-video w-full flex-col items-center justify-center gap-4",
              config.previewClass
            )}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-elevated">
              <Icon className="h-10 w-10 text-accent" />
            </span>
            <p className="px-6 text-center text-sm font-semibold text-muted-foreground">
              {config.label}
            </p>
            {file.type === "Video" ? (
              <div className="absolute inset-x-6 bottom-5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                  <span className="block h-full w-1/3 rounded-full bg-white" />
                </div>
              </div>
            ) : null}
          </div>
          <p className="border-t border-border/70 px-5 py-3 text-xs font-semibold leading-relaxed text-muted-foreground">
            Demo mode — this preview is illustrative. Real file rendering
            arrives with storage integration.
          </p>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6 animate-fade-in-up [animation-delay:100ms]">
            <h2 className="text-base font-bold">Details</h2>
            <dl className="mt-4 space-y-3">
              <DetailRow icon={FolderOpen} label="Category">
                {file.folder}
              </DetailRow>
              <DetailRow icon={FileText} label="Type">
                {file.type}
              </DetailRow>
              <DetailRow icon={Users} label="Uploaded by">
                {file.uploadedBy}
              </DetailRow>
              <DetailRow icon={CalendarDays} label="Uploaded on">
                {formatDateTime(file.createdAt)}
              </DetailRow>
              <DetailRow icon={HardDrive} label="File size">
                {formatFileSize(file.sizeKb)}
              </DetailRow>
              {group ? (
                <DetailRow icon={FolderOpen} label="Group">
                  <Link
                    href={`${ROUTES.SPORTS_GROUPS}/${group.id}`}
                    className="transition-colors hover:text-accent"
                  >
                    {group.name}
                  </Link>
                </DetailRow>
              ) : null}
              <DetailRow icon={Hash} label="File ID">
                {file.id.toUpperCase()}
              </DetailRow>
            </dl>
          </Card>

          <Card className="p-5 animate-fade-in-up [animation-delay:200ms]">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href={ROUTES.SPORTS_FILES}>Back to files</Link>
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
