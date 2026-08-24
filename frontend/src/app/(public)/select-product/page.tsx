import type { Metadata } from "next";
import { SelectProductPage } from "@/landing";

export const metadata: Metadata = {
  title: "Select product",
};

export default function Page() {
  return <SelectProductPage />;
}
