import { notImplemented } from "@/utils/helpers";
import type { ApiResponse, Paginated, PaginationQuery, SportsPoll } from "@/types";

export interface PollQuery extends PaginationQuery {
  groupId?: string;
  status?: string;
}

export interface PollsService {
  list(query?: PollQuery): Promise<ApiResponse<Paginated<SportsPoll>>>;
  getById(id: string): Promise<ApiResponse<SportsPoll>>;
  create(input: unknown): Promise<ApiResponse<SportsPoll>>;
  vote(pollId: string, optionIds: string[]): Promise<ApiResponse<SportsPoll>>;
}

export const pollsService: PollsService = {
  list: () => notImplemented("pollsService.list"),
  getById: () => notImplemented("pollsService.getById"),
  create: () => notImplemented("pollsService.create"),
  vote: () => notImplemented("pollsService.vote"),
};
