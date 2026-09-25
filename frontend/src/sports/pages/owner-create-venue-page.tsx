"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import {
  Form,
  FormInput,
  FormTextarea,
} from "@/components/forms";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { createVenueSchema, type CreateVenueFormData } from "../schemas";
import { SPORT_TYPES } from "@/types";
import { ROUTES } from "@/constants";
import { venuesService } from "@/services/sports";
import { cn } from "@/utils/cn";

export function OwnerCreateVenuePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const form = useForm<CreateVenueFormData>({
    resolver: zodResolver(createVenueSchema),
    defaultValues: {
      name: "",
      description: "",
      sportType: undefined,
      address: "",
      city: "",
      state: "",
      country: "",
      contactName: "",
      contactPhone: "",
      openingTime: "",
      closingTime: "",
    },
  });

  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggleSport = (sport: string) => {
    const updated = selectedSports.includes(sport)
      ? selectedSports.filter((s) => s !== sport)
      : [...selectedSports, sport];
    setSelectedSports(updated);
    form.setValue("sportType", updated.join(", "));
  };

  const { control, handleSubmit, formState } = form;

  const onSubmit: SubmitHandler<CreateVenueFormData> = async (data) => {
    try {
      await venuesService.create({
        name: data.name,
        description: data.description,
        sport_type: selectedSports.length > 0 ? selectedSports.join(", ") : (data.sportType || ""),
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        opening_time: data.openingTime,
        closing_time: data.closingTime,
        amenities: [],
        images: [],
      });
      
      dispatch(
        notificationAdded({
          title: "Venue created",
          message: `${data.name} has been added to your venues.`,
          variant: "success",
        })
      );
      router.push(ROUTES.SPORTS_OWNER_VENUES);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error creating venue",
          message: error.message || "Failed to create venue.",
          variant: "error",
        })
      );
    }
  };

  return (
    <PageContainer as="main" className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "My Venues", href: ROUTES.SPORTS_OWNER_VENUES },
          { label: "Add Venue" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Add a venue"
        description="List your venue to start accepting bookings."
        actions={
          <Button asChild variant="ghost">
            <Link href={ROUTES.SPORTS_OWNER_VENUES}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to my venues
            </Link>
          </Button>
        }
      />

      <Card className="mt-8 animate-fade-in-up p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormInput
              control={control}
              name="name"
              label="Venue name"
              placeholder="e.g. Downtown Sports Arena"
            />
            <FormTextarea
              control={control}
              name="description"
              label="Description"
              placeholder="Tell players about your venue..."
              rows={4}
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold">Available Sports (Select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {SPORT_TYPES.map((sport) => {
                  const isSelected = selectedSports.includes(sport);
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      className={cn(
                        "rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all",
                        isSelected
                          ? "border-accent bg-accent text-accent-foreground shadow-sm"
                          : "border-border/70 bg-card hover:border-border hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormInput
                control={control}
                name="address"
                label="Street Address"
                placeholder="123 Main St"
              />
              <FormInput
                control={control}
                name="city"
                label="City"
                placeholder="e.g. New York"
              />
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <FormInput
                control={control}
                name="contactName"
                label="Contact Name"
                placeholder="Manager Name"
              />
              <FormInput
                control={control}
                name="contactPhone"
                label="Contact Phone"
                placeholder="Phone number"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormInput
                control={control}
                name="openingTime"
                label="Opening Time"
                type="time"
              />
              <FormInput
                control={control}
                name="closingTime"
                label="Closing Time"
                type="time"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href={ROUTES.SPORTS_OWNER_VENUES}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={formState.isSubmitting}
                loading={formState.isSubmitting}
              >
                {formState.isSubmitting ? "Creating..." : "Create venue"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </PageContainer>
  );
}
