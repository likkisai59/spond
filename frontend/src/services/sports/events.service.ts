import { apiClient } from "@/services/api-client";
import type { ApiResponse, Paginated, SportsEvent } from "@/types";

export interface EventQuery {
  groupId?: string;
  status?: string;
}

export interface EventsService {
  list(query?: EventQuery): Promise<ApiResponse<Paginated<SportsEvent>>>;
  getById(id: string): Promise<ApiResponse<SportsEvent>>;
  create(input: unknown): Promise<ApiResponse<SportsEvent>>;
  setAttendance(id: string, response: unknown): Promise<ApiResponse<SportsEvent>>;
}

export const eventsService: EventsService = {
  list: async (query) => {
    const { data } = await apiClient.get("/api/v1/sports/events", { params: query });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/api/v1/sports/events/${id}`);
    return data;
  },
  create: async (input) => {
    const { data } = await apiClient.post("/api/v1/sports/events", input);
    return data;
  },
  setAttendance: async (id, response) => {
    const { data } = await apiClient.post(`/api/v1/sports/events/${id}/rsvp`, response);
    return data;
  },
};
