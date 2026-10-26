/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_jobs from "../admin/jobs.js";
import type * as admin_pages from "../admin/pages.js";
import type * as admin_photos from "../admin/photos.js";
import type * as admin_species from "../admin/species.js";
import type * as checks from "../checks.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_localize from "../lib/localize.js";
import type * as lib_publishing from "../lib/publishing.js";
import type * as pages from "../pages.js";
import type * as photos from "../photos.js";
import type * as pipeline_data from "../pipeline/data.js";
import type * as pipeline_drafting from "../pipeline/drafting.js";
import type * as pipeline_photos from "../pipeline/photos.js";
import type * as returns from "../returns.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as species from "../species.js";
import type * as testing from "../testing.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/jobs": typeof admin_jobs;
  "admin/pages": typeof admin_pages;
  "admin/photos": typeof admin_photos;
  "admin/species": typeof admin_species;
  checks: typeof checks;
  "lib/admin": typeof lib_admin;
  "lib/localize": typeof lib_localize;
  "lib/publishing": typeof lib_publishing;
  pages: typeof pages;
  photos: typeof photos;
  "pipeline/data": typeof pipeline_data;
  "pipeline/drafting": typeof pipeline_drafting;
  "pipeline/photos": typeof pipeline_photos;
  returns: typeof returns;
  seed: typeof seed;
  seedData: typeof seedData;
  species: typeof species;
  testing: typeof testing;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
