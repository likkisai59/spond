import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  requiredStringSchema,
  idSchema,
} from "../validations";

describe("Validation Schemas (Zod)", () => {
  describe("emailSchema", () => {
    it("accepts valid email addresses", () => {
      expect(emailSchema.parse("test@example.com")).toBe("test@example.com");
      expect(emailSchema.parse("  user.name@domain.co.in  ")).toBe("user.name@domain.co.in");
    });

    it("rejects empty string", () => {
      expect(() => emailSchema.parse("")).toThrow("Email is required");
      expect(() => emailSchema.parse("   ")).toThrow("Email is required");
    });

    it("rejects invalid email formats", () => {
      expect(() => emailSchema.parse("plainaddress")).toThrow("Enter a valid email address");
      expect(() => emailSchema.parse("missing@domain")).toThrow("Enter a valid email address");
      expect(() => emailSchema.parse("@missingusername.com")).toThrow("Enter a valid email address");
    });
  });

  describe("passwordSchema", () => {
    it("accepts passwords with >=8 chars, letters, and numbers", () => {
      expect(passwordSchema.parse("Password123")).toBe("Password123");
      expect(passwordSchema.parse("Str0ng!Pass")).toBe("Str0ng!Pass");
    });

    it("rejects passwords shorter than 8 characters", () => {
      expect(() => passwordSchema.parse("Pass1")).toThrow("at least 8 characters");
    });

    it("rejects passwords without letters", () => {
      expect(() => passwordSchema.parse("123456789")).toThrow("must contain at least one letter");
    });

    it("rejects passwords without numbers", () => {
      expect(() => passwordSchema.parse("PasswordOnly")).toThrow("must contain at least one number");
    });
  });

  describe("nameSchema", () => {
    it("accepts valid full names", () => {
      expect(nameSchema.parse("John Doe")).toBe("John Doe");
      expect(nameSchema.parse("Mary-Jane O'Connor")).toBe("Mary-Jane O'Connor");
    });

    it("rejects names shorter than 2 characters", () => {
      expect(() => nameSchema.parse("A")).toThrow("at least 2 characters");
    });

    it("rejects names longer than 64 characters", () => {
      const longName = "A".repeat(65);
      expect(() => nameSchema.parse(longName)).toThrow("at most 64 characters");
    });

    it("rejects names containing digits", () => {
      expect(() => nameSchema.parse("John123")).toThrow("cannot contain numbers");
    });
  });

  describe("requiredStringSchema", () => {
    it("accepts valid non-empty string", () => {
      const schema = requiredStringSchema("Title", 3);
      expect(schema.parse("Valid Title")).toBe("Valid Title");
    });

    it("rejects string shorter than min length", () => {
      const schema = requiredStringSchema("Category", 2);
      expect(() => schema.parse(" ")).toThrow("Category is required");
    });
  });

  describe("idSchema", () => {
    it("accepts non-empty id", () => {
      expect(idSchema.parse("60d5ecb8b392d438e83b1234")).toBe("60d5ecb8b392d438e83b1234");
    });

    it("rejects empty id", () => {
      expect(() => idSchema.parse("")).toThrow("valid id is required");
    });
  });
});
