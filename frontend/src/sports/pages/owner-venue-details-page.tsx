"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CalendarPlus, Clock, IndianRupee, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Form, FormInput } from "@/components/forms";
import { EmptyCard } from "@/components/cards";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { venuesService } from "@/services/sports";
import { ROUTES } from "@/constants";
import { formatDate } from "@/utils/helpers";
import { generateSlotsSchema, type GenerateSlotsFormData } from "../schemas";

export function OwnerVenueDetailsPage({ venueId }: { venueId: string }) {
  const dispatch = useAppDispatch();
  const [venue, setVenue] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [updatingSlotId, setUpdatingSlotId] = useState<string | null>(null);

  const form = useForm<GenerateSlotsFormData>({
    resolver: zodResolver(generateSlotsSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      slotDurationMinutes: 60,
      price: 0,
    },
  });

  const fetchVenueAndSlots = async () => {
    try {
      const vRes = await venuesService.getById(venueId);
      setVenue(vRes.data);
      const sRes = await venuesService.listSlots(venueId);
      setSlots(sRes.data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenueAndSlots();
  }, [venueId]);

  const onSubmit: SubmitHandler<GenerateSlotsFormData> = async (data) => {
    try {
      await venuesService.generateSlots(venueId, {
        start_date: data.startDate,
        end_date: data.endDate,
        start_time: data.startTime,
        end_time: data.endTime,
        slot_duration_minutes: data.slotDurationMinutes,
        price: data.price,
      });
      
      dispatch(
        notificationAdded({
          title: "Slots created",
          message: "New time slots have been generated.",
          variant: "success",
        })
      );
      form.reset();
      fetchVenueAndSlots();
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error generating slots",
          message: error.message || "Something went wrong.",
          variant: "error",
        })
      );
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await venuesService.publishVenue(venueId);
      dispatch(
        notificationAdded({
          title: "Venue Published",
          message: "Your venue is now live and accepting bookings.",
          variant: "success",
        })
      );
      fetchVenueAndSlots();
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error publishing venue",
          message: error.message || "Something went wrong.",
          variant: "error",
        })
      );
    } finally {
      setPublishing(false);
    }
  };

  const toggleSlotAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      setUpdatingSlotId(slotId);
      await venuesService.updateSlot(slotId, { is_available: !currentStatus });
      dispatch(
        notificationAdded({
          title: currentStatus ? "Slot Blocked" : "Slot Unblocked",
          message: `Slot has been ${currentStatus ? 'blocked' : 'unblocked'}.`,
          variant: "success",
        })
      );
      fetchVenueAndSlots();
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error updating slot",
          message: error.message || "Something went wrong.",
          variant: "error",
        })
      );
    } finally {
      setUpdatingSlotId(null);
    }
  };

  if (loading) return <PageContainer as="main"><p>Loading venue details...</p></PageContainer>;
  if (!venue) return <PageContainer as="main"><p>Venue not found.</p></PageContainer>;

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "My Venues", href: ROUTES.SPORTS_OWNER_VENUES },
          { label: venue.name },
        ]}
        className="mb-4"
      />

      <PageHeader
        title={venue.name}
        description={`Manage availability and slots for ${venue.name}. Status: ${venue.status || 'Draft'}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={ROUTES.SPORTS_OWNER_VENUES}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            {venue.status !== "Published" && (
              <Button onClick={handlePublish} disabled={publishing} variant="accent">
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish Venue
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <CalendarPlus className="mr-2 h-5 w-5 text-accent" />
              Bulk Generate Slots
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput control={form.control} name="startDate" label="Start Date" type="date" min={new Date().toISOString().split("T")[0]} />
                  <FormInput control={form.control} name="endDate" label="End Date" type="date" min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput control={form.control} name="startTime" label="Start Time" type="time" />
                  <FormInput control={form.control} name="endTime" label="End Time" type="time" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput control={form.control} name="slotDurationMinutes" label="Duration (mins)" type="number" />
                  <FormInput control={form.control} name="price" label="Price (INR)" type="number" />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  loading={form.formState.isSubmitting}
                >
                  Generate Slots
                </Button>
              </form>
            </Form>
          </Card>
        </section>

        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Manage Slots</h2>
          {slots.length === 0 ? (
            <EmptyCard
              title="No slots created"
              description="Create time slots to start accepting bookings for this venue."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`rounded-xl border ${slot.is_available ? 'border-border/70' : 'border-red-200 bg-red-50/10'} bg-card p-4 transition-shadow hover:shadow-sm flex flex-col justify-between`}
                >
                  <div>
                    <p className="font-bold text-sm">{formatDate(slot.date)}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 font-semibold text-emerald-600">
                      <IndianRupee className="h-4 w-4" />
                      <span>{slot.price}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-2">
                    <span className={`text-xs font-bold ${slot.is_available ? 'text-blue-500' : 'text-red-500'}`}>
                      {slot.is_available ? "Available" : "Blocked/Booked"}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      disabled={updatingSlotId === slot.id}
                      onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                      className="h-8 px-2"
                    >
                      {slot.is_available ? <EyeOff className="h-4 w-4 mr-1"/> : <Eye className="h-4 w-4 mr-1"/>}
                      {slot.is_available ? "Block" : "Unblock"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
