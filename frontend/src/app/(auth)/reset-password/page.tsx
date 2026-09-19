import type { Metadata } from "next";
import { ResetPasswordPage } from "@/auth";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your account password",
};

export default function Page() {
  return <ResetPasswordPage />;
}
