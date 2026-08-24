import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center">
      <ErrorState
        kind="not-found"
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        className="w-full max-w-xl"
        action={
          <>
            <Button asChild variant="accent" size="lg">
              <Link href={ROUTES.HOME}>Back to home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.SELECT_PRODUCT}>Browse products</Link>
            </Button>
          </>
        }
      />
    </PageContainer>
  );
}
