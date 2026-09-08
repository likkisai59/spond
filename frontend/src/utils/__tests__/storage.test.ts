import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "../storage";

describe("Storage Utility", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores and retrieves objects as JSON", () => {
    const user = { id: "123", name: "Alice", role: "member" };
    storage.set("test_user", user);

    const retrieved = storage.get<{ id: string; name: string; role: string }>("test_user");
    expect(retrieved).toEqual(user);
  });

  it("stores and retrieves strings and numbers", () => {
    storage.set("token", "access_jwt_123");
    storage.set("count", 42);

    expect(storage.get<string>("token")).toBe("access_jwt_123");
    expect(storage.get<number>("count")).toBe(42);
  });

  it("returns null for non-existent key", () => {
    expect(storage.get("unknown_key")).toBeNull();
  });

  it("handles corrupted JSON gracefully by returning null", () => {
    window.localStorage.setItem("corrupt", "{invalid:json");
    expect(storage.get("corrupt")).toBeNull();
  });

  it("removes an item correctly", () => {
    storage.set("to_remove", "value");
    storage.remove("to_remove");
    expect(storage.get("to_remove")).toBeNull();
  });

  it("clears all storage items", () => {
    storage.set("key1", "val1");
    storage.set("key2", "val2");
    storage.clear();
    expect(storage.get("key1")).toBeNull();
    expect(storage.get("key2")).toBeNull();
  });
});
