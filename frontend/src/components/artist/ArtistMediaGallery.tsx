"use client";

import * as React from "react";
import { MediaGalleryData } from "@/types/artist";
import { ProviderMediaGallery } from "@/components/shared/ProviderMediaGallery";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter, Globe } from "lucide-react";
import toast from "react-hot-toast";

export interface ArtistMediaGalleryProps {
  media: MediaGalleryData;
  onSave: (updated: MediaGalleryData) => Promise<void>;
}

const ALBUMS = ["Live Shows", "Studio Sessions", "Promo Shoots", "General"];
const VIDEO_CATEGORIES = ["Live Performance", "Music Video", "Promo clip", "Rehearsals"];

export function ArtistMediaGallery({ media, onSave }: ArtistMediaGalleryProps) {
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: media.social_links?.instagram || "",
    facebook: media.social_links?.facebook || "",
    twitter: media.social_links?.twitter || "",
    website: media.social_links?.website || "",
  });

  return (
    <ProviderMediaGallery
      title="Media Showcase & Albums"
      subtitle="Upload high resolution photos and demo show reels."
      albums={ALBUMS}
      videoCategories={VIDEO_CATEGORIES}
      uploadSubfolder="artists"
      videoSectionTitle="Upload Demo Videos"
      videoSectionSubtitle="Upload raw video files to showcase your audio/video energy."
      videoUploadHint="Choose a video file showing your group playing live. Max file size: 20MB. High resolution MP4 preferred."
      initialGallery={media.gallery || []}
      initialVideos={media.videos || []}
      initialYoutubeLinks={media.youtube_links || []}
      onSave={async ({ gallery, videos, youtubeLinks }) => {
        await onSave({
          gallery,
          videos,
          youtube_links: youtubeLinks,
          instagram_reels: media.instagram_reels || [],
          social_links: socialLinks,
        });
        toast.success("Gallery and Media updates saved successfully!");
      }}
      extraSections={
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Social Handles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Instagram className="h-4 w-4 text-pink-400" /> Instagram URL
              </Label>
              <Input
                placeholder="https://instagram.com/..."
                value={socialLinks.instagram}
                onChange={e => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Facebook className="h-4 w-4 text-blue-400" /> Facebook URL
              </Label>
              <Input
                placeholder="https://facebook.com/..."
                value={socialLinks.facebook}
                onChange={e => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Twitter className="h-4 w-4 text-sky-400" /> Twitter / X URL
              </Label>
              <Input
                placeholder="https://twitter.com/..."
                value={socialLinks.twitter}
                onChange={e => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-purple-400" /> Official Website URL
              </Label>
              <Input
                placeholder="https://www..."
                value={socialLinks.website}
                onChange={e => setSocialLinks(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
