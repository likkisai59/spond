import { z } from "zod";

// ── Email ─────────────────────────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email address is too long")
  .email("Enter a valid email address")
  .refine(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    "Email must contain a valid domain (e.g. user@example.com)"
  );

// ── Password ──────────────────────────────────────────────────────────────────
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
    "Password must contain at least one special character (!@#$%...)"
  );

// ── Name ──────────────────────────────────────────────────────────────────────
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(64, "Must be at most 64 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Full name cannot contain numbers");

// ── Helpers ───────────────────────────────────────────────────────────────────
export const requiredStringSchema = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} is required`);

export const idSchema = z.string().min(1, "A valid id is required");

// ── Password strength checker (for UI indicators) ─────────────────────────────
export interface PasswordStrength {
  score: number; // 0–5
  label: "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;  // tailwind colour class
  checks: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const label =
    score <= 1 ? "Very weak" :
    score === 2 ? "Weak" :
    score === 3 ? "Fair" :
    score === 4 ? "Good" : "Strong";

  const color =
    score <= 1 ? "bg-red-500" :
    score === 2 ? "bg-orange-500" :
    score === 3 ? "bg-yellow-500" :
    score === 4 ? "bg-blue-500" : "bg-emerald-500";

  return { score, label, color, checks };
}
