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

import { signup } from "./actions";

describe("signup action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs up with display name and redirects to dashboard", async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null });
    createClientMock.mockResolvedValue({
      auth: { signUp },
    });

    const formData = new FormData();
    formData.set("display_name", "Ada");
    formData.set("email", "ada@example.com");
    formData.set("password", "password123");

    await signup(formData);

    expect(signUp).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password123",
      options: {
        data: { display_name: "Ada" },
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects with error when signup fails", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({ error: { message: "Email exists" } }),
      },
    });

    const formData = new FormData();
    formData.set("display_name", "Ada");
    formData.set("email", "ada@example.com");
    formData.set("password", "password123");

    await signup(formData);

    expect(redirectMock).toHaveBeenCalledWith(
      "/signup?error=Email%20exists"
    );
  });
});
