import { describe, expect, it, vi } from "vitest";

const { updateSessionMock } = vi.hoisted(() => ({
  updateSessionMock: vi.fn(),
}));

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: updateSessionMock,
}));

import { middleware } from "./middleware";

describe("middleware entrypoint", () => {
  it("delegates requests to updateSession", async () => {
    const request = { nextUrl: { pathname: "/dashboard" } } as any;
    updateSessionMock.mockResolvedValue({ ok: true });

    const response = await middleware(request);

    expect(updateSessionMock).toHaveBeenCalledWith(request);
    expect(response).toEqual({ ok: true });
  });
});
