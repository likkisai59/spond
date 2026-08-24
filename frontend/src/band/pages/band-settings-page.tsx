"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
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
  FormSelect,
  FormTextarea,
} from "@/components/forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";
import {
  bandNotificationSettingsSchema,
  bandPreferencesSchema,
  bandProfileSettingsSchema,
  bandSecuritySettingsSchema,
  type BandNotificationSettingsFormData,
  type BandPreferencesFormData,
  type BandProfileSettingsFormData,
  type BandSecuritySettingsFormData,
} from "../schemas";

function ProfileTab() {
  const dispatch = useAppDispatch();
  const form = useForm<BandProfileSettingsFormData>({
    resolver: zodResolver(bandProfileSettingsSchema),
    defaultValues: {
      name: "Arjun Mehta",
      email: "arjun@theechoesband.in",
      phone: "+91 98200 12345",
      city: "Mumbai",
      bio: "Manager of The Echoes — alt-rock, four members, 260+ gigs.",
    },
  });

  const onSubmit: SubmitHandler<BandProfileSettingsFormData> = () => {
    dispatch(
      notificationAdded({
        title: "Profile saved",
        message: "Your BandConnect profile was updated (demo mode).",
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
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="phone"
              label="Phone (optional)"
              placeholder="+91 98200 12345"
            />
            <FormInput
              control={form.control}
              name="city"
              label="City"
              placeholder="Mumbai"
            />
          </div>
          <FormTextarea
            control={form.control}
            name="bio"
            label="Public bio"
            placeholder="Tell hosts what makes your act unique…"
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
  const form = useForm<BandNotificationSettingsFormData>({
    resolver: zodResolver(bandNotificationSettingsSchema),
    defaultValues: {
      bookingRequests: true,
      bookingUpdates: true,
      reviewAlerts: true,
      messageNotifications: true,
      weeklyDigest: false,
    },
  });

  const onSubmit: SubmitHandler<BandNotificationSettingsFormData> = () => {
    dispatch(
      notificationAdded({
        title: "Notification preferences saved",
        message: "Your BandConnect notifications were updated (demo mode).",
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
            name="bookingRequests"
            label="Booking requests — alert me the moment a host sends an enquiry"
          />
          <FormCheckbox
            control={form.control}
            name="bookingUpdates"
            label="Booking updates — confirmations, cancellations and payouts"
          />
          <FormCheckbox
            control={form.control}
            name="reviewAlerts"
            label="Review alerts — notify me when a new review is published"
          />
          <FormCheckbox
            control={form.control}
            name="messageNotifications"
            label="Message notifications — new messages from hosts and venues"
          />
          <FormCheckbox
            control={form.control}
            name="weeklyDigest"
            label="Weekly digest — marketplace activity summary every Monday"
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
  const form = useForm<BandSecuritySettingsFormData>({
    resolver: zodResolver(bandSecuritySettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<BandSecuritySettingsFormData> = () => {
    dispatch(
      notificationAdded({
        title: "Password updated",
        message: "Your password was changed (demo mode).",
        variant: "success",
      })
    );
    form.reset();
  };

  return (
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

  const form = useForm<BandPreferencesFormData>({
    resolver: zodResolver(bandPreferencesSchema),
    defaultValues: { language: "en", timezone: "IST" },
  });

  const onSubmit: SubmitHandler<BandPreferencesFormData> = () => {
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

export function BandSettingsPage() {
  return (
    <PageContainer as="main" className="max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Settings" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Settings"
        description="Manage your BandConnect profile, notifications, security and preferences."
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
