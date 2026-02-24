import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock the server supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the product heading and auth links", async () => {
    const Component = await HomePage();
    render(Component);

    expect(screen.getByRole("heading", { name: /turntogether/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });
});
