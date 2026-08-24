import type { Metadata } from "next";
import { FileDetailsPage } from "@/sports/pages/file-details-page";

export const metadata: Metadata = {
  title: "File Details",
};

export default function Page() {
  return <FileDetailsPage />;
}
