import { Suspense } from "react";
import type { Metadata } from "next";
import { MarketplaceSearchPage } from "@/band/pages/marketplace-search-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Marketplace Search",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-8 w-64" />
          <Skeleton className="mt-6 h-12 w-full max-w-2xl rounded-full" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[260px,1fr]">
            <Skeleton className="hidden h-96 w-full rounded-lg lg:block" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <MarketplaceSearchPage />
    </Suspense>
  );
}
