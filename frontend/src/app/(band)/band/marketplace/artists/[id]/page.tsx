"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { bandService } from "@/services/band";
import { ArtistProfilePreview } from "@/components/artist/ArtistProfilePreview";
import { ArtistProfile } from "@/types/artist";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm";
import { useAuth } from "@/hooks/use-auth";

export default function ArtistPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const artistId = params.id as string;
  const [profile, setProfile] = React.useState<ArtistProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showBookingWizard, setShowBookingWizard] = React.useState(false);

  React.useEffect(() => {
    async function loadArtist() {
      try {
        setLoading(true);
        // We cast to any first, then ArtistProfile, because the backend returns the full profile
        const data = await bandService.getArtist(artistId) as unknown as ArtistProfile;
        setProfile(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load artist profile");
      } finally {
        setLoading(false);
      }
    }
    
    if (artistId) {
      loadArtist();
    }
  }, [artistId]);

  // Auto-open booking modal if redirected back with action=book
  React.useEffect(() => {
    if (user && profile && searchParams.get("action") === "book") {
      setShowBookingWizard(true);
      // Clean up the URL so it doesn't reopen on refresh
      window.history.replaceState(null, "", `/band/marketplace/artists/${artistId}`);
    }
  }, [user, profile, searchParams, artistId]);

  const handleBookNow = () => {
    if (!user) {
      // Redirect to login if unauthenticated with action=book
      router.push(`/login?callbackUrl=${encodeURIComponent(`/band/marketplace/artists/${artistId}?action=book`)}`);
      return;
    }
    setShowBookingWizard(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading artist profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <ErrorState 
          title="Profile Not Found" 
          message={error || "Could not find the requested artist profile."} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-accent">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
        
        <Button onClick={handleBookNow} className="font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
          <CalendarDays className="h-4 w-4 mr-2" />
          Book Now
        </Button>
      </div>

      {/* Render the full profile using the Preview component */}
      <ArtistProfilePreview profile={profile} />

      {/* Booking Wizard Dialog */}
      <Dialog open={showBookingWizard} onOpenChange={setShowBookingWizard}>
        <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Book {profile.display_name || "Artist"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <BookingRequestForm
              artistProfileId={artistId}
              artistName={profile.display_name}
              proposedPrice={profile.base_rate}
              onSuccess={(_bookingId) => {
                setShowBookingWizard(false);
                router.push(`/band/client/bookings`);
              }}
              onCancel={() => setShowBookingWizard(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
