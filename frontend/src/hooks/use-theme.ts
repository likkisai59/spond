"use client";

import { useTheme as useNextThemes } from "next-themes";
import { useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface UseThemeReturn {
  theme: ThemeMode | undefined;
  resolvedTheme: "light" | "dark" | undefined;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const { theme, resolvedTheme, setTheme } = useNextThemes();

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return {
    theme: theme as ThemeMode | undefined,
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
    setTheme,
    toggleTheme,
  };
}
