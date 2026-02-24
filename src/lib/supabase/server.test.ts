import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock, cookiesMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

import { createClient } from "./server";

describe("supabase server client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("creates a server client with cookie adapters", async () => {
    const cookieStore = {
      getAll: vi.fn().mockReturnValue([{ name: "sb", value: "token" }]),
      set: vi.fn(),
    };
    cookiesMock.mockResolvedValue(cookieStore);
    createServerClientMock.mockReturnValue({ kind: "client" });

    await createClient();

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });
});
