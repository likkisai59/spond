"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Laptop,
  LogOut,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
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
import type { DeviceSession } from "@/data";
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
  const form = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: "Arjun Mehta",
      email: "arjun@strikersfc.in",
      phone: "9820012345",
    },
  });

  const onSubmit: SubmitHandler<ProfileSettingsFormData> = () => {
    dispatch(
      notificationAdded({
        title: "Profile saved",
        message: "Your profile details were updated (demo mode).",
        variant: "success",
      })
    );
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
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<SecuritySettingsFormData> = () => {
    dispatch(
      notificationAdded({
        title: "Password updated",
        message: "Your password was changed (demo mode).",
        variant: "success",
      })
    );
    form.reset();
  };

  const [sessions, setSessions] = useState<DeviceSession[]>([]);

  useEffect(() => {
    authService.getSessions().then((data) => {
      if (Array.isArray(data)) setSessions(data);
    }).catch(() => {});
  }, []);

  const handleSignOutSession = async (sessionId: string, deviceName: string) => {
    try {
      await authService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      dispatch(
        notificationAdded({
          title: "Session signed out",
          message: `${deviceName} was signed out.`,
          variant: "success",
        })
      );
    } catch {
      dispatch(
        notificationAdded({
          title: "Error",
          message: "Failed to sign out session.",
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

      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Active sessions
          </h3>
          <Badge variant="secondary">{sessions.length} devices</Badge>
        </div>
        <ul className="mt-4 divide-y divide-border/70">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
                  {session.device?.includes("iPhone") ? (
                    <Smartphone className="h-5 w-5 text-accent" />
                  ) : (
                    <Laptop className="h-5 w-5 text-accent" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    {session.device}
                    <span className="text-xs font-semibold text-muted-foreground">
                      {session.browser}
                    </span>
                    {session.current ? (
                      <Badge variant="gradient" className="text-[10px]">
                        This device
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleSignOutSession(session.id, session.device)}
                >
                  <LogOut />
                  Sign out
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
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
