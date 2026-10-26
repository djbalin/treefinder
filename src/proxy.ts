import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16 renamed the `middleware` file convention to `proxy`. next-intl's
// helper is still called `createMiddleware`; it is exported here under the
// name the runtime looks for.
export const proxy = createMiddleware(routing);

export const config = {
  // Every path except the admin, API routes, Next internals and files with
  // an extension. Those have no locale.
  matcher: ["/((?!admin|api|_next|.*\\..*).*)"],
};
