import { notImplemented } from "@/utils/helpers";
import type { ApiResponse, Paginated, PaginationQuery } from "@/types";
import { sportsDashboardService } from "./sports.service";
import { groupsService } from "./groups.service";
import { eventsService } from "./events.service";
import { pollsService } from "./polls.service";
import { paymentsService } from "./payments.service";
import { messagesService } from "./messages.service";
import { filesService } from "./files.service";
import { venuesService } from "./venues.service";
import { bookingsService } from "./bookings.service";

export interface SportsEntityQuery extends PaginationQuery {
  productId?: string;
}

export interface SportsService {
  getOverview(): Promise<ApiResponse<unknown>>;
  listEntities(query: SportsEntityQuery): Promise<ApiResponse<Paginated<unknown>>>;
}

export const sportsService: SportsService = {
  getOverview: () => notImplemented("sportsService.getOverview"),
  listEntities: () => notImplemented("sportsService.listEntities"),
};

export {
  sportsDashboardService,
  groupsService,
  eventsService,
  pollsService,
  paymentsService,
  messagesService,
  filesService,
  venuesService,
  bookingsService,
};
