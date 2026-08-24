import { z } from "zod";
import {
  EVENT_TYPES,
  GROUP_CATEGORIES,
  GROUP_VISIBILITIES,
  MEMBER_ROLES,
  SPORT_TYPES,
} from "@/types";
import { emailSchema, nameSchema, passwordSchema, requiredStringSchema } from "@/utils/validations";

export const createGroupSchema = z.object({
  name: requiredStringSchema("Group name", 2),
  description: requiredStringSchema("Description", 10),
  sportType: z.enum(SPORT_TYPES, { message: "Select a sport" }),
  category: z.enum(GROUP_CATEGORIES, { message: "Select a category" }),
  location: requiredStringSchema("City", 2),
  visibility: z.enum(GROUP_VISIBILITIES, { message: "Choose a visibility" }),
});
export type CreateGroupFormData = z.infer<typeof createGroupSchema>;

export const addMemberSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: z.enum(MEMBER_ROLES, { message: "Select a role" }),
});
export type AddMemberFormData = z.infer<typeof addMemberSchema>;

export const createEventSchema = z
  .object({
    groupId: z.string().min(1, "Select a group"),
    type: z.enum(EVENT_TYPES, { message: "Select an event type" }),
    name: requiredStringSchema("Event name", 2),
    date: requiredStringSchema("Date"),
    startTime: requiredStringSchema("Start time"),
    endTime: requiredStringSchema("End time"),
    location: requiredStringSchema("Location", 2),
    description: requiredStringSchema("Description", 5),
    notifyMembers: z.boolean(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type CreateEventFormData = z.infer<typeof createEventSchema>;

export const createPollSchema = z.object({
  groupId: z.string().min(1, "Select a group"),
  question: requiredStringSchema("Question", 5),
  options: z
    .array(z.object({ label: requiredStringSchema("Option", 1) }))
    .min(2, "Add at least two options")
    .max(6, "Maximum six options"),
  multipleChoice: z.boolean(),
  expiresAt: requiredStringSchema("Expiry date"),
});
export type CreatePollFormData = z.infer<typeof createPollSchema>;

export const createPaymentSchema = z.object({
  groupId: z.string().min(1, "Select a group"),
  title: requiredStringSchema("Payment title", 3),
  amount: z.coerce
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than zero"),
  dueDate: requiredStringSchema("Due date"),
  description: z.string().optional(),
});
export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;

export const profileSettingsSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number")
    .or(z.literal("")),
});
export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  eventReminders: z.boolean(),
  pollNotifications: z.boolean(),
  paymentReminders: z.boolean(),
  messageNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
});
export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;

export const securitySettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

export const preferencesSchema = z.object({
  language: z.enum(["en", "hi", "ta", "te"]),
  timezone: z.enum(["IST", "GMT", "EST"]),
});
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
