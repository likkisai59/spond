"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  mobileNavClosed,
  mobileNavOpened,
  sidebarCollapseSet,
  sidebarToggled,
} from "@/store/slices/ui-slice";
import {
  selectMobileNavOpen,
  selectSidebarCollapsed,
} from "@/store/selectors";
import { STORAGE_KEYS } from "@/utils/constants";
import { storage } from "@/utils/storage";

export interface UseSidebarReturn {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

export function useSidebar(): UseSidebarReturn {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(selectSidebarCollapsed);
  const isMobileOpen = useAppSelector(selectMobileNavOpen);

  useEffect(() => {
    storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, isCollapsed);
  }, [isCollapsed]);

  return {
    isCollapsed,
    toggle: () => dispatch(sidebarToggled()),
    setCollapsed: (collapsed: boolean) =>
      dispatch(sidebarCollapseSet(collapsed)),
    isMobileOpen,
    openMobile: () => dispatch(mobileNavOpened()),
    closeMobile: () => dispatch(mobileNavClosed()),
  };
}
