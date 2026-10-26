import { afterEach, describe, expect, it, vi } from "vitest";

async function loadRouting() {
  vi.resetModules();
  return import("@/i18n/routing");
}

describe("i18n routing", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("serves Danish only while English is disabled", async () => {
    vi.stubEnv("ENABLE_ENGLISH", "");
    const { routing, isAppLocale } = await loadRouting();

    expect(routing.defaultLocale).toBe("da");
    expect(routing.locales).toEqual(["da"]);
    expect(isAppLocale("da")).toBe(true);
    expect(isAppLocale("en")).toBe(false);
  });

  it("adds English when the flag is on", async () => {
    vi.stubEnv("ENABLE_ENGLISH", "true");
    const { routing, isAppLocale } = await loadRouting();

    expect(routing.locales).toEqual(["da", "en"]);
    expect(isAppLocale("en")).toBe(true);
  });

  it("rejects unknown locales", async () => {
    const { isAppLocale } = await loadRouting();

    expect(isAppLocale("de")).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
  });
});
