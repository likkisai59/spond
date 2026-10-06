"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { VenueCard } from "../components/venue-card";
import { venuesService } from "@/services/sports";
import { ROUTES } from "@/constants";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";

interface EditVenueModalProps {
  venue: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVenue: any) => void;
}

function EditVenueModal({ venue, isOpen, onClose, onSave }: EditVenueModalProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    contactName: "",
    contactPhone: "",
    openingTime: "",
    closingTime: "",
  });
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (venue) {
      setPhoneError("");
      setFormData({
        name: venue.name || "",
        city: venue.city || "",
        address: venue.address || "",
        description: venue.description || "",
        contactName: venue.contactName || venue.contact_name || "",
        contactPhone: venue.contactPhone || venue.contact_phone || "",
        openingTime: venue.openingTime || venue.opening_time || "",
        closingTime: venue.closingTime || venue.closing_time || "",
      });
    }
  }, [venue]);

  if (!venue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (formData.contactPhone && formData.contactPhone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        description: formData.description.trim(),
        contact_name: formData.contactName.trim() || undefined,
        contact_phone: formData.contactPhone.trim() || undefined,
        opening_time: formData.openingTime || undefined,
        closing_time: formData.closingTime || undefined,
      };

      const res = await venuesService.update(venue.id, payload);
      const updated = res.data || { ...venue, ...payload };

      dispatch(
        notificationAdded({
          title: "Venue updated",
          message: `${formData.name} details have been updated successfully.`,
          variant: "success",
        })
      );
      onSave(updated);
      onClose();
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error updating venue",
          message: error?.response?.data?.detail || error.message || "Failed to update venue.",
          variant: "error",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border/90 rounded-2xl p-6 shadow-2xl text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Venue Details</DialogTitle>
          <DialogDescription>
            Update the information and details for {venue.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="venue-name">Venue Name *</Label>
            <Input
              id="venue-name"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Township Arena"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="venue-city">City</Label>
              <Input
                id="venue-city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="e.g. Hyderabad"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue-address">Address</Label>
              <Input
                id="venue-address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. Madhapur"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue-description">Description</Label>
            <Textarea
              id="venue-description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description about the venue facilities..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="venue-contact-name">Contact Person</Label>
              <Input
                id="venue-contact-name"
                value={formData.contactName}
                onChange={(e) => {
                  const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  setFormData((prev) => ({ ...prev, contactName: lettersOnly }));
                }}
                placeholder="Manager / Owner name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue-contact-phone">Contact Phone</Label>
              <Input
                id="venue-contact-phone"
                value={formData.contactPhone}
                maxLength={10}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData((prev) => ({ ...prev, contactPhone: digitsOnly }));
                  if (digitsOnly.length > 0 && digitsOnly.length < 10) {
                    setPhoneError("Phone number must be exactly 10 digits");
                  } else {
                    setPhoneError("");
                  }
                }}
                placeholder="10-digit mobile number"
              />
              {phoneError ? (
                <p className="text-xs text-destructive">{phoneError}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="venue-opening-time">Opening Time</Label>
              <Input
                id="venue-opening-time"
                type="time"
                value={formData.openingTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, openingTime: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue-closing-time">Closing Time</Label>
              <Input
                id="venue-closing-time"
                type="time"
                value={formData.closingTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, closingTime: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={saving || !formData.name.trim()}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OwnerVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVenue, setEditingVenue] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    venuesService.listOwnerVenues().then((res) => {
      setVenues(res.data?.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleEditVenue = (venue: any) => {
    setEditingVenue(venue);
    setIsEditOpen(true);
  };

  const handleSaveVenue = (updatedVenue: any) => {
    setVenues((prev) =>
      prev.map((v) => (v.id === updatedVenue.id ? { ...v, ...updatedVenue } : v))
    );
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "My Venues" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="My Venues"
        description="Manage your listed venues and their availability."
        actions={
          <Button asChild variant="accent">
            <Link href={ROUTES.SPORTS_OWNER_VENUES_CREATE}>
              <Plus className="mr-2 h-4 w-4" />
              Add Venue
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading venues...</p>
        ) : venues.length === 0 ? (
          <EmptyCard
            title="No venues yet"
            description="You haven't listed any venues yet. Add one to start receiving bookings."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                href={`${ROUTES.SPORTS_OWNER_VENUE_DETAILS}/${venue.id}`}
                onEdit={handleEditVenue}
              />
            ))}
          </div>
        )}
      </div>

      <EditVenueModal
        venue={editingVenue}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveVenue}
      />
    </PageContainer>
  );
}
