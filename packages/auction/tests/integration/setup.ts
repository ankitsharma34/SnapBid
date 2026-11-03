import { afterAll, afterEach, beforeAll } from "vitest";

import { prisma } from "@snapbid/database";

import { assertSafeTestDatabaseUrl } from "./database-safety.mjs";
import { cleanupTestData } from "./fixtures.js";

beforeAll(async () => {
  assertSafeTestDatabaseUrl(process.env.DATABASE_URL);
  await prisma.$connect();
});

afterEach(cleanupTestData);
afterAll(() => prisma.$disconnect());
