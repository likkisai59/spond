import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttendanceBadge } from "../attendance-badge";

describe("AttendanceBadge Component", () => {
  it("renders 'Present' when response is 'Going'", () => {
    render(<AttendanceBadge response="Going" />);
    expect(screen.getByText("Present")).toBeDefined();
  });

  it("renders 'Absent' when response is 'No response'", () => {
    render(<AttendanceBadge response="No response" />);
    expect(screen.getByText("Absent")).toBeDefined();
  });

  it("renders 'Maybe' when response is 'Maybe'", () => {
    render(<AttendanceBadge response="Maybe" />);
    expect(screen.getByText("Maybe")).toBeDefined();
  });

  it("renders 'Present' and 'Absent' directly when passed", () => {
    const { rerender } = render(<AttendanceBadge response="Present" />);
    expect(screen.getByText("Present")).toBeDefined();

    rerender(<AttendanceBadge response="Absent" />);
    expect(screen.getByText("Absent")).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(<AttendanceBadge response="Going" className="custom-test-class" />);
    const badge = container.querySelector(".custom-test-class");
    expect(badge).toBeDefined();
  });
});
