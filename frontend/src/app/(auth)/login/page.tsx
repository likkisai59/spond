import type { Metadata } from "next";
import { LoginPage } from "@/auth";

export const metadata: Metadata = {
  title: "Log in",
};

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: Props) {
  return <LoginPage searchParams={searchParams} />;
}
