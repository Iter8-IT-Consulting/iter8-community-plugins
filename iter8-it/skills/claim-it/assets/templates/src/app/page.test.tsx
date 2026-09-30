import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { site } from "./site";

describe("Home", () => {
  it("shows the app name and purpose", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: site.name })).toBeInTheDocument();
    expect(screen.getByText(site.purpose)).toBeInTheDocument();
  });
});
