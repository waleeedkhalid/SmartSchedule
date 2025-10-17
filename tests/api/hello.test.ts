import { GET } from "@/app/api/hello/route";
import { describe, expect, it } from "vitest";

describe("API /api/hello", () => {
  it("returns hello message", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ message: "Hello from API" });
  });
});
