import type { Metadata } from "next";
import { ResetPasswordPage } from "@/auth";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function Page() {
  return <ResetPasswordPage />;
}
