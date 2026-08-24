import { z } from "zod";
import { emailSchema, nameSchema, passwordSchema } from "@/utils/validations";

export const bandProfileSettingsSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number")
    .or(z.literal("")),
  city: z.string().min(2, "Enter your city"),
  bio: z.string().max(280, "Keep the bio under 280 characters").optional(),
});
export type BandProfileSettingsFormData = z.infer<
  typeof bandProfileSettingsSchema
>;

export const bandNotificationSettingsSchema = z.object({
  bookingRequests: z.boolean(),
  bookingUpdates: z.boolean(),
  reviewAlerts: z.boolean(),
  messageNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
});
export type BandNotificationSettingsFormData = z.infer<
  typeof bandNotificationSettingsSchema
>;

export const bandSecuritySettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type BandSecuritySettingsFormData = z.infer<
  typeof bandSecuritySettingsSchema
>;

export const bandPreferencesSchema = z.object({
  language: z.enum(["en", "hi", "ta", "te"]),
  timezone: z.enum(["IST", "GMT", "EST"]),
});
export type BandPreferencesFormData = z.infer<typeof bandPreferencesSchema>;
