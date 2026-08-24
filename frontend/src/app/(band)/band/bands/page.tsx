import type { Metadata } from "next";
import { BandsPage } from "@/band/pages/bands-page";

export const metadata: Metadata = {
  title: "Bands",
};

export default function Page() {
  return <BandsPage />;
}
