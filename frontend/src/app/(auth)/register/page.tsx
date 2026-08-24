import type { Metadata } from "next";
import { RegisterPage } from "@/auth";

export const metadata: Metadata = {
  title: "Create account",
};

export default function Page() {
  return <RegisterPage />;
}
