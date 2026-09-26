import type { Metadata } from "next";
import { LoginPage } from "@/auth";

export const metadata: Metadata = {
  title: "Log in",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  return <LoginPage searchParams={resolvedParams} />;
}
