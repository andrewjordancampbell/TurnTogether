import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, redirectMock, revalidatePathMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  redirectMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { login, loginWithGoogle } from "./actions";

describe("login actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "https://turntogether.app";
  });

  it("logs in with email/password and redirects to dashboard", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    createClientMock.mockResolvedValue({
      auth: { signInWithPassword },
    });

    const formData = new FormData();
    formData.set("email", "reader@example.com");
    formData.set("password", "secret123");

    await login(formData);

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "reader@example.com",
      password: "secret123",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects with error when login fails", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        signInWithPassword: vi
          .fn()
          .mockResolvedValue({ error: { message: "Invalid credentials" } }),
      },
    });

    const formData = new FormData();
    formData.set("email", "reader@example.com");
    formData.set("password", "wrong");

    await login(formData);

    expect(redirectMock).toHaveBeenCalledWith(
      "/login?error=Invalid%20credentials"
    );
  });

  it("starts Google OAuth flow and redirects to provider URL", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: "https://auth.example.com/google" },
      error: null,
    });
    createClientMock.mockResolvedValue({
      auth: { signInWithOAuth },
    });

    await loginWithGoogle();

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://turntogether.app/auth/callback",
      },
    });
    expect(redirectMock).toHaveBeenCalledWith("https://auth.example.com/google");
  });
});
