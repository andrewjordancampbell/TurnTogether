import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock, nextResponseNextMock, nextResponseRedirectMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  nextResponseNextMock: vi.fn(),
  nextResponseRedirectMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: nextResponseNextMock,
    redirect: nextResponseRedirectMock,
  },
}));

import { updateSession } from "./middleware";

function buildRequest(pathname: string) {
  return {
    cookies: {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    },
    nextUrl: {
      pathname,
      clone: vi.fn().mockImplementation(() => ({
        pathname,
      })),
    },
  } as any;
}

describe("supabase middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextResponseNextMock.mockImplementation(({ request }: { request: any }) => ({
      kind: "next",
      request,
      cookies: {
        set: vi.fn(),
      },
    }));
    nextResponseRedirectMock.mockImplementation((url: { pathname: string }) => ({
      kind: "redirect",
      url,
    }));
  });

  it("redirects anonymous users from protected routes to /login", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });
    const request = buildRequest("/dashboard");

    const response = await updateSession(request);

    expect(response.kind).toBe("redirect");
    expect(response.url.pathname).toBe("/login");
  });

  it("allows anonymous users on public routes", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });
    const request = buildRequest("/login");

    const response = await updateSession(request);

    expect(response.kind).toBe("next");
    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
  });
});
