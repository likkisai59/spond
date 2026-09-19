/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm";
import { bandService } from "@/services/band";
import type { Artist, Band } from "@/types/band";
import { MapPin, Users, Loader2, Music, Mic2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VenueTalentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VenueTalentWizard({ open, onOpenChange, onSuccess }: VenueTalentWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [talents, setTalents] = useState<Array<Artist | Band>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTalent, setSelectedTalent] = useState<Artist | Band | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedTalent(null);
      loadTalent();
    }
  }, [open]);

  const loadTalent = async () => {
    try {
      setLoading(true);
      const [artistsRes, bandsRes] = await Promise.all([
        bandService.getArtists().catch(() => []),
        bandService.getBands().catch(() => [])
      ]);
      setTalents([...artistsRes, ...bandsRes]);
    } catch (error) {
      console.error("Failed to load talent", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {step === 1 ? "Step 1: Select Talent for your Venue" : `Step 2: Book ${selectedTalent?.name}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Choose an artist or band from the marketplace to perform at your venue. You will send them a booking request.
            </p>

            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : talents.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No artists or bands found in the marketplace.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {talents.map((talent) => (
                  <Card 
                    key={talent.id} 
                    className="cursor-pointer hover:border-primary transition-all group overflow-hidden bg-card/45 backdrop-blur-sm"
                    onClick={() => {
                      setSelectedTalent(talent);
                      setStep(2);
                    }}
                  >
                    <div className="h-24 bg-accent/20 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-primary font-black opacity-20">
                        {talent.name.charAt(0)}
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                        {/* If it has members_count, it's a Band */}
                        {'members_count' in talent ? <Music className="h-4 w-4" /> : <Mic2 className="h-4 w-4" />}
                        {talent.name}
                      </h4>
                      <div className="text-xs text-muted-foreground flex flex-col gap-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {talent.city}</span>
                        {talent.genre && (
                          <span className="flex items-center gap-1 truncate text-ellipsis">
                            {talent.genre.join(", ")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedTalent && (
          <div className="py-2">
            <BookingRequestForm 
              artistProfileId={selectedTalent.id}
              artistName={selectedTalent.name}
              isVenueBookingTalent={true}
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
