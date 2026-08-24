import type { Metadata } from "next";
import { AuthLayout } from "@/layouts";

export const metadata: Metadata = {
  title: "Account",
};

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
