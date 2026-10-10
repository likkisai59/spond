import { create } from "zustand";
import { favoritesService, FavoriteItem } from "@/services/favoritesService";

interface FavoritesState {
  favorites: FavoriteItem[];
  loaded: boolean;
  loading: boolean;
  fetchFavorites: () => Promise<void>;
  addFavorite: (item: FavoriteItem) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorited: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loaded: false,
  loading: false,

  fetchFavorites: async () => {
    // Only fetch once; avoid parallel fetches
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const data = await favoritesService.getFavorites();
      set({ favorites: Array.isArray(data) ? data : [], loaded: true });
    } catch {
      set({ favorites: [], loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  addFavorite: async (item: FavoriteItem) => {
    await favoritesService.addFavorite(item);
    set((s) => ({
      favorites: s.favorites.some((f) => f.id === item.id)
        ? s.favorites
        : [...s.favorites, item],
    }));
  },

  removeFavorite: async (id: string) => {
    await favoritesService.removeFavorite(id);
    set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) }));
  },

  isFavorited: (id: string) => get().favorites.some((f) => f.id === id),
}));
