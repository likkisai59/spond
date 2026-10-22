"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/ui/badge";
import { GroupLogo } from "@/sports/components/group-logo";
import { apiClient } from "@/services/api-client";
import { useAuth } from "@/hooks";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { ROUTES } from "@/constants";

interface InvitationData {
  token: string;
  status: string;
  role: string;
  is_expired: boolean;
  invited_email?: string;
  member_name?: string;
  inviter_name: string;
  group: {
    id: string;
    name: string;
    logo?: string | null;
    cover_image?: string | null;
    sport_type: string;
    category: string;
    location: string;
    description: string;
    member_count: number;
  };
}

export default function GroupInvitePreviewPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InvitationData | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invitation link is missing a valid token.");
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/v1/sports/invitations/${token}`);
        setData(res.data?.data || null);
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "This invitation link is invalid or no longer exists."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    try {
      await apiClient.post(`/api/v1/sports/invitations/${token}/accept`);
      setAccepted(true);
      dispatch(
        notificationAdded({
          title: "Welcome to the team!",
          message: `You are now a confirmed member of ${data?.group.name || "the group"}.`,
          variant: "success",
        })
      );
      setTimeout(() => {
        router.push(ROUTES.SPORTS_DASHBOARD);
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to accept invitation. Please try again.";
      dispatch(
        notificationAdded({
          title: "Error joining group",
          message: msg,
          variant: "error",
        })
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setDeclining(true);
    try {
      await apiClient.get("/api/v1/sports/groups/invite/respond", {
        params: { token, action: "reject" },
      });
      setDeclined(true);
      dispatch(
        notificationAdded({
          title: "Invitation declined",
          message: `You declined the invitation to join ${data?.group.name || "the group"}.`,
          variant: "info",
        })
      );
    } catch (err: any) {
      // Even if already responded, mark declined
      setDeclined(true);
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="flex w-full max-w-md flex-col items-center p-8 text-center animate-fade-in-up">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <h2 className="mt-4 text-lg font-bold">Loading invitation preview...</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Verifying invitation details with the club.
          </p>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="flex w-full max-w-md flex-col items-center p-8 text-center animate-fade-in-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold tracking-tight">
            Invalid Invitation
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {error || "This invitation link is expired, revoked, or no longer available."}
          </p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button asChild variant="accent" className="w-full">
              <Link href={ROUTES.LOGIN}>Go to Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.HOME}>Back to Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { group } = data;
  const isAlreadyConfirmed = data.status === "Confirmed" || accepted;
  const isExpired = data.is_expired;

  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4">
      <Card className="relative w-full max-w-lg overflow-hidden p-0 shadow-xl border-border/80 animate-fade-in-up">
        {/* Cover banner */}
        <div className="h-28 w-full bg-brand-gradient sm:h-32 relative overflow-hidden">
          {group.cover_image ? (
            <img
              src={group.cover_image}
              alt={group.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.35),transparent_50%),radial-gradient(circle_at_85%_-20%,rgba(255,255,255,0.25),transparent_45%)]" />
          )}
        </div>

        {/* Card Body */}
        <div className="px-6 pb-8 pt-0 sm:px-8">
          {/* Logo & Header */}
          <div className="-mt-12 flex items-end justify-between gap-4">
            <GroupLogo
              name={group.name}
              logoUrl={group.logo}
              size="xl"
              className="ring-4 ring-background shadow-md"
            />
            <div className="mb-1 flex flex-wrap gap-1.5">
              <Badge variant="accent">{group.sport_type}</Badge>
              {group.category ? (
                <Badge variant="secondary">{group.category}</Badge>
              ) : null}
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {group.name}
            </h1>
            <p className="text-sm font-semibold text-accent">
              Invited by {data.inviter_name || "Club Coach"}
            </p>
          </div>

          {/* Group details list */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
            {group.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {group.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-accent" />
              {group.member_count} members
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Joining as {data.role || "Member"}
            </span>
          </div>

          {group.description ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {group.description}
            </p>
          ) : null}

          {/* Status Message or Warning */}
          {isExpired ? (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
              <Clock className="h-4 w-4 shrink-0" />
              <span>This invitation link has expired. Please ask the coach to generate a new invitation.</span>
            </div>
          ) : isAlreadyConfirmed ? (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>You are a confirmed member of this group!</span>
            </div>
          ) : declined ? (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-muted bg-muted/40 p-3.5 text-xs font-medium text-muted-foreground">
              <X className="h-4 w-4 shrink-0" />
              <span>You have declined this invitation.</span>
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-6 pt-2 border-t border-border/50">
            {isAlreadyConfirmed ? (
              <Button asChild variant="accent" className="w-full">
                <Link href={ROUTES.SPORTS_DASHBOARD}>
                  Go to Member Dashboard
                </Link>
              </Button>
            ) : isExpired || declined ? (
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.SPORTS_DASHBOARD}>Go to Dashboard</Link>
              </Button>
            ) : !isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-center text-xs text-muted-foreground">
                  An account is required to accept this invitation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`${ROUTES.LOGIN}?callbackUrl=/sports/invite/${token}`}>
                      Log In to Accept
                    </Link>
                  </Button>
                  <Button asChild variant="accent" className="w-full">
                    <Link
                      href={`${ROUTES.REGISTER}?callbackUrl=/sports/invite/${token}&email=${encodeURIComponent(data.invited_email || "")}&name=${encodeURIComponent(data.member_name || "")}&role=player`}
                    >
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {user?.email && data.invited_email && user.email.toLowerCase() !== data.invited_email.toLowerCase() ? (
                  <p className="text-xs text-amber-500/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    Logged in as <b>{user.email}</b>. This invitation was addressed to <b>{data.invited_email}</b>. Accepting will join this group with your current account.
                  </p>
                ) : null}
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDecline}
                    disabled={accepting || declining}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="accent"
                    className="flex-[2]"
                    onClick={handleAccept}
                    loading={accepting}
                    disabled={declining}
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Accept Invitation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
