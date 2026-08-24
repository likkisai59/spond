import type { Metadata } from "next";
import { BandDetailsPage } from "@/band/pages/band-details-page";

export const metadata: Metadata = {
  title: "Band Profile",
};

export default function Page() {
  return <BandDetailsPage />;
}
