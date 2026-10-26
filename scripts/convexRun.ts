import { execFileSync } from "node:child_process";

/** Runs a Convex function through the CLI and returns its JSON result. */
export function convexRun<T>(name: string, args: object = {}): T {
  const output = execFileSync(
    "npx",
    ["convex", "run", name, JSON.stringify(args)],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  return JSON.parse(output) as T;
}
