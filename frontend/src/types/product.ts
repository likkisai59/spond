import type { LucideIcon } from "lucide-react";

export const PRODUCT_KEYS = ["sports", "band"] as const;
export type ProductKey = (typeof PRODUCT_KEYS)[number];

export type WorkspaceKey = ProductKey | "admin";

export interface ProductConfig {
  key: ProductKey;
  name: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
}
