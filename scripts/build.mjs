import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });
  if (result.status) process.exit(result.status);
}

const generate = spawnSync(process.execPath, [path.join("node_modules", "prisma", "build", "index.js"), "generate"], {
  stdio: "inherit",
  env: process.env,
  cwd: process.cwd(),
});
if (generate.status) {
  const clientReady = existsSync(path.join("node_modules", ".prisma", "client", "index.js"));
  if (!clientReady) process.exit(generate.status);
  console.warn("Prisma generate could not overwrite a locked file. Continuing with the existing Prisma client.");
}

run(path.join("node_modules", "next", "dist", "bin", "next"), ["build"]);
