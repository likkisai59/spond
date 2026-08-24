import { Music, Trophy } from "lucide-react";
import { ROUTES } from "./routes";
import type { ProductConfig, ProductKey } from "@/types";

export const APP_NAME = "Unify";
export const APP_SHORT_NAME = "Unify";
export const APP_DESCRIPTION =
  "One platform, two products — a sports management platform and the BandConnect marketplace with a unified administration panel.";
export const APP_TAGLINE = "One platform. Two products. Infinite flow.";

export const PRODUCT_CONFIGS: Record<ProductKey, ProductConfig> = {
  sports: {
    key: "sports",
    name: "Sports Management",
    tagline: "Run your club like a pro",
    description:
      "Teams, schedules, events and member management built for sports organizations of every size.",
    href: ROUTES.SPORTS,
    icon: Trophy,
  },
  band: {
    key: "band",
    name: "BandConnect Marketplace",
    tagline: "Where bands meet opportunity",
    description:
      "A marketplace connecting bands, venues and clients — bookings, portfolios and payments in one place.",
    href: ROUTES.BAND,
    icon: Music,
  },
};
