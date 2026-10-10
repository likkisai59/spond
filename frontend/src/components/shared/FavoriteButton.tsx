"use client";

import React, { useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { FavoriteItem } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favorites-store";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, "savedAt">;
  className?: string;
}

export function FavoriteButton({ item, className }: FavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { fetchFavorites, addFavorite, removeFavorite, isFavorited, loaded, loading } =
    useFavoritesStore();

  // Fetch favorites once when the user is present (shared across all buttons)
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  const favorited = isFavorited(item.id);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save favorites.");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      if (favorited) {
        await removeFavorite(item.id);
        toast.success(`Removed ${item.name} from favorites`);
      } else {
        await addFavorite({ ...item, savedAt: new Date().toISOString() });
        toast.success(`Added ${item.name} to favorites`);
      }
    } catch {
      toast.error("Failed to update favorites. Please try again.");
    }
  };

  const isLoading = !loaded && loading;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full shadow-md backdrop-blur-md transition-all ${
        favorited
          ? "bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 border border-rose-200"
          : "bg-white/80 text-muted-foreground hover:bg-white hover:text-rose-500 border border-border"
      } ${className}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-5 w-5 ${favorited ? "fill-current" : ""}`} />
    </Button>
  );
}

