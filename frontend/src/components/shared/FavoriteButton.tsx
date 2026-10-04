"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { favoritesService, FavoriteItem } from "@/services/favoritesService";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, "savedAt">;
  className?: string;
}

export function FavoriteButton({ item, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkFavoriteStatus = async () => {
      try {
        const favorites = await favoritesService.getFavorites();
        setIsFavorited(favorites.some((f) => f.id === item.id));
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [user, item.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save favorites.");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setIsLoading(true);
      if (isFavorited) {
        await favoritesService.removeFavorite(item.id);
        setIsFavorited(false);
        toast.success(`Removed ${item.name} from favorites`);
      } else {
        await favoritesService.addFavorite({ ...item, savedAt: new Date().toISOString() });
        setIsFavorited(true);
        toast.success(`Added ${item.name} to favorites`);
      }
    } catch {
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full shadow-md backdrop-blur-md transition-all ${
        isFavorited
          ? "bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 border border-rose-200"
          : "bg-white/80 text-muted-foreground hover:bg-white hover:text-rose-500 border border-border"
      } ${className}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
    </Button>
  );
}
