"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import {
  Laptop,
  LogOut,
  Monitor,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
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
  FormSelect,
} from "@/components/forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { MOCK_LOGIN_ACTIVITY, MOCK_SESSIONS } from "@/data";
import { formatDate } from "@/utils/date";
import { cn } from "@/utils/cn";
import {
  notificationSettingsSchema,
  preferencesSchema,
  profileSettingsSchema,
  securitySettingsSchema,
  type NotificationSettingsFormData,
  type PreferencesFormData,
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
      phone: "+91 98200 12345",
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
            placeholder="+91 98200 12345"
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

  const handleSignOutSession = (device: string) => {
    dispatch(
      notificationAdded({
        title: "Session signed out",
        message: `${device} was signed out (demo mode).`,
        variant: "info",
      })
    );
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
          <Badge variant="secondary">{MOCK_SESSIONS.length} devices</Badge>
        </div>
        <ul className="mt-4 divide-y divide-border/70">
          {MOCK_SESSIONS.map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
                  {session.device.includes("iPhone") ? (
                    <Smartphone className="h-5 w-5 text-accent" />
                  ) : (
                    <Laptop className="h-5 w-5 text-accent" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    {session.device}
                    <span className="text-xs font-semibold text-muted-foreground">
                      {session.browser}
                    </span>
                    {session.current ? (
                      <Badge variant="gradient" className="text-[10px]">
                        This device
                      </Badge>
                    ) : null}
                  </p>
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
                  onClick={() => handleSignOutSession(session.device)}
                >
                  <LogOut />
                  Sign out
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 sm:p-8">
        <h3 className="text-lg font-extrabold tracking-tight">Login activity</h3>
        <ul className="mt-4 divide-y divide-border/70">
          {MOCK_LOGIN_ACTIVITY.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {entry.device}
                  <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
                    {entry.browser}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.location} · {formatDate(entry.datetime, "MMM d, yyyy · h:mm a")}
                </p>
              </div>
              <span
                className={cn(
                  "w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                  entry.status === "Success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {entry.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function PreferencesTab() {
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { language: "en", timezone: "IST" },
  });

  const onSubmit: SubmitHandler<PreferencesFormData> = () => {
    dispatch(
      notificationAdded({
        title: "Preferences saved",
        message: "Your app preferences were updated (demo mode).",
        variant: "success",
      })
    );
  };

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold">Theme</p>
        <div
          role="radiogroup"
          aria-label="Theme"
          className="inline-flex rounded-full border border-input bg-card p-1"
        >
          {THEME_OPTIONS.map((option) => {
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormSelect
            control={form.control}
            name="language"
            label="Language"
            options={[
              { label: "English", value: "en" },
              { label: "हिन्दी (Hindi)", value: "hi" },
              { label: "தமிழ் (Tamil)", value: "ta" },
              { label: "తెలుగు (Telugu)", value: "te" },
            ]}
          />
          <FormSelect
            control={form.control}
            name="timezone"
            label="Timezone"
            options={[
              { label: "India Standard Time (IST)", value: "IST" },
              { label: "Greenwich Mean Time (GMT)", value: "GMT" },
              { label: "Eastern Time (EST)", value: "EST" },
            ]}
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
