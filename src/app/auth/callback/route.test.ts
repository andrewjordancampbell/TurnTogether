import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, redirectMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  redirectMock: vi.fn().mockImplementation((url: string) => ({ url: new URL(url) })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: redirectMock,
  },
}));

import { GET } from "./route";

describe("auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectMock.mockImplementation((url: string) => ({ url: new URL(url) }));
  });

  it("exchanges the code and redirects to the requested internal path", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    createClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession },
    });

    const request = new Request(
      "https://turntogether.app/auth/callback?code=abc&next=%2Fclubs"
    );

    const response = await GET(request);

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.url.pathname).toBe("/clubs");
  });

  it("rejects unsafe redirect targets", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    createClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession },
    });

    const request = new Request(
      "https://turntogether.app/auth/callback?code=abc&next=https%3A%2F%2Fevil.com"
    );

    const response = await GET(request);

    expect(response.url.pathname).toBe("/dashboard");
  });

  it("redirects to login on missing code", async () => {
    const request = new Request(
      "https://turntogether.app/auth/callback"
    );

    const response = await GET(request);

    expect(response.url.pathname).toBe("/login");
  });
});
