"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, DollarSign, MapPin, Sparkles, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/store/hooks";
import { activeEventSet } from "@/store/band/marketplace-slice";
import { eventHubService } from "@/services/eventhub/events.service";
import { notificationAdded } from "@/store/slices/notification-slice";
import { ROUTES } from "@/constants";

export interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  initialCity?: string;
}

const EVENT_TYPES = [
  "Wedding Reception",
  "Wedding Ceremony",
  "Sangeet / Mehendi",
  "Corporate Gala",
  "Birthday Celebration",
  "Anniversary",
  "Concert / Live Show",
  "Private Party",
];

export function CreateEventModal({
  open,
  onOpenChange,
  initialDate = "",
  initialCity = "",
}: CreateEventModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    date: initialDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    eventType: "Wedding Reception",
    location: initialCity || "Hyderabad",
    guestCount: 200,
    budget: 150000,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNext = () => {
    if (!formData.title.trim()) {
      setError("Please enter your event name (e.g. Varun's Reception).");
      return;
    }
    if (!formData.date) {
      setError("Please select a date for your event.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!formData.location.trim()) {
      setError("Please enter the city or venue location.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await eventHubService.createEvent({
        title: formData.title,
        date: formData.date,
        location: formData.location,
        guestCount: Number(formData.guestCount) || 100,
        budget: Number(formData.budget) || 50000,
        eventType: formData.eventType,
      });

      if (res.data) {
        dispatch(activeEventSet(res.data));
        dispatch(
          notificationAdded({
            title: "Event Created!",
            message: `"${formData.title}" is now active in your dashboard.`,
            type: "success",
          })
        );
        onOpenChange(false);
        router.push(`/band/events/${res.data.id}`);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create event. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md rounded-2xl bg-card border-border/80 shadow-2xl p-6">
        <ModalHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wide uppercase">
            <Sparkles className="h-4 w-4 text-pink-500" />
            Step {step} of 2 — {step === 1 ? "Event Overview" : "Guests & Budget"}
          </div>
          <ModalTitle className="text-xl font-bold tracking-tight text-foreground mt-1">
            {step === 1 ? "Create Your Event" : "Event Scale & Logistics"}
          </ModalTitle>
          <ModalDescription className="text-xs text-muted-foreground">
            {step === 1
              ? "Tell us what you're celebrating and when."
              : "Help us find the best venues, artists and bands for your budget."}
          </ModalDescription>
        </ModalHeader>

        {error && (
          <div className="my-3 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4 py-4">
          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="event-title" className="text-xs font-semibold">
                  Event Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event-title"
                  placeholder="e.g. Varun & Ananya's Reception"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="h-10 rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-type" className="text-xs font-semibold">
                  Event Type
                </Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(val) => handleChange("eventType", val)}
                >
                  <SelectTrigger id="event-type" className="h-10 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-date" className="text-xs font-semibold">
                  Event Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="event-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="h-10 rounded-xl pl-9"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="event-location" className="text-xs font-semibold">
                  Location / City <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="event-location"
                    placeholder="e.g. Hyderabad, Banjara Hills"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="h-10 rounded-xl pl-9"
                    autoFocus
                  />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="event-guests" className="text-xs font-semibold">
                    Guest Count
                  </Label>
                  <div className="relative">
                    <Input
                      id="event-guests"
                      type="number"
                      min={10}
                      step={50}
                      value={formData.guestCount}
                      onChange={(e) => handleChange("guestCount", e.target.value)}
                      className="h-10 rounded-xl pl-9"
                    />
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="event-budget" className="text-xs font-semibold">
                    Budget (₹)
                  </Label>
                  <div className="relative">
                    <Input
                      id="event-budget"
                      type="number"
                      min={10000}
                      step={10000}
                      value={formData.budget}
                      onChange={(e) => handleChange("budget", e.target.value)}
                      className="h-10 rounded-xl pl-9"
                    />
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <ModalFooter className="pt-3 border-t border-border/50 flex justify-between gap-2">
          {step === 2 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="rounded-xl h-10 px-4 text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4 text-xs"
            >
              Cancel
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="rounded-xl h-10 px-5 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-md transition-all"
            >
              Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl h-10 px-5 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-md transition-all"
            >
              {loading ? "Creating..." : "Launch Event Dashboard →"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
