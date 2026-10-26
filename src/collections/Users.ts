import type { CollectionConfig } from "payload";

/**
 * Admins only (product spec §7). There is no public sign-up: the first admin
 * is created through Payload's first-user screen or a seed script, and only
 * logged-in admins can create more.
 */
export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    create: ({ req }) => Boolean(req.user),
  },
  fields: [],
};
