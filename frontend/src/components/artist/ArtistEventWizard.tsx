/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm";
import { bandService } from "@/services/band";
import type { Venue } from "@/types/band";
import { MapPin, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ArtistEventWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ArtistEventWizard({ open, onOpenChange, onSuccess }: ArtistEventWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedVenue(null);
      loadVenues();
    }
  }, [open]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const res = await bandService.getVenues();
      setVenues(res || []);
    } catch (error) {
      console.error("Failed to load venues", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 1 ? "Step 1: Select a Venue for your Event" : `Step 2: Book ${selectedVenue?.name}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Choose a venue from the marketplace to host your event. You will send a booking request to the venue owner.
            </p>

            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No venues found in the marketplace.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {venues.map((venue) => (
                  <Card 
                    key={venue.id} 
                    className="cursor-pointer hover:border-primary transition-all group overflow-hidden bg-card/45 backdrop-blur-sm"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setStep(2);
                    }}
                  >
                    <div className="h-24 bg-accent/20 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-primary font-black opacity-20">
                        {venue.name.charAt(0)}
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{venue.name}</h4>
                      <div className="text-xs text-muted-foreground flex flex-col gap-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {venue.city}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3"/> Up to {venue.capacity} guests</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedVenue && (
          <div className="py-2">
            <BookingRequestForm 
              venueId={selectedVenue.id}
              venueName={selectedVenue.name}
              isArtistBookingVenue={true}
              onCancel={() => setStep(1)}
              onSuccess={() => {
                onOpenChange(false);
                onSuccess();
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
