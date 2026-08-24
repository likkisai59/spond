import { notImplemented } from "@/utils/helpers";
import type { ApiResponse, Paginated, PaginationQuery } from "@/types";
import { artistsService } from "./artists.service";
import { bandsService } from "./bands.service";
import { venuesService } from "./venues.service";
import { bookingsService } from "./bookings.service";

export interface BandListingQuery extends PaginationQuery {
  categoryId?: string;
}

export interface BandService {
  getOverview(): Promise<ApiResponse<unknown>>;
  listListings(query: BandListingQuery): Promise<ApiResponse<Paginated<unknown>>>;
}

export const bandService: BandService = {
  getOverview: () => notImplemented("bandService.getOverview"),
  listListings: () => notImplemented("bandService.listListings"),
};

export {
  artistsService,
  bandsService,
  venuesService,
  bookingsService,
};
