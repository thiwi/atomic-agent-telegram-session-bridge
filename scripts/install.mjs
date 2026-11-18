import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { root, upstream, patch, requireNode, targetArgument, run, output, npm } from "./runtime.mjs";

try {
  requireNode();
  const target = targetArgument(process.argv.slice(2));
  if (existsSync(target)) throw new Error("The target already exists. Choose a new directory with --target.");
  mkdirSync(dirname(target), { recursive: true });
  run("git", ["-c", "core.autocrlf=false", "clone", "--config", "core.autocrlf=false", "--depth", "1", "--branch", upstream.tag, upstream.url, target]);
  if (output("git", ["rev-parse", "HEAD"], target) !== upstream.commit) {
    throw new Error("The upstream revision does not match the supported commit. No patch was applied.");
  }
  run("git", ["apply", "--check", patch], target);
  run("git", ["apply", patch], target);
  npm(["ci", "--no-audit", "--no-fund"], target);
  npm(["run", "build"], target);
  const config = join(root, ".runtime-path.json");
  const temporary = config + ".tmp";
  writeFileSync(temporary, JSON.stringify({ path: target }, null, 2) + "\n");
  renameSync(temporary, config);
  console.log("Installed. Verify with: node scripts/verify.mjs");
  console.log("Start with: node scripts/run.mjs tui");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
