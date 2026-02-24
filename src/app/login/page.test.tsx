import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  it("renders email/password login fields and signup link", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /log in to turntogether/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
  });
});
