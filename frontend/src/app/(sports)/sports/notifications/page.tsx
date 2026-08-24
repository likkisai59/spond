import type { Metadata } from "next";
import { NotificationsPage } from "@/sports/pages/notifications-page";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return <NotificationsPage />;
}
