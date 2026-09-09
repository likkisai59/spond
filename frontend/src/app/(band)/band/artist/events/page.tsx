"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { ArtistEventWizard } from "@/components/artist/ArtistEventWizard";

export default function ArtistEventsPage() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Events & Venue Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your upcoming shows and book venues for your own events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/band/marketplace/venues">
              <Building2 className="h-4 w-4" />
              Find a Venue
            </Link>
          </Button>
          <Button 
            className="gap-2 text-white shadow-md bg-primary hover:bg-primary/90"
            onClick={() => setWizardOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Placeholder state for no events */}
        <Card className="bg-card/45 backdrop-blur-md border border-border shadow-xl rounded-2xl flex flex-col items-center justify-center p-10 text-center col-span-full">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Upcoming Events</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            You haven&apos;t scheduled any events or booked any venues yet. Create an event or browse venues to get started.
          </p>
        </Card>
      </div>

      <ArtistEventWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        onSuccess={() => {
          // Normally we'd refresh the list of events here
        }}
      />
    </div>
  );
}
