import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatRelative,
  isValidDate,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
} from "../date";

describe("Date Utilities", () => {
  describe("formatDate", () => {
    it("formats ISO string correctly with default pattern", () => {
      const result = formatDate("2026-10-15T10:30:00Z");
      expect(result).toBe("Oct 15, 2026");
    });

    it("formats Date object with custom pattern", () => {
      const date = new Date(2026, 9, 15); // Oct 15, 2026
      const result = formatDate(date, "yyyy-MM-dd");
      expect(result).toBe("2026-10-15");
    });

    it("returns dash for invalid or empty inputs", () => {
      expect(formatDate("")).toBe("—");
      expect(formatDate(null as any)).toBe("—");
      expect(formatDate(undefined as any)).toBe("—");
      expect(formatDate("null")).toBe("—");
      expect(formatDate("undefined")).toBe("—");
      expect(formatDate("not-a-valid-date")).toBe("—");
    });
  });

  describe("formatDateTime", () => {
    it("formats date and time correctly", () => {
      const result = formatDateTime("2026-10-15T14:30:00Z");
      expect(result).toContain("Oct 15, 2026");
    });

    it("returns dash for invalid input", () => {
      expect(formatDateTime("invalid")).toBe("—");
    });
  });

  describe("formatRelative", () => {
    it("formats relative time for a valid date", () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000 * 60 * 5); // 5 minutes ago
      const result = formatRelative(past);
      expect(result).toContain("ago");
    });

    it("returns dash for null/invalid input", () => {
      expect(formatRelative("invalid")).toBe("—");
      expect(formatRelative(null as any)).toBe("—");
    });
  });

  describe("isValidDate", () => {
    it("returns true for valid dates", () => {
      expect(isValidDate("2026-10-15")).toBe(true);
      expect(isValidDate("2026-10-15T10:30:00Z")).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
    });

    it("returns false for invalid values", () => {
      expect(isValidDate("invalid-date")).toBe(false);
      expect(isValidDate("")).toBe(false);
      expect(isValidDate(null as any)).toBe(false);
      expect(isValidDate(undefined as any)).toBe(false);
      expect(isValidDate("null")).toBe(false);
    });
  });
});
