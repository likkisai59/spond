"use client";

import { useMemo, useState } from "react";
import { MessageSquarePlus, Star, Upload } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { REVIEW_SUBJECT_TYPES, type ReviewSubjectType } from "@/types";
import { ROUTES } from "@/constants";
import { MOCK_ARTISTS, MOCK_BANDS, MOCK_REVIEWS, MOCK_VENUES } from "../mocks/band.mock";
import { ReviewCard } from "../components/review-card";
import { StarRatingInput } from "../components/rating-stars";
import type { BandReview } from "@/types";
import { cn } from "@/utils/cn";

function ReviewFormModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: Omit<BandReview, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState(0);
  const [subjectType, setSubjectType] = useState<ReviewSubjectType>("Band");
  const [subjectName, setSubjectName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const subjectOptions = useMemo(() => {
    if (subjectType === "Band") return MOCK_BANDS.map((b) => b.name);
    if (subjectType === "Artist") return MOCK_ARTISTS.map((a) => a.name);
    return MOCK_VENUES.map((v) => v.name);
  }, [subjectType]);

  const handleSubmit = () => {
    if (rating === 0 || subjectName.length === 0 || title.trim().length === 0 || content.trim().length === 0) {
      dispatch(
        notificationAdded({
          title: "Review incomplete",
          message: "Add a rating, subject, title and a few words about the experience.",
          variant: "info",
        })
      );
      return;
    }
    onSubmit({
      author: "You",
      authorRole: "Verified booker",
      subjectName,
      subjectType,
      rating,
      title: title.trim(),
      content: content.trim(),
      eventDate: new Date().toISOString().slice(0, 10),
    });
    setRating(0);
    setSubjectType("Band");
    setSubjectName("");
    setTitle("");
    setContent("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>Write a review</ModalTitle>
          <ModalDescription>
            Share how the performance or venue worked out for your event.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Your rating</Label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="review-subject-type">Reviewing a</Label>
              <Select
                value={subjectType}
                onValueChange={(value) => {
                  setSubjectType(value as ReviewSubjectType);
                  setSubjectName("");
                }}
              >
                <SelectTrigger id="review-subject-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_SUBJECT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review-subject-name">Name</Label>
              <Select value={subjectName} onValueChange={setSubjectName}>
                <SelectTrigger id="review-subject-name">
                  <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-title">Headline</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Sum up the experience"
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-content">Your review</Label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What stood out? Would you book again?"
              rows={4}
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSubmit}>
            Publish review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function ReviewsPage() {
  const dispatch = useAppDispatch();
  const [reviews, setReviews] = useState<BandReview[]>(MOCK_REVIEWS);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const summary = useMemo(() => {
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((r) => r.rating === stars).length,
    }));
    return { total, average, distribution };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter === "all") return sorted;
    return sorted.filter((review) => review.rating === Number(filter));
  }, [reviews, filter]);

  const handleSubmit = (input: Omit<BandReview, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setReviews((current) => [
      {
        ...input,
        id: `rev-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
    dispatch(
      notificationAdded({
        title: "Review published",
        message: `Thanks for reviewing ${input.subjectName} (demo mode).`,
        variant: "success",
      })
    );
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Reviews" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Reviews"
        description="What hosts and promoters say about the marketplace."
        actions={
          <Button variant="accent" onClick={() => setFormOpen(true)}>
            <MessageSquarePlus />
            Write a review
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px,1fr]">
        <div className="space-y-6">
          <div className="animate-fade-in-up rounded-lg border border-border/70 bg-card p-6 text-center shadow-card">
            <p className="text-5xl font-extrabold tracking-tight">
              {summary.average.toFixed(1)}
            </p>
            <div className="mt-2 flex justify-center">
              <span className="inline-flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(summary.average)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              {summary.total} review{summary.total === 1 ? "" : "s"} across bands,
              artists and venues
            </p>

            <div className="mt-5 space-y-2">
              {summary.distribution.map(({ stars, count }) => {
                const percent =
                  summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setFilter(String(stars))}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-muted/60"
                    aria-label={`Filter by ${stars} star reviews`}
                  >
                    <span className="inline-flex w-8 items-center gap-1 text-xs font-bold text-muted-foreground">
                      {stars}
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-brand-gradient"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="w-8 text-right text-xs font-bold tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            {filter !== "all" ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setFilter("all")}
              >
                Clear filter
              </Button>
            ) : null}
          </div>

          <div className="animate-fade-in-up rounded-lg border border-border/70 bg-brand-gradient-soft p-6 [animation-delay:80ms]">
            <p className="text-sm font-extrabold tracking-tight">
              Performed somewhere recently?
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Reviews help hosts find reliable acts — yours takes under a minute.
            </p>
            <Button
              variant="accent"
              size="sm"
              className="mt-4 w-full rounded-full"
              onClick={() => setFormOpen(true)}
            >
              <MessageSquarePlus />
              Write a review
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              {filter === "all"
                ? "All reviews"
                : `${filter}-star reviews`}{" "}
              <Badge variant="secondary" className="ml-1">
                {filteredReviews.length}
              </Badge>
            </h2>
          </div>
          <div className="mt-4">
            {filteredReviews.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <EmptyCard
                icon={Upload}
                title="No reviews here yet"
                description="Be the first to share an experience with the marketplace."
                action={
                  <Button variant="accent" onClick={() => setFormOpen(true)}>
                    <MessageSquarePlus />
                    Write a review
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      <ReviewFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
