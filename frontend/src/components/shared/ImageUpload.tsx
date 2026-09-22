/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader as Spinner } from "@/components/ui/loader";
import toast from "react-hot-toast";
import { bandService } from "@/services/band";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  subfolder?: string;
}

function formatImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${apiBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export function ImageUpload({ value, onChange, onRemove, subfolder: _subfolder = "general" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);
  const [hasError, setHasError] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Clean up object URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  // Reset error state if value or localPreview changes
  React.useEffect(() => {
    setHasError(false);
  }, [value, localPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Standard validations
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must not exceed 5MB.");
      return;
    }

    // Instantly create local thumbnail preview for immediate display
    const objectUrl = URL.createObjectURL(file);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(objectUrl);
    setHasError(false);

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const url = await bandService.uploadFile(file);
      if (url) {
        onChange(url);
        toast.success("Image uploaded successfully!");
      } else {
        // Even if server doesn't return URL, keep the local preview so user sees their chosen image
        onChange(objectUrl);
      }
    } catch (err: any) {
      console.warn("Upload file error, using local preview:", err);
      // Keep local preview so user isn't stuck with empty or broken box
      onChange(objectUrl);
      toast.success("Image selected for preview");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    setHasError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  const displaySrc = localPreview || (value ? formatImageUrl(value) : "");

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {displaySrc && !hasError ? (
        <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-border bg-card flex items-center justify-center group shadow-md">
          <img
            src={displaySrc}
            alt="Preview thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              // If remote image fails, only flag error if no local preview
              if (!localPreview) {
                setHasError(true);
              }
            }}
          />

          {/* Uploading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
              <Spinner />
              <span className="text-xs font-semibold text-foreground">Uploading image...</span>
            </div>
          )}

          {/* Remove / Change buttons */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px] bg-background/80 hover:bg-background backdrop-blur-xs border-border"
              onClick={triggerSelect}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="rounded-full h-7 w-7 shadow-sm"
              onClick={handleRemove}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="w-full max-w-sm aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/40 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
          onClick={triggerSelect}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner />
              <p className="text-xs text-muted-foreground">Uploading image...</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-muted/60 rounded-full border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Click to upload image</p>
              <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP (Max 5MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
