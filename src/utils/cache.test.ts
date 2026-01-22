import { beforeEach, describe, expect, test } from "bun:test";
import { InMemoryCache } from "../utils/cache";

describe("InMemoryCache", () => {
  let cache: InMemoryCache<string>;

  beforeEach(() => {
    cache = new InMemoryCache<string>(1); // 1 second TTL
  });

  test("should store and retrieve values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  test("should return null for non-existent keys", () => {
    expect(cache.get("nonexistent")).toBe(null);
  });

  test("should expire values after TTL", async () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(cache.get("key1")).toBe(null);
  });

  test("should clear all values", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");

    cache.clear();

    expect(cache.get("key1")).toBe(null);
    expect(cache.get("key2")).toBe(null);
    expect(cache.size()).toBe(0);
  });

  test("should return correct size", () => {
    expect(cache.size()).toBe(0);

    cache.set("key1", "value1");
    expect(cache.size()).toBe(1);

    cache.set("key2", "value2");
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
  });

  test("should handle complex objects", () => {
    interface TestObject {
      name: string;
      value: number;
    }

    const objectCache = new InMemoryCache<TestObject>(60);
    const testObj: TestObject = { name: "test", value: 42 };

    objectCache.set("obj1", testObj);

    const retrieved = objectCache.get("obj1");
    expect(retrieved).toEqual(testObj);
    expect(retrieved?.name).toBe("test");
    expect(retrieved?.value).toBe(42);
  });

  test("should overwrite existing keys", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");

    cache.set("key1", "value2");
    expect(cache.get("key1")).toBe("value2");
  });

  test("should handle multiple keys independently", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");

    expect(cache.get("key1")).toBe("value1");
    expect(cache.get("key2")).toBe("value2");
  });
});
