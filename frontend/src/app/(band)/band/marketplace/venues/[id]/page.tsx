"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { bandService } from "@/services/band";
import { VenueProfilePreview } from "@/components/venue/VenueProfilePreview";
import { VenueResponseData } from "@/types/venue";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm";
import { useAuth } from "@/hooks/use-auth";

export default function VenuePublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const venueId = params.id as string;
  const [profile, setProfile] = React.useState<VenueResponseData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showBookingWizard, setShowBookingWizard] = React.useState(false);

  React.useEffect(() => {
    async function loadVenue() {
      try {
        setLoading(true);
        // We cast to any first, then VenueProfile, because the backend returns the full profile
        const data = await bandService.getVenue(venueId) as unknown as VenueResponseData;
        setProfile(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load venue profile");
      } finally {
        setLoading(false);
      }
    }
    
    if (venueId) {
      loadVenue();
    }
  }, [venueId]);

  const handleBookNow = () => {
    if (!user) {
      // Redirect to login if unauthenticated
      router.push(`/login?redirect=/band/marketplace/venues/${venueId}`);
      return;
    }
    setShowBookingWizard(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading venue profile...</p>
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
          description={error || "Could not find the requested venue profile."} 
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
          Book Venue
        </Button>
      </div>

      {/* Render the full profile using the Preview component */}
      <VenueProfilePreview profile={profile} />

      {/* Booking Wizard Dialog */}
      <Dialog open={showBookingWizard} onOpenChange={setShowBookingWizard}>
        <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Book {profile.name || "Venue"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <BookingRequestForm
              venueId={venueId}
              venueName={profile.name}
              proposedPrice={profile.pricing_details?.base_rate_per_hour || 5000}
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
