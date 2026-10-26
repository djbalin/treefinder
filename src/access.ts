import type { Access, Where } from "payload";

/** Any logged-in user is an admin (only admins have accounts in v1). */
export const isAdmin: Access = ({ req }) => Boolean(req.user);

/** Admins see everything; visitors only see documents matching `where`. */
export function adminOr(where: Where): Access {
  return ({ req }) => (req.user ? true : where);
}

export const anyone: Access = () => true;
