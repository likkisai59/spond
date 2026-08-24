const isClientSide = (): boolean => typeof window !== "undefined";

export const storage = {
  get<T>(key: string): T | null {
    if (!isClientSide()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isClientSide()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  },

  remove(key: string): void {
    if (!isClientSide()) return;
    window.localStorage.removeItem(key);
  },

  clear(): void {
    if (!isClientSide()) return;
    window.localStorage.clear();
  },
};
