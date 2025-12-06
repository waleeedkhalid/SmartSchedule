/**
 * API Cache Tests
 *
 * Tests for client-side caching functionality
 */

import { apiCache } from "@/lib/utils/api-cache";

describe("API Cache", () => {
  beforeEach(() => {
    // Clear all caches before each test
    apiCache.clearAll();
  });

  describe("set and get", () => {
    it("should store and retrieve cached data", () => {
      const data = { id: 1, name: "Test" };
      const userId = "user-123";
      const key = "/api/test";

      apiCache.set(key, data, userId);
      const retrieved = apiCache.get(key, userId);

      expect(retrieved).toEqual(data);
    });

    it("should return null for non-existent keys", () => {
      const retrieved = apiCache.get("/api/nonexistent", "user-123");
      expect(retrieved).toBeNull();
    });

    it("should isolate cache by user ID", () => {
      const data = { id: 1, name: "Test" };
      const key = "/api/test";

      apiCache.set(key, data, "user-1");
      apiCache.set(key, { id: 2, name: "Different" }, "user-2");

      expect(apiCache.get(key, "user-1")).toEqual(data);
      expect(apiCache.get(key, "user-2")).toEqual({ id: 2, name: "Different" });
    });

    it("should support custom TTL", (done) => {
      const data = { id: 1, name: "Test" };
      const key = "/api/test";
      const ttl = 100; // 100ms

      apiCache.set(key, data, "user-123", ttl);
      expect(apiCache.get(key, "user-123")).toEqual(data);

      // Wait for TTL to expire
      setTimeout(() => {
        expect(apiCache.get(key, "user-123")).toBeNull();
        done();
      }, ttl + 50);
    });
  });

  describe("remove", () => {
    it("should remove cached entry", () => {
      const data = { id: 1, name: "Test" };
      const key = "/api/test";
      const userId = "user-123";

      apiCache.set(key, data, userId);
      expect(apiCache.get(key, userId)).toEqual(data);

      apiCache.remove(key, userId);
      expect(apiCache.get(key, userId)).toBeNull();
    });
  });

  describe("invalidatePattern", () => {
    it("should support invalidating by pattern", () => {
      const user = "user-123";
      apiCache.set("/api/users", { id: 1 }, user);
      apiCache.set("/api/posts/1", { id: 1 }, user);

      // Invalidate entries matching users pattern
      apiCache.invalidatePattern("users", user);

      expect(apiCache.get("/api/users", user)).toBeNull();
    });
  });

  describe("clearAll", () => {
    it("should clear all cached entries", () => {
      apiCache.set("/api/test1", { id: 1 }, "user-123");
      apiCache.set("/api/test2", { id: 2 }, "user-123");

      apiCache.clearAll();

      expect(apiCache.get("/api/test1", "user-123")).toBeNull();
      expect(apiCache.get("/api/test2", "user-123")).toBeNull();
    });
  });
});
