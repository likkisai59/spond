import { notImplemented } from "@/utils/helpers";
import type { ApiResponse, Paginated, PaginationQuery, SportsFile } from "@/types";

export interface FileQuery extends PaginationQuery {
  folder?: string;
}

export interface FilesService {
  list(query?: FileQuery): Promise<ApiResponse<Paginated<SportsFile>>>;
  upload(input: unknown): Promise<ApiResponse<SportsFile>>;
  remove(id: string): Promise<ApiResponse<void>>;
}

import { apiClient } from "../api-client";

export const filesService: FilesService = {
  list: async (query) => {
    return apiClient.get("/api/v1/files", { params: query });
  },
  upload: async (input) => {
    // Input must be FormData
    return apiClient.post("/api/v1/files/upload", input, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  remove: async (id) => {
    return apiClient.delete(`/api/v1/files/${id}`);
  },
};
