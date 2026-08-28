"use client";

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
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { createEventThunk } from "@/store/sports/events-slice";
import { fetchGroupsThunk } from "@/store/sports/groups-slice";
import { selectAllGroups } from "@/store/sports/selectors";
import { createEventSchema, type CreateEventFormData } from "../schemas";
import { EVENT_TYPES } from "@/types";
import { ROUTES } from "@/constants";
import { useEffect } from "react";

export function CreateEventPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);

  const groupsStatus = useAppSelector((state) => state.sports.groups.status);

  useEffect(() => {
    if (groupsStatus === "idle" || groupsStatus === "failed") {
      dispatch(fetchGroupsThunk());
    }
  }, [dispatch, groupsStatus]);

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      groupId: "",
      type: undefined,
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      notifyMembers: true,
    },
  });
  const { control, handleSubmit, formState } = form;

  const onSubmit: SubmitHandler<CreateEventFormData> = async (data) => {
    try {
      const actionResult = await dispatch(
        createEventThunk({
          groupId: data.groupId,
          name: data.name,
          type: data.type,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          location: data.location,
          description: data.description,
          notifyMembers: data.notifyMembers,
        })
      ).unwrap();

      if (data.notifyMembers) {
        dispatch(
          notificationAdded({
            title: "Members notified",
            message: `Invites for “${data.name}” are on their way.`,
            variant: "info",
          })
        );
      }
      dispatch(
        notificationAdded({
          title: "Event created",
          message: `“${data.name}” was added to the calendar.`,
          variant: "success",
        })
      );
      router.push(`${ROUTES.SPORTS_EVENTS}/${actionResult.id}`);
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Failed to create event",
          message: error?.message || "Something went wrong while creating the event.",
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
          { label: "Events", href: ROUTES.SPORTS_EVENTS },
          { label: "Create" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Create an event"
        description="Schedule training, matches or meetings — members respond in one tap."
        actions={
          <Button asChild variant="ghost">
            <Link href={ROUTES.SPORTS_EVENTS}>
              <ArrowLeft />
              Back to events
            </Link>
          </Button>
        }
      />

      <Card className="mt-8 animate-fade-in-up p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <FormSelect
                control={control}
                name="groupId"
                label="Group"
                placeholder="Select a group"
                options={groups.map((group) => ({
                  label: group.name,
                  value: group.id,
                }))}
              />
              <FormSelect
                control={control}
                name="type"
                label="Event type"
                placeholder="Select a type"
                options={EVENT_TYPES.map((item) => ({ label: item, value: item }))}
              />
            </div>

            <FormInput
              control={control}
              name="name"
              label="Event name"
              placeholder="e.g. Saturday League — Semi Final"
            />

            <div className="grid gap-6 sm:grid-cols-3">
              <FormInput
                control={control}
                name="date"
                label="Date"
                type="date"
              />
              <FormInput
                control={control}
                name="startTime"
                label="Start time"
                type="time"
              />
              <FormInput
                control={control}
                name="endTime"
                label="End time"
                type="time"
              />
            </div>

            <FormInput
              control={control}
              name="location"
              label="Location"
              placeholder="e.g. Cooperage Ground, Mumbai"
            />

            <FormTextarea
              control={control}
              name="description"
              label="Description"
              placeholder="Anything members should know — kit, arrival time, agenda…"
              rows={4}
            />

            <FormCheckbox
              control={control}
              name="notifyMembers"
              label="Notify members about this event"
            />

            <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href={ROUTES.SPORTS_EVENTS}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={formState.isSubmitting}
              >
                Create event
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </PageContainer>
  );
}
