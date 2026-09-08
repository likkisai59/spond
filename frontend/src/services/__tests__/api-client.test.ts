import { describe, it, expect, beforeEach } from "vitest";
import { ApiRequestError, getErrorMessage } from "../api-client";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/utils/constants";

describe("API Client & Error Handling", () => {
  describe("ApiRequestError", () => {
    it("identifies 401 Unauthorized errors correctly", () => {
      const err = new ApiRequestError({
        statusCode: 401,
        message: "Invalid token",
        code: "UNAUTHORIZED",
      });
      expect(err.isUnauthorized).toBe(true);
      expect(err.isForbidden).toBe(false);
      expect(err.isNotFound).toBe(false);
      expect(err.isValidationError).toBe(false);
      expect(err.message).toBe("Invalid token");
    });

    it("identifies 403 Forbidden errors correctly", () => {
      const err = new ApiRequestError({
        statusCode: 403,
        message: "Access denied",
        code: "FORBIDDEN",
      });
      expect(err.isForbidden).toBe(true);
      expect(err.isUnauthorized).toBe(false);
    });

    it("identifies 404 Not Found errors correctly", () => {
      const err = new ApiRequestError({
        statusCode: 404,
        message: "Resource missing",
        code: "NOT_FOUND",
      });
      expect(err.isNotFound).toBe(true);
    });

    it("identifies 400 and 422 Validation errors correctly", () => {
      const err400 = new ApiRequestError({
        statusCode: 400,
        message: "Bad request",
        code: "BAD_REQUEST",
      });
      const err422 = new ApiRequestError({
        statusCode: 422,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: { fields: { email: "Invalid email" } },
      });
      expect(err400.isValidationError).toBe(true);
      expect(err422.isValidationError).toBe(true);
      expect(err422.details).toEqual({ fields: { email: "Invalid email" } });
    });
  });

  describe("getErrorMessage", () => {
    it("returns message from ApiRequestError", () => {
      const err = new ApiRequestError({ statusCode: 400, message: "Custom API message" });
      expect(getErrorMessage(err)).toBe("Custom API message");
    });

    it("returns message from standard Error", () => {
      const err = new Error("Standard JS error");
      expect(getErrorMessage(err)).toBe("Standard JS error");
    });

    it("returns fallback for non-error types", () => {
      expect(getErrorMessage(null)).toBe("Something went wrong. Please try again.");
      expect(getErrorMessage("Random string")).toBe("Something went wrong. Please try again.");
    });
  });

  describe("Storage Token Persistence", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it("persists access and refresh tokens correctly", () => {
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, "jwt_access_abc");
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, "jwt_refresh_xyz");

      expect(storage.get(STORAGE_KEYS.ACCESS_TOKEN)).toBe("jwt_access_abc");
      expect(storage.get(STORAGE_KEYS.REFRESH_TOKEN)).toBe("jwt_refresh_xyz");

      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      expect(storage.get(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
      expect(storage.get(STORAGE_KEYS.REFRESH_TOKEN)).toBe("jwt_refresh_xyz");
    });
  });
});
