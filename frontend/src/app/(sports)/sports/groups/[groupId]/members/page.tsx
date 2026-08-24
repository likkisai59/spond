import type { Metadata } from "next";
import { GroupMembersPage } from "@/sports/pages/group-members-page";

export const metadata: Metadata = {
  title: "Group Members",
};

export default function Page() {
  return <GroupMembersPage />;
}
