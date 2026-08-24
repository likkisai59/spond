import type { Metadata } from "next";
import { MemberProfilePage } from "@/sports/pages/member-profile-page";

export const metadata: Metadata = {
  title: "Member Profile",
};

export default function Page() {
  return <MemberProfilePage />;
}
