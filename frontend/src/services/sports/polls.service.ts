import { apiClient } from "@/services/api-client";
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
  list: async (query) => {
    const { data } = await apiClient.get("/api/v1/sports/polls", { params: query });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/api/v1/sports/polls/${id}`);
    return data;
  },
  create: async (input) => {
    const { data } = await apiClient.post("/api/v1/sports/polls", input);
    return data;
  },
  vote: async (pollId, optionIds) => {
    const { data } = await apiClient.post(`/api/v1/sports/polls/${pollId}/vote`, {
      optionId: optionIds[0],
    });
    return data;
  },
};
