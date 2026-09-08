import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(64, "Must be at most 64 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Full name cannot contain numbers");

export const requiredStringSchema = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} is required`);

export const idSchema = z.string().min(1, "A valid id is required");
