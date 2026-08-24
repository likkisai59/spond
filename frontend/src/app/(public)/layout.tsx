import type { Metadata } from "next";
import { PublicLayout } from "@/layouts";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function PublicRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
