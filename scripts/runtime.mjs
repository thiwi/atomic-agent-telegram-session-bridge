import { existsSync, readFileSync, realpathSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const upstream = {
  url: "https://github.com/AtomicBot-ai/atomic-agent.git",
  tag: "v0.8.0",
  commit: "6d1f14fcd4ae08e592a71fe52f0146c5aa7bab64",
};
export const patch = join(root, "patches", "atomic-agent-v0.8.0.patch");

export function requireNode(version = process.versions.node) {
  const [major, minor] = version.split(".").map(Number);
  if (major < 25 || (major === 25 && minor < 7)) {
    throw new Error("Atomic Agent requires Node.js 25.7 or newer.");
  }
}

export function targetArgument(args) {
  if (args.length === 0) return resolve(root, "runtime");
  if (args.length !== 2 || args[0] !== "--target" || !args[1]) {
    throw new Error("Usage: node scripts/install.mjs [--target <new-directory>]");
  }
  return resolve(args[1]);
}

export function runtimePath() {
  const file = join(root, ".runtime-path.json");
  if (!existsSync(file)) throw new Error("Run node scripts/install.mjs first.");
  const value = JSON.parse(readFileSync(file, "utf8")).path;
  if (typeof value !== "string" || !existsSync(join(value, "dist", "cli", "index.js"))) {
    throw new Error("The runtime is missing or incomplete. Install it in a new directory.");
  }
  return value;
}

export function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status ?? result.signal}.`);
}

export function output(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", shell: false, windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || `${command} failed.`);
  return result.stdout.trim();
}

export function findNpmCli({
  node = process.execPath,
  env = process.env,
  platform = process.platform,
  separator = delimiter,
  exists = existsSync,
  realpath = realpathSync,
} = {}) {
  const candidates = [
    env.npm_execpath,
    join(dirname(node), "node_modules", "npm", "bin", "npm-cli.js"),
    join(dirname(node), "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
  ].filter(Boolean);
  for (const folder of (env.PATH ?? "").split(separator)) {
    const executable = join(folder, platform === "win32" ? "npm.cmd" : "npm");
    if (!exists(executable)) continue;
    if (platform === "win32") candidates.push(join(folder, "node_modules", "npm", "bin", "npm-cli.js"));
    else candidates.push(realpath(executable));
  }
  const cli = candidates.find(candidate => candidate.endsWith(".js") && exists(candidate));
  if (!cli) throw new Error("npm-cli.js was not found. Install Node.js with npm and add it to PATH.");
  return cli;
}

export function npm(args, cwd) {
  run(process.execPath, [findNpmCli(), ...args], cwd);
}
