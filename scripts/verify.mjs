import { npm, requireNode, runtimePath, run } from "./runtime.mjs";

try {
  requireNode();
  const target = runtimePath();
  npm(["run", "lint"], target);
  npm(["run", "imports:check"], target);
  npm(["run", "docs:check"], target);
  npm(["exec", "--", "vitest", "run",
    "src/channels/telegram",
    "src/runtime/composition/runtime-turn-service.test.ts",
    "src/runtime/turn-controller.test.ts",
  ], target);
  npm(["run", "typecheck:tests"], target);
  run(process.execPath, ["--version"]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
