import { notImplemented } from "@/utils/helpers";
import type { ApiResponse } from "@/types";

export interface SportsDashboardService {
  getOverview(): Promise<ApiResponse<unknown>>;
  getActivity(): Promise<ApiResponse<unknown>>;
}

export const sportsDashboardService: SportsDashboardService = {
  getOverview: () => notImplemented("sportsDashboardService.getOverview"),
  getActivity: () => notImplemented("sportsDashboardService.getActivity"),
};
