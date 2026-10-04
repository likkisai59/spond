"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import {
  Form,
  FormCheckbox,
  FormInput,
  FormPassword,
} from "@/components/forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { useAuth } from "@/hooks";
import { apiClient } from "@/services/api-client";
import { authService } from "@/services";
import {
  notificationSettingsSchema,
  profileSettingsSchema,
  securitySettingsSchema,
  type NotificationSettingsFormData,
  type ProfileSettingsFormData,
  type SecuritySettingsFormData,
} from "../schemas";
import { ROUTES } from "@/constants";

function ProfileTab() {
  const dispatch = useAppDispatch();
  const { user, setUser } = useAuth();

  const form = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: user?.fullName || user?.full_name || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.fullName || user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, form]);

  const onSubmit: SubmitHandler<ProfileSettingsFormData> = async (data) => {
    try {
      await apiClient.patch("/api/v1/auth/me", {
        full_name: data.name,
        phone: data.phone,
      });
      if (user) {
        setUser({
          ...user,
          name: data.name,
          fullName: data.name,
          full_name: data.name,
          phone: data.phone,
        });
      }
      dispatch(
        notificationAdded({
          title: "Profile saved",
          message: "Your profile details were updated successfully.",
          variant: "success",
        })
      );
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error updating profile",
          message: error?.message || "Failed to update profile",
          variant: "error",
        })
      );
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormInput control={form.control} name="name" label="Full name" />
          <FormInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
          />
          <FormInput
            control={form.control}
            name="phone"
            label="Phone (optional)"
            placeholder="9820012345"
            maxLength={10}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="accent">
              Save profile
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

function NotificationsTab() {
  const dispatch = useAppDispatch();
  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      eventReminders: true,
      pollNotifications: true,
      paymentReminders: true,
      messageNotifications: true,
      weeklyDigest: false,
    },
  });

  const onSubmit: SubmitHandler<NotificationSettingsFormData> = () => {
    dispatch(
      notificationAdded({
        title: "Notification preferences saved",
        message: "Your notification settings were updated (demo mode).",
        variant: "success",
      })
    );
  };

  return (
    <Card className="p-6 sm:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormCheckbox
            control={form.control}
            name="emailNotifications"
            label="Email notifications — receive updates and digests by email"
          />
          <FormCheckbox
            control={form.control}
            name="pushNotifications"
            label="Push notifications — get instant alerts on your devices"
          />
          <FormCheckbox
            control={form.control}
            name="eventReminders"
            label="Event reminders — ping me before matches and training"
          />
          <FormCheckbox
            control={form.control}
            name="pollNotifications"
            label="Poll notifications — tell me when polls open or close"
          />
          <FormCheckbox
            control={form.control}
            name="paymentReminders"
            label="Payment reminders — notify me about due and overdue payments"
          />
          <FormCheckbox
            control={form.control}
            name="messageNotifications"
            label="Message notifications — alert me for new group messages"
          />
          <FormCheckbox
            control={form.control}
            name="weeklyDigest"
            label="Weekly digest — a summary of activity every Monday"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="accent">
              Save preferences
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

function SecurityTab() {
  const dispatch = useAppDispatch();
  const form = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<SecuritySettingsFormData> = async (data) => {
    try {
      await authService.changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      dispatch(
        notificationAdded({
          title: "Password updated",
          message: "Your password has been changed successfully.",
          variant: "success",
        })
      );
      form.reset();
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to update password. Please check your current password.";
      dispatch(
        notificationAdded({
          title: "Error",
          message,
          variant: "error",
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormPassword
              control={form.control}
              name="currentPassword"
              label="Current password"
              autoComplete="current-password"
            />
            <FormPassword
              control={form.control}
              name="newPassword"
              label="New password"
              autoComplete="new-password"
              description="At least 8 characters, with one letter and one number."
            />
            <FormPassword
              control={form.control}
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="accent">
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

function PreferencesTab() {
  return (
    <Card className="p-6 sm:p-8">
      <div className="py-8 text-center text-sm text-muted-foreground">
        No preferences available.
      </div>
    </Card>
  );
}

export function SettingsPage() {
  return (
    <PageContainer as="main" className="max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Settings" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Settings"
        description="Manage your profile, notifications, security and preferences."
      />

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 animate-fade-in-up">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6 animate-fade-in-up">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="security" className="mt-6 animate-fade-in-up">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6 animate-fade-in-up">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
