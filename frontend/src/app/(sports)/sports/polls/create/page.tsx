import type { Metadata } from "next";
import { CreatePollPage } from "@/sports/pages/create-poll-page";

export const metadata: Metadata = {
  title: "Create Poll",
};

export default function Page() {
  return <CreatePollPage />;
}
