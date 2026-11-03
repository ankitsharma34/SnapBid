import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { assertSafeTestDatabaseUrl } from "./database-safety.mjs";

const integrationDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(integrationDirectory, "../..");
const repositoryRoot = resolve(packageDirectory, "../..");
const envFile = join(packageDirectory, ".env.test");
const exampleEnvFile = join(packageDirectory, ".env.test.example");

loadEnvFile(existsSync(envFile) ? envFile : exampleEnvFile);

assertSafeTestDatabaseUrl(process.env.DATABASE_URL);

const executable = (name) =>
  join(
    repositoryRoot,
    "node_modules",
    ".bin",
    process.platform === "win32" ? `${name}.cmd` : name,
  );

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, NODE_ENV: "test" },
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run(
  executable("prisma"),
  ["migrate", "deploy", "--config", "prisma.config.ts"],
  join(repositoryRoot, "packages", "database"),
);
run(
  executable("vitest"),
  ["run", "--config", "vitest.integration.config.ts"],
  packageDirectory,
);
