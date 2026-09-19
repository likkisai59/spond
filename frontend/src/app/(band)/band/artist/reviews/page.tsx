"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewList } from "@/components/reviews/ReviewList";

export default function ReviewsPage() {
  return (
    <PageContainer as="main">
      <PageHeader 
        title="Reviews" 
        description="View your past reviews and ratings." 
      />
      <div className="mt-8">
        <ReviewList 
          reviews={[]}
          emptyTitle="No reviews yet"
          emptyMessage="You haven't received any reviews yet. Complete bookings to gather feedback!"
        />
      </div>
    </PageContainer>
  );
}
