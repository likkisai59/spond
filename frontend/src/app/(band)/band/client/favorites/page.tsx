import React from 'react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';
import { Heart } from 'lucide-react';
import { EmptyCard } from '@/components/cards/empty-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClientFavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
        <p className="text-muted-foreground mt-2">
          Your saved bands, artists, and venues.
        </p>
      </div>
      
      <PagePlaceholder title="No favorites yet">
        <EmptyCard
          title="No favorites yet"
          description="You haven&apos;t saved any bands or venues to your favorites yet. Start browsing the marketplace to find your next favorite act!"
          icon={Heart}
          action={
            <Button asChild>
              <Link href="/band/marketplace/bands">Browse Marketplace</Link>
            </Button>
          }
        />
      </PagePlaceholder>
    </div>
  );
}
