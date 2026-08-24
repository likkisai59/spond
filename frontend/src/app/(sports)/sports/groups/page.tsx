import type { Metadata } from "next";
import { GroupsPage } from "@/sports/pages/groups-page";

export const metadata: Metadata = {
  title: "Groups",
};

export default function Page() {
  return <GroupsPage />;
}
