import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/auth";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function Page() {
  return <ForgotPasswordPage />;
}
