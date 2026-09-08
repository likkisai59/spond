import { apiClient } from "@/services/api-client";
import type { ApiResponse, Paginated, SportsGroup } from "@/types";

export interface GroupQuery {
  category?: string;
}

export interface GroupsService {
  list(query?: GroupQuery): Promise<ApiResponse<Paginated<SportsGroup>>>;
  getById(id: string): Promise<ApiResponse<SportsGroup>>;
  create(input: unknown): Promise<ApiResponse<SportsGroup>>;
  addMember(groupId: string, input: unknown): Promise<ApiResponse<SportsGroup>>;
  removeMember(groupId: string, memberId: string): Promise<ApiResponse<void>>;
}

export const groupsService: GroupsService = {
  list: async (query) => {
    const { data } = await apiClient.get("/api/v1/sports/groups", { params: query });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/api/v1/sports/groups/${id}`);
    return data;
  },
  create: async (input) => {
    const { data } = await apiClient.post("/api/v1/sports/groups", input);
    return data;
  },
  addMember: async (groupId, input) => {
    const { data } = await apiClient.post(`/api/v1/sports/groups/${groupId}/members`, input);
    return data;
  },
  removeMember: async (groupId, memberId) => {
    const { data } = await apiClient.delete(`/api/v1/sports/groups/${groupId}/members/${memberId}`);
    return data;
  },
};
