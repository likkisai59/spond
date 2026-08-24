import type { Metadata } from "next";
import { BandSettingsPage } from "@/band/pages/band-settings-page";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return <BandSettingsPage />;
}
