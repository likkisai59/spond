import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterPage } from "@/auth";

export const metadata: Metadata = {
  title: "Create account",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
