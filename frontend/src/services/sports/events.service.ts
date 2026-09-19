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
  update(id: string, input: unknown): Promise<ApiResponse<SportsEvent>>;
  delete(id: string): Promise<ApiResponse<void>>;
  setAttendance(id: string, response: unknown): Promise<ApiResponse<SportsEvent>>;
  markAttendance(data: unknown): Promise<ApiResponse<any>>;
  getAttendance(eventId: string): Promise<ApiResponse<{ items: any[] }>>;
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
  update: async (id, input) => {
    const { data } = await apiClient.put(`/api/v1/sports/events/${id}`, input);
    return data;
  },
  delete: async (id) => {
    const { data } = await apiClient.delete(`/api/v1/sports/events/${id}`);
    return data;
  },
  setAttendance: async (id, response) => {
    const { data } = await apiClient.post(`/api/v1/sports/events/${id}/rsvp`, response);
    return data;
  },
  markAttendance: async (payload) => {
    const { data } = await apiClient.post("/api/v1/sports/attendance", payload);
    return data;
  },
  getAttendance: async (eventId: string) => {
    const { data } = await apiClient.get("/api/v1/sports/attendance", { params: { eventId } });
    return data;
  },
};
