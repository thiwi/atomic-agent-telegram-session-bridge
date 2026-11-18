import { join } from "node:path";
import { spawn } from "node:child_process";
import { requireNode, runtimePath } from "./runtime.mjs";

try {
  requireNode();
  const args = process.argv.slice(2);
  // Keep the caller's working directory: it is the agent's project directory.
  const child = spawn(process.execPath, [join(runtimePath(), "dist", "cli", "index.js"), ...(args.length ? args : ["tui"])], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
    shell: false,
    windowsHide: false,
  });
  child.on("error", error => { console.error(error.message); process.exitCode = 1; });
  child.on("exit", (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
