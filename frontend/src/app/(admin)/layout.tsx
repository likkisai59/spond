import type { Metadata } from "next";
import { AdminLayout } from "@/layouts";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
