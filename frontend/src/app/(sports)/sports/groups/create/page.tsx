import type { Metadata } from "next";
import { CreateGroupPage } from "@/sports/pages/create-group-page";

export const metadata: Metadata = {
  title: "Create Group",
};

export default function Page() {
  return <CreateGroupPage />;
}
