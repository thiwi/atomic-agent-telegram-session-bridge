import test from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { findNpmCli, requireNode, targetArgument } from "../scripts/runtime.mjs";
import { scanText } from "../scripts/privacy.mjs";

test("requires the minimum supported Node version", () => {
  assert.throws(() => requireNode("24.10.0"), /25.7/);
  assert.throws(() => requireNode("25.6.0"), /25.7/);
  assert.doesNotThrow(() => requireNode("25.7.0"));
  assert.doesNotThrow(() => requireNode("26.0.0"));
});

test("accepts target directories containing spaces without shell quoting", () => {
  assert.equal(targetArgument(["--target", "example runtime"]), resolve("example runtime"));
  assert.throws(() => targetArgument(["--force"]), /Usage/);
  assert.throws(() => targetArgument(["--target"]), /Usage/);
});

test("resolves npm through the Node installation on Windows", () => {
  const cli = join("/node", "node_modules", "npm", "bin", "npm-cli.js");
  assert.equal(findNpmCli({
    node: join("/node", "node.exe"), platform: "win32", env: {}, separator: ";",
    exists: file => file === cli, realpath: file => file,
  }), cli);
});

test("resolves a PATH npm symlink on POSIX systems", () => {
  const executable = join("/tools", "npm");
  const cli = join("/packages", "npm", "bin", "npm-cli.js");
  assert.equal(findNpmCli({
    node: join("/node", "bin", "node"), platform: "linux", env: { PATH: "/tools" }, separator: ":",
    exists: file => file === executable || file === cli,
    realpath: file => file === executable ? cli : file,
  }), cli);
});

test("reports a missing npm installation clearly", () => {
  assert.throws(() => findNpmCli({
    node: "/missing/node", env: {}, exists: () => false,
  }), /npm-cli/);
});

test("detects credentials without including them in findings", () => {
  const token = ["123456789", "A".repeat(35)].join(":");
  assert.deepEqual(scanText(token), ["Telegram bot token"]);
  const home = ["", "Users", "example-user", "private"].join("/");
  assert.deepEqual(scanText(home), ["Personal home directory"]);
  const key = ["-----BEGIN", "PRIVATE KEY-----"].join(" ");
  assert.deepEqual(scanText(key), ["Private key"]);
  assert.deepEqual(scanText("<YOUR_BOT_TOKEN>"), []);
});
