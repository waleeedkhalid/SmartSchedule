import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { describe, expect, it } from "vitest";

describe("HomePage", () => {
  it("renders main heading", () => {
    render(<HomePage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});
