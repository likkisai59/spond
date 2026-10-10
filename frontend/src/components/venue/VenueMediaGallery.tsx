"use client";

import * as React from "react";
import { VenueMediaData } from "@/types/venue";
import { ProviderMediaGallery } from "@/components/shared/ProviderMediaGallery";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Compass } from "lucide-react";
import toast from "react-hot-toast";

export interface VenueMediaGalleryProps {
  media: VenueMediaData;
  onSave: (updated: VenueMediaData) => Promise<void>;
}

const ALBUMS = ["Main Hall", "Dining Area", "Exterior/Garden", "Lobby", "General"];
const VIDEO_CATEGORIES = ["Walkthrough", "Event Setup", "Aerial View", "General"];

export function VenueMediaGallery({ media, onSave }: VenueMediaGalleryProps) {

  return (
    <ProviderMediaGallery
      title="Venue Media Showcase & Albums"
      subtitle="Upload high resolution photos of your spaces, walkthrough clips and Matterport 360° virtual tours."
      albums={ALBUMS}
      videoCategories={VIDEO_CATEGORIES}
      uploadSubfolder="venues"
      videoSectionTitle="Upload Walkthrough Videos"
      videoSectionSubtitle="Upload actual walkthrough video files showcasing hall space layout. Max size: 20MB."
      videoUploadHint="Choose a walkthrough clip showing the space decor configurations. Max size: 20MB. MP4 format preferred."
      showDedicatedCover={true}
      initialCoverImage={media.cover_image || null}
      showDedicatedLogo={true}
      initialLogo={media.logo || null}
      initialGallery={media.gallery || []}
      initialVideos={media.videos || []}
      initialYoutubeLinks={media.youtube_links || []}
      onSave={async ({ gallery, videos, youtubeLinks, coverImage, logo }) => {
        await onSave({
          cover_image: coverImage || null,
          logo: logo || null,
          gallery,
          videos,
          youtube_links: youtubeLinks,
          virtual_tour: null,
        });
        toast.success("Venue gallery and media saved successfully!");
      }}
    />
  );
}
