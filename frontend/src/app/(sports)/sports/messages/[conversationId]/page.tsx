import type { Metadata } from "next";
import { ConversationPage } from "@/sports/pages/conversation-page";

export const metadata: Metadata = {
  title: "Conversation",
};

export default function Page() {
  return <ConversationPage />;
}
