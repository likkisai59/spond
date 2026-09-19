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
  const [virtualTour, setVirtualTour] = React.useState<string | null>(media.virtual_tour || null);

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
      initialGallery={media.gallery || []}
      initialVideos={media.videos || []}
      initialYoutubeLinks={media.youtube_links || []}
      onSave={async ({ gallery, videos, youtubeLinks, coverImage }) => {
        await onSave({
          cover_image: coverImage || null,
          gallery,
          videos,
          youtube_links: youtubeLinks,
          virtual_tour: virtualTour,
        });
        toast.success("Venue gallery and media saved successfully!");
      }}
      extraSections={
        <div className="pt-4 border-t border-border space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              Matterport 360° Virtual Tour Link
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide an iframe embed or shareable URL from Matterport to allow guest tours.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="virtual_tour">360° Tour Shareable Link</Label>
            <Input
              id="virtual_tour"
              placeholder="https://my.matterport.com/show/?m=..."
              value={virtualTour || ""}
              onChange={e => setVirtualTour(e.target.value || null)}
            />
            {virtualTour && (
              <div className="p-3 bg-accent/20 border border-border rounded-xl space-y-2 text-xs">
                <p className="text-emerald-400 font-bold">Virtual tour active!</p>
                <p className="text-[10px] text-muted-foreground break-all">{virtualTour}</p>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
