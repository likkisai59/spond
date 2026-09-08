import { describe, it, expect } from "vitest";
import {
  capitalize,
  getInitials,
  formatCount,
  formatCurrency,
  formatTime,
  pathToBreadcrumbs,
  formatFilePath,
  sleep,
} from "../helpers";

describe("Helper Utilities", () => {
  describe("capitalize", () => {
    it("capitalizes the first letter of a string", () => {
      expect(capitalize("football")).toBe("Football");
      expect(capitalize("team")).toBe("Team");
    });

    it("handles already capitalized string", () => {
      expect(capitalize("Tennis")).toBe("Tennis");
    });
  });

  describe("getInitials", () => {
    it("extracts initials from a single or multi-word name", () => {
      expect(getInitials("Virat Kohli")).toBe("VK");
      expect(getInitials("Rahul")).toBe("R");
      expect(getInitials("Lionel Andres Messi")).toBe("LA");
    });

    it("returns 'S' for empty or null names", () => {
      expect(getInitials("")).toBe("S");
      expect(getInitials(null)).toBe("S");
      expect(getInitials(undefined)).toBe("S");
    });
  });

  describe("formatCount", () => {
    it("formats thousands with 'k'", () => {
      expect(formatCount(1500)).toBe("1.5k");
      expect(formatCount(10000)).toBe("10.0k");
    });

    it("formats millions with 'M'", () => {
      expect(formatCount(2500000)).toBe("2.5M");
    });

    it("returns raw number as string when < 1000", () => {
      expect(formatCount(42)).toBe("42");
      expect(formatCount(0)).toBe("0");
    });
  });

  describe("formatCurrency", () => {
    it("formats number to INR currency", () => {
      const formatted = formatCurrency(1500);
      expect(formatted).toContain("1,500");
    });
  });

  describe("formatTime", () => {
    it("formats 24h time to 12h AM/PM", () => {
      expect(formatTime("09:00")).toBe("9:00 AM");
      expect(formatTime("14:30")).toBe("2:30 PM");
      expect(formatTime("00:15")).toBe("12:15 AM");
      expect(formatTime("12:00")).toBe("12:00 PM");
      expect(formatTime("23:59")).toBe("11:59 PM");
    });

    it("returns original value for invalid format", () => {
      expect(formatTime("invalid")).toBe("invalid");
    });
  });

  describe("pathToBreadcrumbs", () => {
    it("creates breadcrumb array from route pathname", () => {
      const crumbs = pathToBreadcrumbs("/sports/groups/team-alpha");
      expect(crumbs).toHaveLength(4);
      expect(crumbs[0]).toEqual({ label: "Home", href: "/" });
      expect(crumbs[1]).toEqual({ label: "Sports", href: "/sports" });
      expect(crumbs[2]).toEqual({ label: "Groups", href: "/sports/groups" });
      expect(crumbs[3]).toEqual({ label: "Team alpha", href: "/sports/groups/team-alpha" });
    });
  });

  describe("formatFilePath", () => {
    it("replaces slashes with breadcrumb separator", () => {
      expect(formatFilePath("sports/groups/doc.pdf")).toBe("sports › groups › doc.pdf");
      expect(formatFilePath("sports\\venues\\photo.jpg")).toBe("sports › venues › photo.jpg");
    });
  });

  describe("sleep", () => {
    it("resolves after the given milliseconds", async () => {
      const start = Date.now();
      await sleep(50);
      expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    });
  });
});
