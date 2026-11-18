import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { root } from "./runtime.mjs";

export function scanText(text) {
  const findings = [];
  if (/\b\d{6,16}:[A-Za-z0-9_-]{30,}\b/u.test(text)) findings.push("Telegram bot token");
  if (/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/u.test(text)) findings.push("GitHub token");
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u.test(text)) findings.push("Private key");
  if (/\/(?:Users|home)\/[A-Za-z0-9._-]+\//u.test(text)) findings.push("Personal home directory");
  if (/[A-Za-z0-9._%+-]+@(?:gmail|googlemail|icloud|outlook|hotmail)\.com/iu.test(text)) findings.push("Personal email address");
  return findings;
}

export function scanDirectory(directory = root) {
  const ignored = new Set([".git", "node_modules", "runtime", ".runtime-path.json"]);
  const findings = [];
  function visit(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (ignored.has(entry.name) || entry.name.endsWith(".log")) continue;
      const file = join(folder, entry.name);
      if (entry.isSymbolicLink()) {
        findings.push(`${relative(directory, file)}: symlink requires manual review`);
      } else if (entry.isDirectory()) {
        visit(file);
      } else {
        for (const issue of scanText(readFileSync(file, "utf8"))) findings.push(`${relative(directory, file)}: ${issue}`);
      }
    }
  }
  visit(directory);
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const findings = scanDirectory();
  if (findings.length) {
    console.error(findings.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Privacy scan passed. No detected credentials, personal home paths, or personal email addresses.");
  }
}
