"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { VideoUpload } from "@/components/shared/VideoUpload";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Star,
  Save,
  Youtube
} from "lucide-react";
import toast from "react-hot-toast";

export interface BaseGalleryItem {
  url: string;
  is_cover: boolean;
  album: string;
}

export interface BaseVideoItem {
  url: string;
  category: string;
  type?: string;
  thumbnail?: string;
}

export interface ProviderMediaGalleryProps<
  TGallery extends BaseGalleryItem = BaseGalleryItem,
  TVideo extends BaseVideoItem = BaseVideoItem
> {
  title: string;
  subtitle: string;
  albums: string[];
  videoCategories: string[];
  uploadSubfolder: string; // e.g. "artists" or "venues"
  videoSectionTitle?: string;
  videoSectionSubtitle?: string;
  videoUploadHint?: string;

  initialGallery?: TGallery[];
  initialVideos?: TVideo[];
  initialYoutubeLinks?: string[];

  // Dedicated cover image option (e.g. for venues)
  showDedicatedCover?: boolean;
  initialCoverImage?: string | null;

  onSave: (data: {
    gallery: TGallery[];
    videos: TVideo[];
    youtubeLinks: string[];
    coverImage?: string | null;
  }) => Promise<void>;

  extraSections?: React.ReactNode;
}

export function ProviderMediaGallery<
  TGallery extends BaseGalleryItem = BaseGalleryItem,
  TVideo extends BaseVideoItem = BaseVideoItem
>({
  title,
  subtitle,
  albums,
  videoCategories,
  uploadSubfolder,
  videoSectionTitle = "Upload Videos",
  videoSectionSubtitle = "Upload video files to showcase your work.",
  videoUploadHint = "Choose a video file. Max file size: 20MB. High resolution MP4 preferred.",
  initialGallery = [],
  initialVideos = [],
  initialYoutubeLinks = [],
  showDedicatedCover = false,
  initialCoverImage = null,
  onSave,
  extraSections
}: ProviderMediaGalleryProps<TGallery, TVideo>) {
  const [coverImage, setCoverImage] = React.useState<string | null>(initialCoverImage);
  const [gallery, setGallery] = React.useState<TGallery[]>(initialGallery);
  const [videos, setVideos] = React.useState<TVideo[]>(initialVideos);
  const [youtubeLinks, setYoutubeLinks] = React.useState<string[]>(initialYoutubeLinks);

  const [saving, setSaving] = React.useState(false);
  const [newAlbumName, setNewAlbumName] = React.useState(albums[0] || "General");
  const [newYoutubeUrl, setNewYoutubeUrl] = React.useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        gallery,
        videos,
        youtubeLinks,
        coverImage
      });
    } catch {
      toast.error("Failed to save media changes.");
    } finally {
      setSaving(false);
    }
  };

  // Gallery methods
  const addImageToGallery = (url: string) => {
    if (!url) return;
    const shouldBeCover = gallery.length === 0 && (!showDedicatedCover || !coverImage);
    const newItem = {
      url,
      is_cover: shouldBeCover,
      album: newAlbumName
    } as TGallery;

    setGallery(prev => [...prev, newItem]);
    if (showDedicatedCover && gallery.length === 0 && !coverImage) {
      setCoverImage(url);
    }
  };

  const removeImage = (idx: number) => {
    setGallery(prev => {
      const current = [...prev];
      const wasCover = current[idx]?.is_cover;
      current.splice(idx, 1);

      if (wasCover && current.length > 0) {
        current[0].is_cover = true;
        if (showDedicatedCover) setCoverImage(current[0].url);
      } else if (current.length === 0 && showDedicatedCover) {
        setCoverImage(null);
      }
      return current;
    });
  };

  const setAsCover = (idx: number) => {
    setGallery(prev =>
      prev.map((item, i) => ({
        ...item,
        is_cover: i === idx
      }))
    );
    if (showDedicatedCover && gallery[idx]) {
      setCoverImage(gallery[idx].url);
    }
    toast.success("Cover image updated!");
  };

  const moveImage = (idx: number, direction: "left" | "right") => {
    setGallery(prev => {
      const current = [...prev];
      const targetIdx = direction === "left" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= current.length) return prev;

      const temp = current[idx];
      current[idx] = current[targetIdx];
      current[targetIdx] = temp;
      return current;
    });
  };

  const handleAlbumChange = (idx: number, album: string) => {
    setGallery(prev =>
      prev.map((item, i) => (i === idx ? { ...item, album } : item))
    );
  };

  // Video File methods
  const addVideoFile = (url: string) => {
    if (!url) return;
    const newItem = {
      url,
      type: "file",
      category: videoCategories[0] || "General",
      thumbnail: ""
    } as unknown as TVideo;
    setVideos(prev => [...prev, newItem]);
  };

  const removeVideoFile = (idx: number) => {
    setVideos(prev => {
      const current = [...prev];
      current.splice(idx, 1);
      return current;
    });
  };

  const handleVideoCategoryChange = (idx: number, category: string) => {
    setVideos(prev =>
      prev.map((item, i) => (i === idx ? { ...item, category } : item))
    );
  };

  // YouTube Links methods
  const addYoutube = () => {
    if (!newYoutubeUrl.trim()) return;
    if (!newYoutubeUrl.includes("youtube.com") && !newYoutubeUrl.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube video link.");
      return;
    }
    setYoutubeLinks(prev => [...prev, newYoutubeUrl.trim()]);
    setNewYoutubeUrl("");
    toast.success("YouTube link added!");
  };

  const removeYoutube = (idx: number) => {
    setYoutubeLinks(prev => {
      const current = [...prev];
      current.splice(idx, 1);
      return current;
    });
  };

  return (
    <div className="space-y-8 bg-card/45 backdrop-blur-md border border-border p-6 md:p-8 rounded-3xl shadow-xl">
      {/* Title */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 px-6 flex items-center gap-1.5 self-start sm:self-center"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Media..." : "Save Media Configuration"}</span>
        </Button>
      </div>

      {/* OPTIONAL DEDICATED COVER BANNER SECTION */}
      {showDedicatedCover && (
        <div className="space-y-4">
          <Label className="text-sm font-bold text-foreground">Cover Banner Image</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-4 border border-border bg-accent/15 rounded-2xl">
            <div className="md:col-span-2">
              {coverImage ? (
                <div className="aspect-video w-full max-w-md relative rounded-xl overflow-hidden border border-border">
                  <Image src={coverImage} alt="Cover Banner" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video w-full max-w-md bg-accent/40 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-xs italic">
                  No cover banner selected. Upload gallery photos and mark one as cover or upload below.
                </div>
              )}
            </div>
            <ImageUpload
              onChange={url => setCoverImage(url)}
              subfolder={`${uploadSubfolder}/covers`}
            />
          </div>
        </div>
      )}

      {/* GALLERY PHOTOS SECTION */}
      <div className={`space-y-4 ${showDedicatedCover ? "pt-4 border-t border-border" : ""}`}>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Photo Gallery Albums
          </h3>
          <p className="text-xs text-muted-foreground">Upload images and classify them into respective albums.</p>
        </div>

        {/* Upload layout widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end p-4 border border-border bg-accent/15 rounded-2xl">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Select Album to upload into</Label>
            <select
              value={newAlbumName}
              onChange={e => setNewAlbumName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-xs"
            >
              {albums.map(al => (
                <option key={al} value={al}>
                  {al}
                </option>
              ))}
            </select>
          </div>
          <ImageUpload
            onChange={addImageToGallery}
            subfolder={`${uploadSubfolder}/gallery`}
          />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {gallery.map((item, idx) => (
            <div
              key={idx}
              className="border border-border rounded-2xl overflow-hidden bg-card/85 flex flex-col group relative"
            >
              <div className="aspect-video w-full relative bg-accent/40 flex items-center justify-center border-b border-border">
                <Image src={item.url} alt="Gallery item" fill className="object-cover" />
                {item.is_cover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary text-primary-foreground flex items-center gap-1 shadow-sm border border-primary-light">
                    <Star className="h-3 w-3 fill-current" /> Cover Image
                  </span>
                )}

                {/* Delete button top right */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Album & Order actions */}
              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Album Category</span>
                  <select
                    value={item.album}
                    onChange={e => handleAlbumChange(idx, e.target.value)}
                    className="w-full h-8 px-2 rounded border border-border bg-accent text-foreground text-[10px]"
                  >
                    {albums.map(al => (
                      <option key={al} value={al}>
                        {al}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, "left")}
                      className="h-7 w-7"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={idx === gallery.length - 1}
                      onClick={() => moveImage(idx, "right")}
                      className="h-7 w-7"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {!item.is_cover && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAsCover(idx)}
                      className="h-7 text-[9px] font-bold"
                    >
                      Set Cover
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {gallery.length === 0 && (
            <div className="sm:col-span-2 md:col-span-4 py-12 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-2xl">
              No photos added to gallery yet.
            </div>
          )}
        </div>
      </div>

      {/* VIDEOS SECTION */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <VideoIcon className="h-5 w-5 text-primary" />
            {videoSectionTitle}
          </h3>
          <p className="text-xs text-muted-foreground">{videoSectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 border border-border bg-accent/15 rounded-2xl">
          <p className="text-xs text-muted-foreground md:col-span-2 leading-relaxed">
            {videoUploadHint}
          </p>
          <VideoUpload
            onChange={addVideoFile}
            subfolder={`${uploadSubfolder}/videos`}
          />
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {videos.map((v, idx) => (
            <div
              key={idx}
              className="border border-border rounded-2xl overflow-hidden bg-card/85 flex flex-col group relative"
            >
              <div className="aspect-video w-full relative bg-accent/40 border-b border-border flex items-center justify-center">
                <video src={v.url} controls className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeVideoFile(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-3">
                <span className="text-[9px] uppercase font-bold text-muted-foreground">Video Category tag</span>
                <select
                  value={v.category}
                  onChange={e => handleVideoCategoryChange(idx, e.target.value)}
                  className="w-full h-8 px-2 mt-1 rounded border border-border bg-accent text-foreground text-[10px]"
                >
                  {videoCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YOUTUBE SECTION */}
      <div className="pt-4 border-t border-border">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              YouTube Video Embeds
            </h3>
            <p className="text-xs text-muted-foreground">Embed showcase links from your YouTube channel.</p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={newYoutubeUrl}
              onChange={e => setNewYoutubeUrl(e.target.value)}
            />
            <Button
              type="button"
              onClick={addYoutube}
              className="h-10 px-4 bg-primary text-primary-foreground shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {youtubeLinks.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-accent/20 hover:border-primary/30 transition-colors"
              >
                <span className="text-xs text-foreground truncate max-w-[280px]">{link}</span>
                <button
                  type="button"
                  onClick={() => removeYoutube(idx)}
                  className="text-error hover:text-red-400 p-1 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {youtubeLinks.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No YouTube links added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* EXTRA PROVIDER SPECIFIC SECTIONS */}
      {extraSections}
    </div>
  );
}
