export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export type SortDirection = "asc" | "desc";

export type Nullable<T> = T | null;

export type AsyncState = "idle" | "loading" | "succeeded" | "failed";
