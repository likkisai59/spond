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

const isValidUrl = (urlString: string, domainKeyword?: string): boolean => {
  if (!urlString || !urlString.trim()) return true;
  const trimmed = urlString.trim();
  const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;
  if (!urlRegex.test(trimmed)) return false;
  if (domainKeyword && !trimmed.toLowerCase().includes(domainKeyword)) {
    return false;
  }
  return true;
};

export function ArtistMediaGallery({ media, onSave }: ArtistMediaGalleryProps) {
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: media.social_links?.instagram || "",
    facebook: media.social_links?.facebook || "",
    twitter: media.social_links?.twitter || "",
    website: media.social_links?.website || "",
  });

  const [errors, setErrors] = React.useState({
    instagram: "",
    facebook: "",
    twitter: "",
    website: "",
  });

  const validateSocials = (): boolean => {
    const newErrors = {
      instagram: !isValidUrl(socialLinks.instagram, "instagram") ? "Enter proper links" : "",
      facebook: !isValidUrl(socialLinks.facebook, "facebook") ? "Enter proper links" : "",
      twitter: !isValidUrl(socialLinks.twitter, "twitter") && !isValidUrl(socialLinks.twitter, "x.com") ? "Enter proper links" : "",
      website: !isValidUrl(socialLinks.website) ? "Enter proper links" : "",
    };
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) {
      toast.error("Enter proper links");
      return false;
    }
    return true;
  };

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
        if (!validateSocials()) {
          throw new Error("Enter proper links");
        }
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
                onChange={e => {
                  setSocialLinks(prev => ({ ...prev, instagram: e.target.value }));
                  if (errors.instagram) setErrors(prev => ({ ...prev, instagram: "" }));
                }}
                onBlur={() => {
                  if (!isValidUrl(socialLinks.instagram, "instagram")) {
                    setErrors(prev => ({ ...prev, instagram: "Enter proper links" }));
                  }
                }}
                className={errors.instagram ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.instagram && (
                <p className="text-xs text-error font-medium">{errors.instagram}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Facebook className="h-4 w-4 text-blue-400" /> Facebook URL
              </Label>
              <Input
                placeholder="https://facebook.com/..."
                value={socialLinks.facebook}
                onChange={e => {
                  setSocialLinks(prev => ({ ...prev, facebook: e.target.value }));
                  if (errors.facebook) setErrors(prev => ({ ...prev, facebook: "" }));
                }}
                onBlur={() => {
                  if (!isValidUrl(socialLinks.facebook, "facebook")) {
                    setErrors(prev => ({ ...prev, facebook: "Enter proper links" }));
                  }
                }}
                className={errors.facebook ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.facebook && (
                <p className="text-xs text-error font-medium">{errors.facebook}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Twitter className="h-4 w-4 text-sky-400" /> Twitter / X URL
              </Label>
              <Input
                placeholder="https://twitter.com/..."
                value={socialLinks.twitter}
                onChange={e => {
                  setSocialLinks(prev => ({ ...prev, twitter: e.target.value }));
                  if (errors.twitter) setErrors(prev => ({ ...prev, twitter: "" }));
                }}
                onBlur={() => {
                  if (!isValidUrl(socialLinks.twitter, "twitter") && !isValidUrl(socialLinks.twitter, "x.com")) {
                    setErrors(prev => ({ ...prev, twitter: "Enter proper links" }));
                  }
                }}
                className={errors.twitter ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.twitter && (
                <p className="text-xs text-error font-medium">{errors.twitter}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-purple-400" /> Official Website URL
              </Label>
              <Input
                placeholder="https://www..."
                value={socialLinks.website}
                onChange={e => {
                  setSocialLinks(prev => ({ ...prev, website: e.target.value }));
                  if (errors.website) setErrors(prev => ({ ...prev, website: "" }));
                }}
                onBlur={() => {
                  if (!isValidUrl(socialLinks.website)) {
                    setErrors(prev => ({ ...prev, website: "Enter proper links" }));
                  }
                }}
                className={errors.website ? "border-error focus-visible:ring-error" : ""}
              />
              {errors.website && (
                <p className="text-xs text-error font-medium">{errors.website}</p>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}
