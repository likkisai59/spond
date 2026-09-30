import { api } from "./api";

export interface FavoriteItem {
  id: string;
  name: string;
  type: "artist" | "venue";
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceStartingAt: number;
  image: string;
  savedAt: string;
}

export const favoritesService = {
  getFavorites: async (): Promise<FavoriteItem[]> => {
    const res = await api.get("/favorites");
    return res.data.data;
  },

  addFavorite: async (item: FavoriteItem): Promise<void> => {
    await api.post("/favorites", item);
  },

  removeFavorite: async (id: string): Promise<void> => {
    await api.delete(`/favorites/${id}`);
  },
};
