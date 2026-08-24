import type { Metadata } from "next";
import { VerifyEmailPage } from "@/auth";

export const metadata: Metadata = {
  title: "Verify email",
};

export default function Page() {
  return <VerifyEmailPage />;
}
