"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle2,
  Crown,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { voteToggled, fetchPollsThunk, votePollThunk } from "@/store/sports/polls-slice";
import { selectAllGroups, selectPollById, isPollExpired } from "@/store/sports/selectors";
import { StatusBadge } from "../components/status-badge";
import { ROUTES } from "@/constants";
import { formatDate, formatRelative } from "@/utils/date";
import { cn } from "@/utils/cn";

export function PollDetailsPage() {
  const params = useParams<{ pollId: string }>();
  const dispatch = useAppDispatch();
  const poll = useAppSelector((state) => selectPollById(state, params.pollId));
  const groups = useAppSelector(selectAllGroups);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!poll) {
      dispatch(fetchPollsThunk());
    }
  }, [dispatch, poll]);

  const group = useMemo(
    () => groups.find((g) => g.id === poll?.groupId),
    [groups, poll?.groupId]
  );

  if (!poll) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Polls", href: ROUTES.SPORTS_POLLS },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          icon={BarChart3}
          title="Poll not found"
          description="This poll may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_POLLS}>Back to polls</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const isClosed = poll.status === "Closed" || isPollExpired(poll.expiresAt);
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const leadingOption = poll.options.reduce(
    (max, option) => (option.votes > max.votes ? option : max),
    poll.options[0]
  );
  const isTied =
    poll.options.filter((o) => o.votes === leadingOption.votes).length > 1;

  const handleVote = async (optionId: string) => {
    if (isClosed) return;
    try {
      await dispatch(votePollThunk({ pollId: poll.id, optionId })).unwrap();
    } catch {
      dispatch(voteToggled({ pollId: poll.id, optionId }));
    }

    dispatch(
      notificationAdded({
        title: "Vote recorded",
        message: "Your vote was saved.",
        variant: "success",
      })
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard unavailable — still confirm in demo mode
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
    dispatch(
      notificationAdded({
        title: "Poll link copied",
        message: "Share it with members so they can cast their vote.",
        variant: "success",
      })
    );
  };

  return (
    <PageContainer as="main" className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Polls", href: ROUTES.SPORTS_POLLS },
          { label: poll.question },
        ]}
        className="mb-4"
      />

      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={isClosed ? "Closed" : "Active"} />
            {group ? <Badge variant="gradient">{group.name}</Badge> : null}
            {poll.multipleChoice ? (
              <Badge variant="secondary">Multiple choice</Badge>
            ) : null}
          </div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
            {poll.question}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created by {poll.createdBy} · {formatRelative(poll.createdAt)}
          </p>
        </div>
        <Button asChild variant="ghost" className="shrink-0">
          <Link href={ROUTES.SPORTS_POLLS}>
            <ArrowLeft />
            Back to polls
          </Link>
        </Button>
      </div>

      <Card className="animate-fade-in-up mt-8 p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">
            {poll.votedOptionIds.length > 0 ? "Your votes" : "Cast your vote"}
          </h2>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
            <Users className="h-4 w-4 text-accent" />
            {totalVotes} votes
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {!isClosed
            ? poll.multipleChoice
              ? "Select every option you support."
              : "Select one option to register your vote."
            : "This poll is closed — results are shown below."}
        </p>

        <div className="mt-5 space-y-3">
          {poll.options.map((option) => {
            const percent =
              totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const voted = poll.votedOptionIds.includes(option.id);
            const isLeading =
              !isTied && option.id === leadingOption.id && totalVotes > 0;

            return (
              <button
                key={option.id}
                type="button"
                disabled={isClosed}
                onClick={() => handleVote(option.id)}
                aria-pressed={voted}
                className={cn(
                  "group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all sm:p-5",
                  voted
                    ? "border-accent/60 bg-brand-gradient-soft shadow-sm"
                    : "border-border/70 hover:border-accent/40",
                  !isClosed ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 bg-brand-gradient transition-all duration-500",
                    voted ? "opacity-25" : "opacity-15"
                  )}
                  style={{ width: `${percent}%` }}
                />
                <span className="relative flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all",
                        poll.multipleChoice ? "rounded-md" : "rounded-full",
                        voted ? "border-accent bg-accent" : "border-input"
                      )}
                    >
                      {voted ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : null}
                    </span>
                    <span className="truncate text-sm font-bold sm:text-base">
                      {option.label}
                    </span>
                    {isLeading ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        <Crown className="h-3 w-3" />
                        Leading
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm font-extrabold tabular-nums text-muted-foreground">
                    {option.votes} · {percent}%
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {poll.votedOptionIds.length > 0 ? (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-gradient-soft px-3 py-1.5 text-xs font-bold text-accent">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Thanks for voting — tap an option again to change your vote
          </p>
        ) : null}
      </Card>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card className="animate-fade-in-up p-6 [animation-delay:80ms]">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Trophy className="h-4 w-4 text-accent" />
            Result summary
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Total votes</dt>
              <dd className="font-extrabold">{totalVotes}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Current leader</dt>
              <dd className="font-extrabold">
                {totalVotes === 0 || isTied
                  ? "No leader yet"
                  : leadingOption.label}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Your participation</dt>
              <dd className="font-extrabold">
                {poll.votedOptionIds.length > 0 ? "Voted" : "Not voted"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Options</dt>
              <dd className="font-extrabold">{poll.options.length}</dd>
            </div>
          </dl>
        </Card>

        <Card className="animate-fade-in-up p-6 [animation-delay:160ms]">
          <h2 className="text-lg font-extrabold tracking-tight">Timeline</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-extrabold">{formatDate(poll.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Last activity</dt>
              <dd className="font-extrabold">{formatDate(poll.updatedAt)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                {!isClosed ? "Closes" : "Closed"}
              </dt>
              <dd className="font-extrabold">{formatDate(poll.expiresAt)}</dd>
            </div>
          </dl>
          <Button
            variant="outline"
            className="mt-5 w-full rounded-full"
            onClick={handleShare}
          >
            {copied ? <Check /> : <Share2 />}
            {copied ? "Link copied" : "Share poll"}
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}
