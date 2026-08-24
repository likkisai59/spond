import type { Metadata } from "next";
import { GroupDetailsPage } from "@/sports/pages/group-details-page";

export const metadata: Metadata = {
  title: "Group Details",
};

export default function Page() {
  return <GroupDetailsPage />;
}
