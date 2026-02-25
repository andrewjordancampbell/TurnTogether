import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  signup: vi.fn(),
}));

vi.mock("../login/actions", () => ({
  loginWithGoogle: vi.fn(),
}));

vi.mock("@/components/error-message", () => ({
  ErrorMessage: () => null,
}));

import SignupPage from "./page";

describe("SignupPage", () => {
  it("renders the signup form fields", async () => {
    const page = await SignupPage({ searchParams: Promise.resolve({}) });
    render(page);

    expect(screen.getByRole("heading", { name: /join turntogether/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });
});
