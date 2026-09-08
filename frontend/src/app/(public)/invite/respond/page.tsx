"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { apiClient } from "@/services/api-client";
import { ROUTES } from "@/constants";

function InviteRespondContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const action = searchParams.get("action") || "accept";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    group_name?: string;
    group_id?: string;
    member_name?: string;
    action?: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token.");
      setLoading(false);
      return;
    }

    const processInvitation = async () => {
      try {
        const res = await apiClient.get("/api/v1/sports/groups/invite/respond", {
          params: { token, action },
        });
        setData(res.data?.data || {});
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "This invitation link is invalid or has already been used."
        );
      } finally {
        setLoading(false);
      }
    };

    processInvitation();
  }, [token, action]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="flex w-full max-w-md flex-col items-center p-8 text-center animate-fade-in-up">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="mt-4 text-lg font-bold">Processing your invitation...</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Please wait while we update your group membership.
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="flex w-full max-w-md flex-col items-center p-8 text-center animate-fade-in-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold tracking-tight">Invitation Notice</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-6 w-full">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href={ROUTES.LOGIN}>Go to Login</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isAccepted = action === "accept" || data?.action === "accepted";
  const groupName = data?.group_name || "the sports group";

  useEffect(() => {
    if (data && !loading && !error) {
      const timer = setTimeout(() => {
        try { window.close(); } catch (_) { }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [data, loading, error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="flex w-full max-w-md flex-col items-center p-8 text-center animate-fade-in-up">
        {isAccepted ? (
          <>
            <p className="text-base font-bold text-emerald-500">
              ✓ Invitation accepted! You are now a confirmed member of {groupName}.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              This window will close automatically...
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-muted-foreground">
              Invitation declined for {groupName}.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              This window will close automatically...
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

export default function InviteRespondPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <InviteRespondContent />
    </Suspense>
  );
}
