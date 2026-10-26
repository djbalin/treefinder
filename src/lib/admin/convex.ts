import { fetchMutation, fetchQuery } from "convex/nextjs";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import { adminSecret, requireAdmin } from "./session";

/*
 * Admin calls to Convex from the server. Every call checks the session
 * first and adds the server-held credential, which the Convex admin
 * functions verify again.
 */

type AdminFunction<Type extends "query" | "mutation"> = FunctionReference<
  Type,
  "public",
  { adminSecret?: string }
>;

type ArgsWithoutSecret<F extends AdminFunction<"query" | "mutation">> = Omit<
  FunctionArgs<F>,
  "adminSecret"
>;

// convex/nextjs cannot infer arguments through a generic wrapper.
type Call<F> = (
  fn: F,
  args: object,
) => Promise<FunctionReturnType<F & AdminFunction<"query" | "mutation">>>;

export async function adminQuery<F extends AdminFunction<"query">>(
  fn: F,
  args: ArgsWithoutSecret<F>,
): Promise<FunctionReturnType<F>> {
  await requireAdmin();
  return (fetchQuery as Call<F>)(fn, { ...args, adminSecret: adminSecret() });
}

export async function adminMutation<F extends AdminFunction<"mutation">>(
  fn: F,
  args: ArgsWithoutSecret<F>,
): Promise<FunctionReturnType<F>> {
  await requireAdmin();
  return (fetchMutation as Call<F>)(fn, {
    ...args,
    adminSecret: adminSecret(),
  });
}
