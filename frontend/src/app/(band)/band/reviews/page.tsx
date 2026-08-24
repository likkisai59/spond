import type { Metadata } from "next";
import { ReviewsPage } from "@/band/pages/reviews-page";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function Page() {
  return <ReviewsPage />;
}
