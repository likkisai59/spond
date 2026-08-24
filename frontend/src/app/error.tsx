"use client";

import { ErrorState } from "@/components/shared/error-state";
import { PageContainer } from "@/components/layout";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isNetwork =
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("fetch");

  return (
    <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center">
      <ErrorState
        kind={isNetwork ? "network" : "generic"}
        description={
          error.message && error.message.length > 0
            ? error.message
            : undefined
        }
        onRetry={reset}
        className="w-full max-w-xl"
      />
    </PageContainer>
  );
}
