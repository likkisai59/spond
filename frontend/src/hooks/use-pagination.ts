"use client";

import { useCallback, useMemo, useState } from "react";

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  rangeStart: number;
  rangeEnd: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalItems: (totalItems: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
}

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems: initialTotalItems = 0,
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => {
    setPageState((current) => Math.min(current + 1, totalPages));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setPageState((current) => Math.max(current - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setPageState(initialPage);
  }, [initialPage]);

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (totalItems === 0) return { rangeStart: 0, rangeEnd: 0 };
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return { rangeStart: start, rangeEnd: end };
  }, [currentPage, pageSize, totalItems]);

  return {
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    rangeStart,
    rangeEnd,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    previousPage,
    reset,
  };
}
