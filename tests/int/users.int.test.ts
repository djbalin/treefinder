import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { beforeAll, describe, expect, it } from "vitest";

let payload: Payload;

describe("users collection", () => {
  beforeAll(async () => {
    payload = await getPayload({ config });
  });

  it("is reachable through the Local API", async () => {
    const users = await payload.find({ collection: "users" });

    expect(users.docs).toBeInstanceOf(Array);
  });

  it("does not let anonymous visitors create admins", async () => {
    await expect(
      payload.create({
        collection: "users",
        data: { email: "visitor@example.com", password: "not-allowed" },
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });
});
