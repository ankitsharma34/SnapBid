import { beforeAll } from "vitest";

import { assertSafeTestDatabaseUrl } from "./database-safety.mjs";

beforeAll(() => {
  assertSafeTestDatabaseUrl(process.env.DATABASE_URL);
});
